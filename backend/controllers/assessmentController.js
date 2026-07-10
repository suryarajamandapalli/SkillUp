const axios = require('axios');
const PDFDocument = require('pdfkit');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { isFallback } = require('../config/db');

// Global mock assessments database for fallback mode
global.mockAssessments = global.mockAssessments || [];

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Submit Assessment and Get Prediction
exports.submitAssessment = async (req, res) => {
  const {
    academicPerformance,
    programmingSkills,
    webDevSkills,
    dataSkills,
    securitySkills,
    networkingSkills,
    systemDesignSkills,
    communicationSkills,
    projectManagementSkills,
    interests,
    certifications
  } = req.body;

  try {
    // Send assessment payload to FastAPI ML Service
    let predictionData;
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
        academic_performance: Number(academicPerformance),
        programming_skills: Number(programmingSkills),
        web_dev_skills: Number(webDevSkills),
        data_skills: Number(dataSkills),
        security_skills: Number(securitySkills),
        networking_skills: Number(networkingSkills),
        system_design_skills: Number(systemDesignSkills),
        communication_skills: Number(communicationSkills),
        project_management_skills: Number(projectManagementSkills),
        interests: interests || [],
        certifications: certifications || []
      });
      predictionData = mlResponse.data;
    } catch (mlErr) {
      console.error(`ML Service Error: ${mlErr.message}. Utilizing mock prediction logic.`);
      // Mock ML Response in case FastAPI is offline or model fails
      const careers = ["Software Engineer", "Data Scientist", "DevOps Engineer", "Cyber Security Analyst", "Product Manager", "UI/UX Designer"];
      const randomCareer = careers[Math.floor(Math.random() * careers.length)];
      predictionData = {
        predicted_career: randomCareer,
        confidence: 0.85,
        probability_distribution: {
          "Software Engineer": 0.3,
          "Data Scientist": 0.2,
          "DevOps Engineer": 0.1,
          "Cyber Security Analyst": 0.1,
          "Product Manager": 0.15,
          "UI/UX Designer": 0.15
        },
        missing_skills: [
          { key: "system_design_skills", name: "System Design & Architecture", score: Number(systemDesignSkills), required: 7 }
        ],
        strengths: [
          { key: "programming_skills", name: "Programming & Algorithms", score: Number(programmingSkills) }
        ],
        roadmap: [
          { phase: "Phase 1", timeline: "Months 1-2", objectives: "Fundamentals", tasks: ["Practice core concepts"] },
          { phase: "Phase 2", timeline: "Months 3-4", objectives: "Specialization", tasks: ["Study target frameworks"] }
        ]
      };
    }

    const assessmentPayload = {
      academicPerformance: Number(academicPerformance),
      programmingSkills: Number(programmingSkills),
      webDevSkills: Number(webDevSkills),
      dataSkills: Number(dataSkills),
      securitySkills: Number(securitySkills),
      networkingSkills: Number(networkingSkills),
      systemDesignSkills: Number(systemDesignSkills),
      communicationSkills: Number(communicationSkills),
      projectManagementSkills: Number(projectManagementSkills),
      interests: interests || [],
      certifications: certifications || [],
      predictedCareer: predictionData.predicted_career,
      confidence: predictionData.confidence,
      probabilityDistribution: predictionData.probability_distribution,
      missingSkills: predictionData.missing_skills,
      generalGaps: predictionData.general_gaps || [],
      strengths: predictionData.strengths,
      roadmap: predictionData.roadmap
    };

    if (isFallback()) {
      // Fallback Mode
      const user = global.mockUsers.find(u => u._id === req.user.id);
      const newMockAssessment = {
        _id: new Date().getTime().toString(),
        userId: req.user.id,
        userEmail: user ? user.email : 'unknown@demo.com',
        userName: user ? user.name : 'Unknown User',
        ...assessmentPayload,
        createdAt: new Date()
      };
      global.mockAssessments.push(newMockAssessment);
      res.status(201).json(newMockAssessment);
    } else {
      // MongoDB Mode
      const newAssessment = new Assessment({
        userId: req.user.id,
        ...assessmentPayload
      });
      await newAssessment.save();
      
      // Populate user info for frontend ease
      const populated = await Assessment.findById(newAssessment._id).populate('userId', 'name email');
      res.status(201).json(populated);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Assessment History for User
exports.getUserAssessments = async (req, res) => {
  try {
    if (isFallback()) {
      const history = global.mockAssessments.filter(a => a.userId === req.user.id);
      res.json(history);
    } else {
      const history = await Assessment.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(history);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Assessments (Admin Panel)
exports.getAllAssessments = async (req, res) => {
  try {
    if (isFallback()) {
      res.json(global.mockAssessments);
    } else {
      const allHistory = await Assessment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      res.json(allHistory);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Dashboard/Analytics Statistics
exports.getAnalytics = async (req, res) => {
  try {
    let assessments = [];
    let usersCount = 0;

    if (isFallback()) {
      assessments = global.mockAssessments;
      usersCount = global.mockUsers.length;
    } else {
      assessments = await Assessment.find();
      usersCount = await User.countDocuments();
    }

    // Process counts
    const careerCounts = {};
    const confidenceOverTime = [];
    let totalConfidence = 0;

    assessments.forEach(a => {
      // Career counts
      careerCounts[a.predictedCareer] = (careerCounts[a.predictedCareer] || 0) + 1;
      // Confidence summation
      totalConfidence += a.confidence;
      // Over time plotting
      confidenceOverTime.push({
        date: a.createdAt,
        confidence: a.confidence,
        career: a.predictedCareer
      });
    });

    const averageConfidence = assessments.length > 0 ? (totalConfidence / assessments.length) : 0;

    res.json({
      totalAssessments: assessments.length,
      totalUsers: usersCount,
      careerCounts,
      averageConfidence: roundNum(averageConfidence, 4),
      confidenceOverTime
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper rounding function
function roundNum(num, decs) {
  return Number(Math.round(num + 'e' + decs) + 'e-' + decs);
}

// Generate PDF Report Stream
exports.downloadReportPDF = async (req, res) => {
  const assessmentId = req.params.id;

  try {
    let assessment;
    let studentName = 'Student';
    let studentEmail = '';

    if (isFallback()) {
      assessment = global.mockAssessments.find(a => a._id === assessmentId);
      if (assessment) {
        studentName = assessment.userName || 'Student';
        studentEmail = assessment.userEmail || '';
      }
    } else {
      assessment = await Assessment.findById(assessmentId).populate('userId', 'name email');
      if (assessment && assessment.userId) {
        studentName = assessment.userId.name;
        studentEmail = assessment.userId.email;
      }
    }

    if (!assessment) {
      return res.status(404).json({ msg: 'Assessment report not found' });
    }

    // Initialize PDF Document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream the PDF back directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Career_Report_${assessmentId}.pdf`);
    doc.pipe(res);

    // Styling Tokens (Enterprise Theme Match)
    const PRIMARY_COLOR = '#2563EB';
    const TEXT_COLOR = '#1E293B';
    const MUTED_TEXT = '#64748B';
    const BORDER_COLOR = '#E5E7EB';
    const BG_BOX = '#F8FAFC';

    // 1. Header Section
    doc
      .fillColor(PRIMARY_COLOR)
      .fontSize(20)
      .text('SMART CAREER PREDICTION SYSTEM', { align: 'center', bold: true })
      .moveDown(0.2);
    
    doc
      .fillColor(TEXT_COLOR)
      .fontSize(11)
      .text('AI-Powered Student Career Prediction and Skill Gap Analysis Report', { align: 'center' })
      .moveDown(1.5);

    // Divider Line
    doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(50, 100).lineTo(545, 100).stroke();

    // 2. Profile and Date Info
    doc.moveDown(1);
    doc.fontSize(10).fillColor(MUTED_TEXT);
    doc.text(`Student Name: `, { indirect: true, continued: true }).fillColor(TEXT_COLOR).text(`${studentName}`);
    doc.fillColor(MUTED_TEXT).text(`Email: `, { continued: true }).fillColor(TEXT_COLOR).text(`${studentEmail}`);
    doc.fillColor(MUTED_TEXT).text(`Date Generated: `, { continued: true }).fillColor(TEXT_COLOR).text(`${new Date(assessment.createdAt).toLocaleDateString()}`);
    doc.moveDown(1.5);

    // 3. Highlight Core Result (Prediction Card)
    doc.rect(50, doc.y, 495, 100).fill(BG_BOX).strokeColor(BORDER_COLOR).lineWidth(1).stroke();
    
    // Position text inside prediction card
    const cardY = doc.y + 15;
    doc.fillColor(PRIMARY_COLOR).fontSize(11).text('RECOMMENDED CAREER PATHWAY', 70, cardY, { bold: true });
    doc.fillColor(TEXT_COLOR).fontSize(18).text(assessment.predictedCareer, 70, cardY + 20, { bold: true });
    doc.fillColor(MUTED_TEXT).fontSize(10).text(`Machine Learning Model Confidence Match: ${(assessment.confidence * 100).toFixed(2)}%`, 70, cardY + 45);
    
    doc.y = cardY + 85; // reset cursor
    doc.moveDown(2);

    // 4. Skills Profile Overview (Academic & Core Ratings)
    doc.fillColor(TEXT_COLOR).fontSize(14).text('Student Competency Profile', 50, doc.y, { bold: true }).moveDown(0.5);
    
    // Skills Table Grid
    const scoreY = doc.y;
    doc.fontSize(10);
    
    const skillsLeft = [
      { label: 'Academic Foundation', val: assessment.academicPerformance },
      { label: 'Programming & Algorithms', val: assessment.programmingSkills },
      { label: 'Web & Frontend Development', val: assessment.webDevSkills },
      { label: 'Data Analysis & Databases', val: assessment.dataSkills },
    ];
    const skillsRight = [
      { label: 'Information & Cyber Security', val: assessment.securitySkills },
      { label: 'Computer Networks & Cloud', val: assessment.networkingSkills },
      { label: 'System Design & Architecture', val: assessment.systemDesignSkills },
      { label: 'Communication & Agile', val: assessment.communicationSkills },
    ];

    let rowY = scoreY;
    for (let i = 0; i < 4; i++) {
      // Left Column
      doc.fillColor(TEXT_COLOR).text(skillsLeft[i].label, 60, rowY);
      doc.fillColor(PRIMARY_COLOR).text(`${skillsLeft[i].val} / 10`, 240, rowY, { bold: true });
      // Right Column
      doc.fillColor(TEXT_COLOR).text(skillsRight[i].label, 300, rowY);
      doc.fillColor(PRIMARY_COLOR).text(`${skillsRight[i].val} / 10`, 480, rowY, { bold: true });
      rowY += 20;
    }

    doc.y = rowY + 10;
    doc.moveDown(1.5);

    // 5. Skill Gap Analysis
    doc.fillColor(TEXT_COLOR).fontSize(14).text('Targeted Skill Gap Analysis', 50, doc.y, { bold: true }).moveDown(0.5);
    
    if (assessment.missingSkills && assessment.missingSkills.length > 0) {
      doc.fontSize(10).fillColor(MUTED_TEXT).text(`The following gaps are highlighted between current capabilities and the requirements for a ${assessment.predictedCareer}:`).moveDown(0.8);
      
      // Draw small indicators for missing skills
      assessment.missingSkills.forEach(skill => {
        doc
          .fillColor(TEXT_COLOR)
          .text(`• ${skill.name}: `, { continued: true, bold: true })
          .fillColor('#DC2626') // Red for gap
          .text(`Current: ${skill.score}/10 `)
          .fillColor(MUTED_TEXT)
          .text(`(Target: ${skill.required}/10)`)
          .moveDown(0.4);
      });
    } else {
      doc.fontSize(10).fillColor('#16A34A').text('✔ Excellent! Your current profiles align completely with all required baseline skills for this career path. No immediate functional gaps identified.').moveDown(0.5);
    }

    doc.moveDown(2);

    // 6. Timeline Roadmap (Draw dynamic roadmap phases)
    doc.fillColor(TEXT_COLOR).fontSize(14).text('Personalized Learning & Preparation Roadmap', 50, doc.y, { bold: true }).moveDown(0.5);

    if (assessment.roadmap && assessment.roadmap.length > 0) {
      assessment.roadmap.forEach((phase) => {
        // Check page overflow
        if (doc.y > 700) {
          doc.addPage();
        }
        
        doc
          .fillColor(PRIMARY_COLOR)
          .fontSize(11)
          .text(`${phase.phase} (${phase.timeline})`, { bold: true })
          .fillColor(TEXT_COLOR)
          .fontSize(9)
          .text(`Objective: ${phase.objectives}`)
          .moveDown(0.3);

        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach(task => {
            doc.fillColor(TEXT_COLOR).text(`  - ${task}`).moveDown(0.2);
          });
        }
        doc.moveDown(0.8);
      });
    } else {
      doc.fontSize(10).fillColor(MUTED_TEXT).text('Roadmap not generated. Retake assessment to compute detailed roadmap phases.').moveDown(0.5);
    }

    // 7. Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor(MUTED_TEXT).text('This report is generated automatically by the AI engines of the Smart Career Prediction System. Please share this file with your academic advisor or placement coordinator for further guidance.', { align: 'center' });

    // End stream
    doc.end();
  } catch (err) {
    console.error(`PDF Generation Error: ${err.message}`);
    res.status(500).send('Unable to generate report PDF');
  }
};
