const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log("=== SkillUp Express-FastAPI Success Predictor Verification ===");

  // 1. Test Express prediction proxy to FastAPI
  let predictionResult = null;
  try {
    console.log("\n1. Testing Success Predictor ML proxy endpoint `/api/predict`...");
    const assessmentPayload = {
      cgpa: 8.5,
      programmingSkills: 8,
      problemSolving: 9,
      communication: 8,
      leadership: 7,
      projects: 6,
      internships: 6,
      certifications: 5,
      technicalSkills: 8,
      softSkills: 8,
      interests: ["Web Development", "Machine Learning"],
      certificationsList: ["AWS Certified"]
    };

    const predictRes = await axios.post(`${BACKEND_URL}/predict`, assessmentPayload);
    console.log("✔ Express-FastAPI Success Proxy Success!");
    console.log("Predicted Career Path:", predictRes.data.predicted_career);
    console.log("Career Readiness Score:", predictRes.data.readiness_score);
    console.log("Prediction Confidence:", predictRes.data.confidence);
    console.log("Top Strengths:", predictRes.data.strengths);
    console.log("Top Weaknesses:", predictRes.data.weaknesses);
    console.log("AI Report Length (chars):", predictRes.data.ai_report.length);
    predictionResult = predictRes.data;
  } catch (err) {
    console.error("❌ Express ML proxy failed:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data));
    }
    return;
  }

  // 2. Test Express PDF generator endpoint `/api/pdf`
  try {
    console.log("\n2. Testing Success Report PDF compiler endpoint `/api/pdf`...");
    const pdfRes = await axios.post(`${BACKEND_URL}/pdf`, {
      id: "test_success_report_123",
      assessment: {
        userName: "Surya AI Tester",
        userEmail: "tester@skillup.com",
        cgpa: 8.5,
        programmingSkills: 8,
        problemSolving: 9,
        communication: 8,
        leadership: 7,
        projects: 6,
        internships: 6,
        certifications: 5,
        technicalSkills: 8,
        softSkills: 8,
        predictedCareer: predictionResult.predicted_career,
        confidence: predictionResult.confidence,
        readinessScore: predictionResult.readiness_score,
        strengths: predictionResult.strengths,
        weaknesses: predictionResult.weaknesses,
        aiReport: predictionResult.ai_report,
        createdAt: new Date().toISOString()
      }
    }, {
      responseType: 'arraybuffer'
    });

    console.log("✔ PDF generated successfully! Byte length:", pdfRes.data.byteLength);
    console.log("Saving mock PDF locally to confirm compiles...");
    const outPath = path.join(__dirname, 'test_success_report.pdf');
    fs.writeFileSync(outPath, Buffer.from(pdfRes.data));
    console.log(`✔ Success PDF saved to: ${outPath}`);
  } catch (err) {
    console.error("❌ Express PDF generator failed:", err.message);
  }

  console.log("\n=== Success Predictor Integration Verification Complete ===");
}

runVerification();
