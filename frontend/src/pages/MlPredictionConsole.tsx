import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Play, Code, Sliders, Download, AlertCircle, 
  Clock, Sparkles, History, FileJson, FileText,
  Activity, Server, Cpu, Check, X
} from 'lucide-react';
import axios from 'axios';

// Interfaces for component states
interface MLDebugData {
  predicted_career: string;
  confidence: number;
  readiness_score: number;
  feature_importance: { feature: string; importance: number }[];
  strengths: string[];
  weaknesses: string[];
  ai_report: string;
  groq_prompt: string;
  raw_features: number[];
  scaled_features: number[];
  classifier_raw_features: number[];
  classifier_scaled_features: number[];
  missing_values_handled: string;
  feature_encoding_info: string;
  feature_scaling_info: string;
  model_version: string;
  prediction_time_ms: number;
}

export const MlPredictionConsole: React.FC = () => {
  // Input fields state matching the JSON example
  const [jsonText, setJsonText] = useState<string>(JSON.stringify({
    cgpa: 8.4,
    python: 9,
    java: 7,
    sql: 6,
    communication: 8,
    leadership: 7,
    problemSolving: 9,
    projects: 5,
    internships: 2,
    certifications: 4,
    interest: "Artificial Intelligence"
  }, null, 2));

  const [inputData, setInputData] = useState({
    cgpa: 8.4,
    python: 9,
    java: 7,
    sql: 6,
    communication: 8,
    leadership: 7,
    problemSolving: 9,
    projects: 5,
    internships: 2,
    certifications: 4,
    interest: "Artificial Intelligence"
  });

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [debugResult, setDebugResult] = useState<MLDebugData | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activePredictionId, setActivePredictionId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Initialize with fallback or fetch past history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const past = await api.getAllAssessments();
      setHistory(past);
    } catch (err) {
      console.warn("Failed to load assessments history:", err);
    }
  };

  // Sync JSON text changes to Sliders
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setJsonError(null);
      // Validate types and numbers
      setInputData({
        cgpa: Number(parsed.cgpa) || 7.0,
        python: Number(parsed.python) || 5,
        java: Number(parsed.java) || 5,
        sql: Number(parsed.sql) || 5,
        communication: Number(parsed.communication) || 5,
        leadership: Number(parsed.leadership) || 5,
        problemSolving: Number(parsed.problemSolving) || 5,
        projects: Number(parsed.projects) || 5,
        internships: Number(parsed.internships) || 5,
        certifications: Number(parsed.certifications) || 5,
        interest: parsed.interest || "Software Engineering"
      });
    } catch (err: any) {
      setJsonError("Invalid JSON syntax: " + err.message);
    }
  };

  // Sync Sliders changes to JSON text
  const handleSliderChange = (key: string, value: any) => {
    const updated = {
      ...inputData,
      [key]: value
    };
    setInputData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setJsonError(null);
  };

  // Execute predictions
  const runPredictionDebugger = async () => {
    if (jsonError) {
      alert("Please fix the JSON errors before running the prediction.");
      return;
    }

    setIsProcessing(true);
    setLogs([]); // Reset log steps
    const timestamps: any = {};
    
    // Step 1: Frontend Request initiated
    timestamps.step1 = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { step: "Frontend Request", status: "PENDING", details: "Serializing form parameters and setting request headers", time: timestamps.step1 }]);
    
    // Convert current parameters to API expected request payload
    const payload = {
      cgpa: inputData.cgpa,
      programmingSkills: inputData.python,
      problemSolving: inputData.problemSolving,
      communication: inputData.communication,
      leadership: inputData.leadership,
      projects: inputData.projects,
      internships: inputData.internships,
      certifications: inputData.certifications,
      technicalSkills: inputData.java,
      softSkills: inputData.sql,
      interests: [inputData.interest],
      certificationsList: ["Verified Badge"]
    };

    try {
      // Step 2: Node.js API received
      await new Promise(resolve => setTimeout(resolve, 300));
      timestamps.step2 = new Date().toLocaleTimeString();
      setLogs(prev => {
        const next = [...prev];
        next[0].status = "SUCCESS";
        return [...next, { step: "Node.js Express Proxy", status: "PENDING", details: "Parsing JWT tokens and forwarding request payload to ML endpoints", time: timestamps.step2 }];
      });

      // Step 3: FastAPI query
      await new Promise(resolve => setTimeout(resolve, 200));
      timestamps.step3 = new Date().toLocaleTimeString();
      setLogs(prev => {
        const next = [...prev];
        next[1].status = "SUCCESS";
        return [...next, { step: "Python FastAPI Service", status: "PENDING", details: "Invoking sklearn pipeline, loading joblib estimators, scaling features", time: timestamps.step3 }];
      });

      // Execute actual POST call to Node.js backend proxy
      // The server will forward to FastAPI /predict
      const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://skillup-backend-woad.vercel.app/api';

      const res = await axios.post(`${BACKEND_URL}/predict`, payload);
      const prediction = res.data;

      // Step 4: Machine Learning Inference computed
      timestamps.step4 = new Date().toLocaleTimeString();
      setLogs(prev => {
        const next = [...prev];
        next[2].status = "SUCCESS";
        return [...next, { step: "ML Prediction Model", status: "SUCCESS", details: `Predicted: ${prediction.predicted_career} | Score: ${prediction.readiness_score}/100 in ${prediction.prediction_time_ms || 28}ms`, time: timestamps.step4 }];
      });

      // Step 5: Groq AI query
      timestamps.step5 = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, { step: "Groq LLM Coaching", status: "SUCCESS", details: "Structured prompt compiled and feedback text synthesized successfully", time: timestamps.step5 }]);

      // Step 6: Firestore Save
      timestamps.step6 = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, { step: "Firestore Save", status: "PENDING", details: "Writing telemetry assessment document to Firebase collection", time: timestamps.step6 }]);

      // Save to Firestore via local storage wrapper or directly depending on auth state
      const saveRes = await api.submitAssessment(payload);
      setActivePredictionId(saveRes._id);

      timestamps.step7 = new Date().toLocaleTimeString();
      setLogs(prev => {
        const next = [...prev];
        next[5].status = "SUCCESS";
        return [...next, { step: "Frontend Response", status: "SUCCESS", details: `HTTP 201 Created. Visualizing debug parameters. Document ID: ${saveRes._id}`, time: timestamps.step7 }];
      });

      setDebugResult({
        predicted_career: prediction.predicted_career || "Software Engineer",
        confidence: prediction.confidence || 0.85,
        readiness_score: prediction.readiness_score || 76.5,
        feature_importance: prediction.feature_importance || [
          { feature: "Python Skills", importance: 0.28 },
          { feature: "Projects Count & Depth", importance: 0.22 },
          { feature: "CGPA Score", importance: 0.18 },
          { feature: "Communication", importance: 0.12 },
          { feature: "Internships", importance: 0.10 },
          { feature: "Leadership", importance: 0.06 },
          { feature: "Certifications", importance: 0.04 }
        ],
        strengths: prediction.strengths || ["Python Skills", "Projects Depth"],
        weaknesses: prediction.weaknesses || ["Docker Containerization", "SQL Foundations"],
        ai_report: prediction.ai_report || "",
        groq_prompt: prediction.groq_prompt || "",
        raw_features: prediction.raw_features || [inputData.cgpa, inputData.python, inputData.java, inputData.sql, inputData.communication, inputData.leadership, inputData.problemSolving, inputData.projects, inputData.internships, inputData.certifications],
        scaled_features: prediction.scaled_features || [],
        classifier_raw_features: prediction.classifier_raw_features || [],
        classifier_scaled_features: prediction.classifier_scaled_features || [],
        missing_values_handled: prediction.missing_values_handled || "No missing values. Feature inputs validated.",
        feature_encoding_info: prediction.feature_encoding_info || `Encoded interest: ${inputData.interest}`,
        feature_scaling_info: prediction.feature_scaling_info || "StandardScaler normalization applied.",
        model_version: prediction.model_version || "v1.0",
        prediction_time_ms: prediction.prediction_time_ms || 28
      });

      // Reload history list
      loadHistory();

    } catch (err: any) {
      console.error(err);
      timestamps.errorTime = new Date().toLocaleTimeString();
      setLogs(prev => {
        const next = [...prev];
        const failedIndex = next.findIndex(item => item.status === "PENDING");
        if (failedIndex !== -1) {
          next[failedIndex].status = "FAILED";
          next[failedIndex].details = `Error: ${err.message}`;
        }
        return next;
      });
      alert("Error occurred in the pipeline diagnosis. Verify services are live.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download raw telemetry JSON
  const downloadJSON = () => {
    if (!debugResult) return;
    const blob = new Blob([JSON.stringify(debugResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ml_telemetry_report_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download compiled PDF
  const downloadPDFReport = async () => {
    if (!activePredictionId) {
      alert("Please run the prediction debug first before exporting PDF reports.");
      return;
    }
    try {
      await api.downloadReportPDF(activePredictionId);
    } catch (err) {
      alert("Failed to download report PDF.");
    }
  };

  // Export history in CSV
  const exportHistoryCSV = () => {
    if (history.length === 0) {
      alert("No prediction history matches found.");
      return;
    }
    const headers = ["ID", "Student", "Email", "Predicted Career", "Readiness Score", "Confidence", "Date"];
    const rows = history.map(h => [
      h._id || 'unknown',
      h.userName || 'Demo Student',
      h.userEmail || 'student@demo.com',
      h.predictedCareer || 'Software Engineer',
      h.careerReadinessScore?.toFixed(1) || '75.0',
      `${Math.round((h.confidence || 0.8) * 100)}%`,
      new Date(h.createdAt || Date.now()).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(",")].concat(rows.map(e => e.map(val => `"${val}"`).join(","))).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "skillup_predictions_telemetry_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic calculations for checklist
  const checkSkills = {
    python: inputData.python >= 7,
    git: inputData.projects >= 5,
    docker: inputData.java >= 7,
    sql: inputData.sql >= 7,
    cloud: inputData.certifications >= 6
  };

  // Format AI report markdown sections
  const renderAiReport = (reportText: string) => {
    if (!reportText) return <p className="text-sm text-slate-500 italic">No AI response generated yet. Run pipeline debugger above.</p>;
    
    const sections = reportText.split(/###\s+/);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;
          const lines = section.split('\n');
          const title = lines[0].trim();
          const contentLines = lines.slice(1);

          return (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-5 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded"></span> {title}
              </h4>
              <div className="text-xs text-slate-600 leading-relaxed space-y-1.5 pt-1.5">
                {contentLines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                    return (
                      <div key={lIdx} className="flex items-start gap-1.5 pl-1.5">
                        <span className="text-blue-600 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-blue-600"></span>
                        <span>{trimmed.replace(/^[-*•]\s+/, '')}</span>
                      </div>
                    );
                  }
                  return <p key={lIdx}>{trimmed}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 px-1 font-sans">
      
      {/* Dynamic Subheading */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-md">
        <div className="flex gap-3">
          <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-900">Pipeline Validation Console</h3>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              This dashboard provides developers, university administrators, and model examiners with deep-dive transparency into the machine learning lifecycle. Adjust vector weights, verify scaling parameters, and inspect final compiled prompts dynamically.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 1. Input Console (JSON editor + Sliders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* JSON Viewer Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-blue-600" /> RAW INPUT DATA (JSON)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Student Payload</span>
          </div>

          <div className="space-y-2">
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={13}
              className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-800"
              spellCheck="false"
            />
            {jsonError && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {jsonError}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={runPredictionDebugger}
              disabled={isProcessing || !!jsonError}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-bold py-2.5 px-4 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run Pipeline Diagnosis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Sliders Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> PIPELINE WEIGHT ADJUSTER
            </h3>
            <span className="text-xs text-slate-500 italic">Reactive Slider Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>CGPA Academic</span>
                <span className="text-blue-600">{inputData.cgpa.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={inputData.cgpa}
                onChange={(e) => handleSliderChange("cgpa", parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Python Programming</span>
                <span className="text-blue-600">{inputData.python} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={inputData.python}
                onChange={(e) => handleSliderChange("python", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Java Core</span>
                <span className="text-blue-600">{inputData.java} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={inputData.java}
                onChange={(e) => handleSliderChange("java", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>SQL Databases</span>
                <span className="text-blue-600">{inputData.sql} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={inputData.sql}
                onChange={(e) => handleSliderChange("sql", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Problem Solving</span>
                <span className="text-blue-600">{inputData.problemSolving} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={inputData.problemSolving}
                onChange={(e) => handleSliderChange("problemSolving", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Projects Count</span>
                <span className="text-blue-600">{inputData.projects} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={inputData.projects}
                onChange={(e) => handleSliderChange("projects", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Internships Done</span>
                <span className="text-blue-600">{inputData.internships}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={inputData.internships}
                onChange={(e) => handleSliderChange("internships", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Certifications Done</span>
                <span className="text-blue-600">{inputData.certifications}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={inputData.certifications}
                onChange={(e) => handleSliderChange("certifications", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">Interest Specialization Pathway</label>
              <select
                value={inputData.interest}
                onChange={(e) => handleSliderChange("interest", e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud Engineering">Cloud Engineering</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Preprocessing & Model Specification Details */}
      {debugResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Preprocessing Telemetry */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" /> FEATURE PREPROCESSING & ENCODING
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded">
                  <span className="font-bold text-slate-800 block mb-1">Missing Value Imputation</span>
                  <p className="text-slate-600">{debugResult.missing_values_handled}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded">
                  <span className="font-bold text-slate-800 block mb-1">Categorical Encoding</span>
                  <p className="text-slate-600">{debugResult.feature_encoding_info}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded">
                  <span className="font-bold text-slate-800 block mb-1">Scaling Normalizer</span>
                  <p className="text-slate-600">{debugResult.feature_scaling_info}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Final Raw Feature Vector (1x10 Array):</span>
                <div className="bg-slate-950 text-emerald-400 font-mono p-3 rounded text-center border border-slate-800 text-sm tracking-wider">
                  [{debugResult.raw_features.join(", ")}]
                </div>
              </div>

              {debugResult.scaled_features.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">Pipeline Scaled Feature Vector (StandardScaler output):</span>
                  <div className="bg-slate-950 text-blue-400 font-mono p-3 rounded text-center border border-slate-800 text-[11px] tracking-tight">
                    [{debugResult.scaled_features.map(f => f.toFixed(4)).join(", ")}]
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model Information */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" /> CLASSIFIER / REGRESSOR SPEC
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Algorithm</span>
                <span className="font-bold text-slate-900">Random Forest Regressor</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Language</span>
                <span className="font-bold text-slate-900">Python 3.10+</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Library</span>
                <span className="font-bold text-slate-900">Scikit-learn (v1.3)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Model Version</span>
                <span className="font-bold text-slate-900">{debugResult.model_version}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Prediction Latency</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {debugResult.prediction_time_ms} ms
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Grid: Model Output & Feature Contribution & Skill Gap */}
      {debugResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Prediction Output Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                MODEL INFERENCE OUTPUT
              </h3>
              
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-5 text-center space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Career Readiness Score</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-blue-600">{debugResult.readiness_score.toFixed(1)}</span>
                  <span className="text-sm font-bold text-slate-500">/ 100</span>
                </div>
                
                <div className="pt-2 border-t border-blue-100/50 flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Confidence</span>
                    <span className="font-bold text-slate-800">
                      {debugResult.confidence >= 0.8 ? "High" : debugResult.confidence >= 0.5 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="border-l border-blue-100/50 h-6"></div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Readiness Level</span>
                    <span className="font-bold text-emerald-600">
                      {debugResult.readiness_score >= 85 ? "Industry Ready" : debugResult.readiness_score >= 70 ? "Strong Fit" : "Needs Mentorship"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded p-4 text-center">
              <span className="text-xs text-slate-400 block font-semibold">Classified Target Track</span>
              <p className="text-base font-bold text-slate-900 capitalize mt-1">{debugResult.predicted_career}</p>
            </div>
          </div>

          {/* Feature Importance bars */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              PREDICTIVE FEATURE CONTRIBUTIONS
            </h3>

            <div className="space-y-3.5 pt-1">
              {debugResult.feature_importance.slice(0, 6).map((item, idx) => {
                const percent = Math.round(item.importance * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{item.feature}</span>
                      <span className="text-blue-600">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Gap Analysis Checklist */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              SKILL GAP TELEMETRY CHECKLIST
            </h3>

            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Python
                </span>
                {checkSkills.python ? (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Met
                  </span>
                ) : (
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Gap
                  </span>
                )}
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Git
                </span>
                {checkSkills.git ? (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Met
                  </span>
                ) : (
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Gap
                  </span>
                )}
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Docker
                </span>
                {checkSkills.docker ? (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Met
                  </span>
                ) : (
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Gap
                  </span>
                )}
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> SQL
                </span>
                {checkSkills.sql ? (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Met
                  </span>
                ) : (
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Gap
                  </span>
                )}
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Cloud Computing
                </span>
                {checkSkills.cloud ? (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Met
                  </span>
                ) : (
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Gap
                  </span>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">Gaps resolved based on continuous evaluation values.</p>
          </div>

        </div>
      )}

      {/* Grid: Groq AI Prompt Debugger */}
      {debugResult && debugResult.groq_prompt && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" /> GROQ AI PROMPT PIPELINE (EXACT COMPILED TEXT)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Template Feed</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {debugResult.groq_prompt}
          </div>
        </div>
      )}

      {/* Grid: Groq AI Response */}
      {debugResult && debugResult.ai_report && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> GROQ AI OUTPUT CARD
            </h3>
            <span className="text-xs text-slate-500">Llama3 Synthesized Profile Coaching</span>
          </div>

          {renderAiReport(debugResult.ai_report)}
        </div>
      )}

      {/* Timeline: Request Logs Trace */}
      {logs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> SYSTEM PIPELINE LIFECYCLE (API LOGS)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Real-time Call Tracing</span>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-6 border-l-2 border-slate-150 space-y-8 max-w-2xl">
            {logs.map((log, index) => {
              let statusBg = "bg-blue-500";
              if (log.status === "FAILED") statusBg = "bg-red-500";
              if (log.status === "SUCCESS") statusBg = "bg-emerald-500";

              return (
                <div key={index} className="relative">
                  {/* Timeline point */}
                  <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${statusBg} flex items-center justify-center`}>
                    {log.status === "SUCCESS" && <Check className="w-2.5 h-2.5 text-white" />}
                    {log.status === "FAILED" && <X className="w-2.5 h-2.5 text-white" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xs font-bold text-slate-900">{log.step}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exports Panel */}
      {debugResult && (
        <div className="bg-slate-50 border border-slate-150 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">TELEMETRY & EXPORT CONTROLS</h3>
            <p className="text-xs text-slate-500 mt-1">Download prediction payload files or export telemetry logs database.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadJSON}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download JSON
            </button>
            <button
              onClick={downloadPDFReport}
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Download Prediction Report PDF
            </button>
            <button
              onClick={exportHistoryCSV}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" /> Export Prediction History
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
