import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const STUDENTS_RAW = [
  { name: "Aaditya Sharma", email: "aaditya.sharma@skillup.edu", branch: "Computer Science", cgpa: 9.20, goal: "Software Engineer", progress: 85, score: 91.2 },
  { name: "Aarav Patel", email: "aarav.patel@skillup.edu", branch: "Information Technology", cgpa: 8.50, goal: "Software Engineer", progress: 75, score: 84.5 },
  { name: "Ananya Iyer", email: "ananya.iyer@skillup.edu", branch: "Artificial Intelligence", cgpa: 9.40, goal: "Data Scientist", progress: 90, score: 93.4 },
  { name: "Diya Reddy", email: "diya.reddy@skillup.edu", branch: "Electronics", cgpa: 7.80, goal: "Cyber Security Analyst", progress: 65, score: 74.2 },
  { name: "Ishaan Nair", email: "ishaan.nair@skillup.edu", branch: "Mechanical", cgpa: 7.20, goal: "DevOps Engineer", progress: 50, score: 68.5 },
  { name: "Kabir Joshi", email: "kabir.joshi@skillup.edu", branch: "Civil", cgpa: 6.80, goal: "Product Manager", progress: 40, score: 58.2 },
  { name: "Rohan Gupta", email: "rohan.gupta@skillup.edu", branch: "Computer Science", cgpa: 8.80, goal: "Software Engineer", progress: 80, score: 87.5 },
  { name: "Sai Kiran", email: "sai.kiran@skillup.edu", branch: "Information Technology", cgpa: 7.90, goal: "Web Developer", progress: 70, score: 76.4 },
  { name: "Shruti Verma", email: "shruti.verma@skillup.edu", branch: "Artificial Intelligence", cgpa: 9.10, goal: "Machine Learning Engineer", progress: 88, score: 90.8 },
  { name: "Sneha Kulkarni", email: "sneha.kulkarni@skillup.edu", branch: "Electronics", cgpa: 8.30, goal: "Software Engineer", progress: 78, score: 81.2 },
  { name: "Tanvi Rao", email: "tanvi.rao@skillup.edu", branch: "Mechanical", cgpa: 8.10, goal: "Product Manager", progress: 68, score: 79.5 },
  { name: "Vivek Sen", email: "vivek.sen@skillup.edu", branch: "Civil", cgpa: 7.50, goal: "UI/UX Designer", progress: 60, score: 72.4 },
  { name: "Arjun Deshmukh", email: "arjun.deshmukh@skillup.edu", branch: "Computer Science", cgpa: 8.20, goal: "DevOps Engineer", progress: 72, score: 80.8 },
  { name: "Meera Nair", email: "meera.nair@skillup.edu", branch: "Information Technology", cgpa: 8.70, goal: "Data Scientist", progress: 82, score: 86.4 },
  { name: "Rahul Saxena", email: "rahul.saxena@skillup.edu", branch: "Artificial Intelligence", cgpa: 7.60, goal: "Data Scientist", progress: 62, score: 73.5 },
  { name: "Priya Das", email: "priya.das@skillup.edu", branch: "Electronics", cgpa: 9.00, goal: "Cyber Security Analyst", progress: 86, score: 89.2 },
  { name: "Akash Choudhury", email: "akash.choudhury@skillup.edu", branch: "Mechanical", cgpa: 6.90, goal: "Software Engineer", progress: 45, score: 62.4 }
];

const COLLEGES = [
  "Indian Institute of Technology (IIT)",
  "Birla Institute of Technology and Science (BITS)",
  "National Institute of Technology (NIT)",
  "Delhi Technological University (DTU)",
  "Vellore Institute of Technology (VIT)"
];

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aaditya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sai",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Shruti",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Akash"
];

const getUid = (index: number) => `student_seeded_uid_${index + 1}`;
const getReportId = (index: number) => `report_seeded_id_${index + 1}`;

const clearCollection = async (colName: string) => {
  try {
    const snapshot = await getDocs(collection(db, colName));
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(doc(db, colName, docSnap.id));
    });
    await batch.commit();
  } catch (err) {
    console.warn(`Could not clear collection ${colName}:`, err);
  }
};

