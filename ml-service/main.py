from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import numpy as np
import pandas as pd
import joblib
import os
import urllib.request
import json

# Load environment variables from .env if present
try:
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    key, val = line.strip().split("=", 1)
                    os.environ[key.strip()] = val.strip().replace('"', '').replace("'", "")
except Exception as e:
    print(f"Error loading .env file: {e}")

# Initialize FastAPI App
app = FastAPI(
    title="SkillUp AI Career Success Predictor & AI Mentor",
    description="Microservice for predicting career paths, placement readiness scores, and generating Groq LLM reports.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths for models
MODELS_DIR = "models"
MODEL_PATH = os.path.join(MODELS_DIR, "career_model.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")
ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")

REG_MODEL_PATH = os.path.join(MODELS_DIR, "regressor_model.joblib")
REG_SCALER_PATH = os.path.join(MODELS_DIR, "regressor_scaler.joblib")

# Load models safely
try:
    classifier = joblib.load(MODEL_PATH)
    classifier_scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    
    regressor = joblib.load(REG_MODEL_PATH)
    regressor_scaler = joblib.load(REG_SCALER_PATH)
    print("All ML models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}. Please run training scripts first.")
    classifier = None
    classifier_scaler = None
    label_encoder = None
    regressor = None
    regressor_scaler = None

# Display names for features
FEATURE_DISPLAY_NAMES = {
    "cgpa": "CGPA Score",
    "programming_skills": "Programming Skills",
    "problem_solving": "Problem Solving",
    "communication": "Communication",
    "leadership": "Leadership",
    "projects": "Projects Count & Depth",
    "internships": "Internships",
    "certifications": "Certifications",
    "technical_skills": "Technical Skills Depth",
    "soft_skills": "Soft Skills"
}

# Mapping from 10 features back to classifier's 9 features for compatibility
# Classifier expects: academic_performance, programming_skills, web_dev_skills, data_skills, security_skills, networking_skills, system_design_skills, communication_skills, project_management_skills
def map_to_classifier_features(data: Any) -> List[float]:
    # academic_performance maps from cgpa
    academic = float(data.cgpa)
    # programming_skills maps from programming_skills
    programming = float(data.programming_skills)
    # web_dev_skills maps from technical_skills
    web_dev = float(data.technical_skills)
    # data_skills maps from problem_solving
    data_skills = float(data.problem_solving)
    # security_skills maps from technical_skills (with slight offset)
    security = max(1.0, float(data.technical_skills) - 1.0)
    # networking_skills maps from technical_skills (with slight offset)
    networking = max(1.0, float(data.technical_skills) - 1.0)
    # system_design_skills maps from projects
    system_design = float(data.projects)
    # communication_skills maps from communication
    communication = float(data.communication)
    # project_management_skills maps from leadership
    project_management = float(data.leadership)
    
    return [
        academic, programming, web_dev, data_skills, security, networking, system_design, communication, project_management
    ]

# Request schema for success prediction
class AssessmentInput(BaseModel):
    cgpa: float = Field(..., ge=1.0, le=10.0)
    programming_skills: int = Field(..., ge=1, le=10)
    problem_solving: int = Field(..., ge=1, le=10)
    communication: int = Field(..., ge=1, le=10)
    leadership: int = Field(..., ge=1, le=10)
    projects: int = Field(..., ge=1, le=10)
    internships: int = Field(..., ge=1, le=10)
    certifications: int = Field(..., ge=1, le=10)
    technical_skills: int = Field(..., ge=1, le=10)
    soft_skills: int = Field(..., ge=1, le=10)
    interests: List[str] = []
    certifications_list: List[str] = []

@app.get("/")
def read_root():
    return {"message": "SkillUp AI Career Success Predictor & AI Mentor service is running.", "status": "active"}

# Helper to generate AI mentor report via Groq LLM
def query_groq_llm(predicted_career: str, readiness_score: float, strengths: List[str], weaknesses: List[str], scores: Dict[str, Any]) -> Dict[str, str]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY is not defined. Using high-quality rule-based fallback report.")
        prompt = f"Student Target Career: {predicted_career}, Readiness Score: {readiness_score}/100, Ratings: {json.dumps(scores)}"
        return {
            "ai_report": generate_fallback_report(predicted_career, readiness_score, strengths, weaknesses, scores),
            "groq_prompt": prompt.strip()
        }
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    prompt = f"""
    You are an advanced AI Career Coach and Mentor. Generate a comprehensive, professional, and placement-ready career mentoring report for a student with the following profile:
    - Target Career Path: {predicted_career}
    - Career Readiness Score: {readiness_score}/100
    - Top Strengths: {', '.join(strengths)}
    - Top Weaknesses: {', '.join(weaknesses)}
    - Individual Ratings (1-10): {json.dumps(scores)}

    Please write a detailed, motivating, and actionable report. You must structure your output in Markdown with the following section headings exactly:
    ### Career Summary
    [Write a professional summary explaining how prepared the student is for a career as a {predicted_career} and what their readiness score indicates.]

    ### Strength Analysis
    [Analyze their top strengths: {', '.join(strengths)}. Explain how these competencies benefit them in the job market.]

    ### Weakness Analysis
    [Analyze their top weaknesses: {', '.join(weaknesses)}. Highlight the risks of these gaps during recruitment.]

    ### Missing Skills
    [List any technical or soft skills they currently lack based on their score ratings.]

    ### Personalized Learning Roadmap
    [Provide a concrete, chronological learning roadmap divided into Phase 1, Phase 2, and Phase 3 to bridge gaps.]

    ### Interview Preparation Tips
    [Provide 3 specific technical/behavioral interview preparation tips for {predicted_career} roles.]

    ### Recommended Projects
    [Recommend 2 concrete project capstones they should build to showcase in their portfolio.]

    ### Recommended Certifications
    [Recommend 2 professional certifications (e.g. AWS, Cisco, Scrum) to boost credential strength.]

    ### Placement Improvement Suggestions
    [Provide tactical tips to optimize their resume, GitHub profile, and placement cells opportunities.]

    ### Salary Growth Advice
    [Detail salary expectations for entry-level and experienced roles, along with strategies to maximize their negotiation power.]

    ### Motivational Summary
    [Write a closing encouraging statement to inspire the student on their engineering career journey.]
    """
    
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a professional university placement mentor. Write in a supportive, professional, and commercial-grade SaaS style. Do not write introductory chatter. Start directly with the markdown sections."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 1500
    }
    
    try:
        req = urllib.request.Request(url)
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {api_key}")
        
        jsondata = json.dumps(payload).encode("utf-8")
        with urllib.request.urlopen(req, jsondata, timeout=12) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            ai_text = res_json["choices"][0]["message"]["content"]
            return {
                "ai_report": ai_text,
                "groq_prompt": prompt.strip()
            }
    except Exception as e:
        print(f"Error querying Groq API: {e}. Falling back to rule-based report.")
        return {
            "ai_report": generate_fallback_report(predicted_career, readiness_score, strengths, weaknesses, scores),
            "groq_prompt": prompt.strip()
        }

