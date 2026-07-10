const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log("=== API Integration Verification ===");

  // 1. Register a student
  let token = '';
  try {
    console.log("\n1. Testing Student Registration...");
    const regRes = await axios.post(`${BACKEND_URL}/auth/register`, {
      name: "Surya Tester",
      email: "tester@career.com",
      password: "password123",
      role: "student"
    });
    console.log("✔ Registration Success!");
    console.log("User details:", regRes.data.user);
    token = regRes.data.token;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg === 'User already exists') {
      console.log("✔ Registration: User already exists (OK, proceeding to login)");
    } else {
      console.error("❌ Registration Failed:", err.message);
      return;
    }
  }

  // 2. Login the student
  try {
    console.log("\n2. Testing Student Login...");
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: "tester@career.com",
      password: "password123"
    });
    console.log("✔ Login Success!");
    token = loginRes.data.token;
    console.log("Token received:", token.substring(0, 20) + "...");
  } catch (err) {
    console.error("❌ Login Failed:", err.message);
    return;
  }

  // 3. Submit Career Assessment Form
  let assessmentId = '';
  try {
    console.log("\n3. Submitting Career Assessment Scorecard...");
    const headers = { Authorization: `Bearer ${token}` };
    const assessmentPayload = {
      academicPerformance: 8,
      programmingSkills: 9,
      webDevSkills: 8,
      dataSkills: 5,
      securitySkills: 4,
      networkingSkills: 5,
      systemDesignSkills: 7,
      communicationSkills: 8,
      projectManagementSkills: 6,
      interests: ["Web Development", "Machine Learning"],
      certifications: ["None"]
    };

    const predictRes = await axios.post(`${BACKEND_URL}/assessments`, assessmentPayload, { headers });
    console.log("✔ Career Prediction Processed Successfully!");
    console.log("Predicted Career Pathway:", predictRes.data.predictedCareer);
    console.log("Model Confidence Match Score:", predictRes.data.confidence);
    console.log("Gaps Identified Count:", predictRes.data.missingSkills.length);
    console.log("Strengths Identified Count:", predictRes.data.strengths.length);
    console.log("Roadmap Steps Count:", predictRes.data.roadmap.length);
    assessmentId = predictRes.data._id;
  } catch (err) {
    console.error("❌ Assessment Submission Failed:", err.message);
    if (err.response) console.error("Response data:", err.response.data);
    return;
  }

  // 4. Fetch Assessment History
  try {
    console.log("\n4. Retrieving Assessment History...");
    const headers = { Authorization: `Bearer ${token}` };
    const historyRes = await axios.get(`${BACKEND_URL}/assessments`, { headers });
    console.log("✔ History retrieved! Records count:", historyRes.data.length);
  } catch (err) {
    console.error("❌ History fetch failed:", err.message);
  }

  // 5. Fetch Global Analytics Panel Statistics
  try {
    console.log("\n5. Fetching System Analytics Summary...");
    const headers = { Authorization: `Bearer ${token}` };
    const analyticsRes = await axios.get(`${BACKEND_URL}/assessments/analytics`, { headers });
    console.log("✔ Analytics Dashboard retrieved successfully!");
    console.log("Total Evaluations:", analyticsRes.data.totalAssessments);
    console.log("Average Confidence:", analyticsRes.data.averageConfidence);
    console.log("Career Match Counts:", analyticsRes.data.careerCounts);
  } catch (err) {
    console.error("❌ Analytics fetch failed:", err.message);
  }

  console.log("\n=== Integration Verification Complete ===");
}

runVerification();