export const seedDatabase = async (onProgress: (status: string) => void) => {
  onProgress("Clearing old collections...");
  await clearCollection('users');
  await clearCollection('career_ai_reports');
  await clearCollection('assessment_results');
  await clearCollection('career_predictions');
  await clearCollection('ai_reports');
  await clearCollection('activity_logs');

  onProgress("Seeding student profiles and records...");
  for (let i = 0; i < STUDENTS_RAW.length; i++) {
    const raw = STUDENTS_RAW[i];
    const uid = getUid(i);
    const reportId = getReportId(i);
    const photoURL = AVATARS[i % AVATARS.length];
    const college = COLLEGES[i % COLLEGES.length];
    
    const programming = raw.branch === 'Computer Science' || raw.branch === 'Information Technology' || raw.branch === 'Artificial Intelligence' ? 8 + (i % 3) : 4 + (i % 3);
    const probSolving = Math.min(10, Math.round(raw.cgpa + (i % 2)));
    const communication = 6 + (i % 4);
    const leadership = 5 + (i % 5);
    const projectsCount = 2 + (i % 5);
    const internshipsCount = i % 3;
    const certsCount = 1 + (i % 4);
    const techSkillsDepth = 5 + (i % 5);
    const softSkillsDepth = 6 + (i % 4);

    const strengths = [];
    const weaknesses = [];
    if (programming >= 7) strengths.push("Programming Skills");
    else weaknesses.push("Programming Skills");

    if (probSolving >= 8) strengths.push("Problem Solving");
    else weaknesses.push("Problem Solving");

    if (raw.cgpa >= 8.5) strengths.push("Academic Standing (CGPA)");
    else weaknesses.push("Academic Standing (CGPA)");

    if (communication >= 7) strengths.push("Communication");
    else weaknesses.push("Communication");

    if (projectsCount >= 5) strengths.push("Projects Count & Depth");
    else weaknesses.push("Projects Count & Depth");

    const careerReportText = `### Career Summary
Student profile indicates a **Career Readiness Score of ${raw.score}/100** for a path as a **${raw.goal}**. Demonstrates strong alignment in ${strengths.slice(0,2).join(" and ")}.

### Strength Analysis
- **Core Strengths**: You score highly in ${strengths.join(", ")}. These will help pass technical screening.

### Weakness Analysis
- **Development Gaps**: Lower scores in ${weaknesses.join(", ")} may restrict tier-1 options.

### Missing Skills
- Multi-tier deployment architectures.
- Docker containerization setup.
- Advanced cloud framework certifications.

### Personalized Learning Roadmap
- **Phase 1 (Months 1-2)**: Solidify backend and database optimization algorithms.
- **Phase 2 (Months 3-4)**: Deploy a scalable URL shortener using Docker.
- **Phase 3 (Months 5-6)**: Enroll in placement mock interviews and coding marathons.

### Salary Growth Advice
Entry level package ranges between ₹6 LPA to ₹12 LPA depending on projects depth.

### Interview Preparation Tips
1. Formulate dynamic programming checklists.
2. Refine STAR behavioral interview metrics.
`;

    const featureImportanceList = [
      { feature: "Programming Skills", importance: 0.28 },
      { feature: "Projects Count & Depth", importance: 0.22 },
      { feature: "CGPA Score", importance: 0.18 },
      { feature: "Communication", importance: 0.12 },
      { feature: "Internships", importance: 0.10 },
      { feature: "Leadership", importance: 0.06 },
      { feature: "Certifications", importance: 0.04 }
    ];

    const userProfile = {
      uid: uid,
      name: raw.name,
      email: raw.email,
      photoURL: photoURL,
      college: college,
      branch: raw.branch,
      year: "3rd Year",
      phone: `+91 98765 4${i.toString().padStart(4, '0')}`,
      skills: raw.branch === 'Computer Science' || raw.branch === 'Information Technology' ? ['Python', 'SQL', 'React', 'Git'] : ['AutoCAD', 'Excel', 'MATLAB'],
      interests: [raw.branch],
      cgpa: raw.cgpa,
      careerGoal: raw.goal,
      roadmapProgress: raw.progress,
      role: "student",
      latestPrediction: {
        predictedCareer: raw.goal,
        careerReadinessScore: raw.score,
        assessmentId: reportId,
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - (i * 3600 * 1000)).toISOString()
    };

    const assessmentReport = {
      uid: uid,
      userName: raw.name,
      userEmail: raw.email,
      cgpa: raw.cgpa,
      programmingSkills: programming,
      problemSolving: probSolving,
      communication: communication,
      leadership: leadership,
      projects: projectsCount,
      internships: internshipsCount,
      certifications: certsCount,
      technicalSkills: techSkillsDepth,
      softSkills: softSkillsDepth,
      interests: [raw.branch],
      certificationsList: ["AWS Certified Developer"],
      predictedCareer: raw.goal,
      confidence: 0.70 + (i % 26) / 100,
      careerReadinessScore: raw.score,
      featureImportance: featureImportanceList,
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      aiReport: careerReportText,
      createdAt: new Date(Date.now() - (i * 3600 * 1000 * 2)).toISOString()
    };

    const activityLog = {
      timestamp: new Date(Date.now() - (i * 3600 * 1000)).toISOString(),
      user: raw.email,
      action: `Completed placement career success prediction. Recommended path: ${raw.goal}. readiness score: ${raw.score}%`
    };

    await setDoc(doc(db, 'users', uid), userProfile);
    await setDoc(doc(db, 'career_ai_reports', reportId), assessmentReport);
    await setDoc(doc(db, 'assessment_results', reportId), assessmentReport);
    await setDoc(doc(db, 'career_predictions', reportId), {
      uid,
      userName: raw.name,
      predictedCareer: raw.goal,
      readinessScore: raw.score,
      confidence: 0.70 + (i % 26) / 100,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'ai_reports', reportId), {
      uid,
      reportId,
      predictedCareer: raw.goal,
      reportText: careerReportText,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'activity_logs', `log_${i + 1}`), activityLog);
    
    onProgress(`Seeded student ${i + 1}/${STUDENTS_RAW.length}: ${raw.name}`);
  }

  onProgress("database seeded successfully!");
};