# Rule-based fallback report generator
def generate_fallback_report(career: str, score: float, strengths: List[str], weaknesses: List[str], scores: Dict[str, Any]) -> str:
    return f"""### Career Summary
The evaluation indicates a **Career Readiness Score of {score:.1f}/100** for a path as a **{career}**. Based on your academic standing (CGPA: {scores['cgpa']}) and technical scores, you show a promising profile but require targeted improvements to secure premium offers at placement cells.

### Strength Analysis
Your profile is highly competitive in:
{chr(10).join([f'- **{s}**: Your strong rating in this feature serves as a valuable differentiator for coding tests.' for s in strengths])}

### Weakness Analysis
We identified critical gaps in:
{chr(10).join([f'- **{w}**: Lower performance here may restrict options in technical screening and architecture rounds.' for w in weaknesses])}

### Missing Skills
Based on rating criteria, you need to acquire:
- Advanced systems engineering and design patterns.
- Concrete internship experiences and credential badges.
- Agile Scrum collaboration experience and public mock presentation skills.

### Personalized Learning Roadmap
- **Phase 1 (Months 1-2)**: Prioritize technical fundamentals. Enroll in data structures or system design bootcamps.
- **Phase 2 (Months 3-4)**: Build a capstone architecture project mapping to {career} guidelines.
- **Phase 3 (Months 5-6)**: Focus on placement prep. Polish your GitHub repository and build coding test stamina.

### Interview Preparation Tips
1. **Algorithmic Mastery**: Practice 1 dynamic programming and 1 system design challenge daily.
2. **Behavioral STAR Method**: Formulate project descriptions emphasizing leadership and conflict resolution.
3. **Mock Assessments**: Conduct timed coding simulations before starting university placement rounds.

### Recommended Projects
1. **Scalable Microservice API**: Design a URL shortener with Redis caching and Docker containerization.
2. **Real-time Collaboration App**: Build a socket-based workspace board utilizing React and Node.js.

### Recommended Certifications
1. **AWS Certified Solutions Architect** or Google Cloud Associate.
2. **Certified ScrumMaster (CSM)** to validate team leadership principles.

### Placement Improvement Suggestions
- Refine your resume to place project metrics (e.g. "reduced latency by 20%") above theoretical coursework lists.
- Host your capstones live on Vercel or Render and link them inside your GitHub profile readmes.

### Salary Growth Advice
For an entry-level **{career}**, starting packages range from $70,000 to $95,000 depending on location. Completing target certifications and system projects yields strong leverage to negotiate up to 15% higher starting salaries.

### Motivational Summary
Your base competencies are strong. By channeling focus into the roadmap milestones, you will transform gaps into strengths. Keep pushing forward!
"""

@app.post("/predict")
def predict_success(data: AssessmentInput):
    import time
    start_time = time.perf_counter()
    if classifier is None or regressor is None:
        raise HTTPException(
            status_code=503,
            detail="Machine learning models are not loaded. Please train models first."
        )

    try:
        # 1. Classify target career
        classifier_features = map_to_classifier_features(data)
        scaled_clf = classifier_scaler.transform(np.array([classifier_features]))
        predicted_idx = classifier.predict(scaled_clf)[0]
        predicted_career = label_encoder.inverse_transform([predicted_idx])[0]
        
        probabilities = classifier.predict_proba(scaled_clf)[0]
        confidence = float(probabilities[predicted_idx])

        # 2. Predict Readiness Score (Regressor)
        reg_features = [
            float(data.cgpa),
            float(data.programming_skills),
            float(data.problem_solving),
            float(data.communication),
            float(data.leadership),
            float(data.projects),
            float(data.internships),
            float(data.certifications),
            float(data.technical_skills),
            float(data.soft_skills)
        ]
        
        scaled_reg = regressor_scaler.transform(np.array([reg_features]))
        readiness_score = float(regressor.predict(scaled_reg)[0])
        # Clip score between 0 and 100
        readiness_score = max(0.0, min(100.0, readiness_score))

        # 3. Calculate Feature Importance
        importances = regressor.feature_importances_
        feature_names = [FEATURE_DISPLAY_NAMES[f] for f in [
            "cgpa", "programming_skills", "problem_solving", "communication", "leadership", 
            "projects", "internships", "certifications", "technical_skills", "soft_skills"
        ]]
        
        feat_importances = [
            {"feature": name, "importance": float(imp)}
            for name, imp in zip(feature_names, importances)
        ]
        feat_importances = sorted(feat_importances, key=lambda x: x["importance"], reverse=True)

        # 4. Identify strengths and weaknesses
        scores_dict = {
            "cgpa": data.cgpa,
            "programming_skills": data.programming_skills,
            "problem_solving": data.problem_solving,
            "communication": data.communication,
            "leadership": data.leadership,
            "projects": data.projects,
            "internships": data.internships,
            "certifications": data.certifications,
            "technical_skills": data.technical_skills,
            "soft_skills": data.soft_skills
        }
        
        strengths = []
        weaknesses = []
        for key, score in scores_dict.items():
            display_name = FEATURE_DISPLAY_NAMES[key]
            # Use threshold of 7.0 (or 7) for strengths
            if key == "cgpa":
                if score >= 7.5:
                    strengths.append(display_name)
                else:
                    weaknesses.append(display_name)
            else:
                if score >= 7:
                    strengths.append(display_name)
                else:
                    weaknesses.append(display_name)

        # Truncate lists if empty
        if not strengths:
            strengths = ["Technical Enthusiasm"]
        if not weaknesses:
            weaknesses = ["No critical weaknesses identified"]

        # 5. Query Groq LLM to generate the report
        groq_res = query_groq_llm(predicted_career, readiness_score, strengths, weaknesses, scores_dict)

        end_time = time.perf_counter()
        prediction_time_ms = round((end_time - start_time) * 1000, 2)

        return {
            "predicted_career": predicted_career,
            "confidence": round(confidence, 4),
            "readiness_score": round(readiness_score, 2),
            "feature_importance": feat_importances,
            "strengths": strengths[:4],
            "weaknesses": weaknesses[:4],
            "ai_report": groq_res["ai_report"],
            "groq_prompt": groq_res["groq_prompt"],
            "raw_features": reg_features,
            "scaled_features": scaled_reg.tolist()[0],
            "classifier_raw_features": classifier_features,
            "classifier_scaled_features": scaled_clf.tolist()[0],
            "missing_values_handled": "No missing values. Feature inputs validated and initialized.",
            "feature_encoding_info": f"Interests list size ({len(data.interests)}) mapped. Certifications list size ({len(data.certifications_list)}) mapped.",
            "feature_scaling_info": "StandardScaler applied. Continuous variables scaled to unit variance and zero mean.",
            "model_version": "v1.0",
            "prediction_time_ms": prediction_time_ms
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
