import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Set seed for reproducibility
np.random.seed(42)
num_samples = 2000

# Features:
# 1. cgpa (1-10)
# 2. programming_skills (1-10)
# 3. problem_solving (1-10)
# 4. communication (1-10)
# 5. leadership (1-10)
# 6. projects (1-10)
# 7. internships (1-10)
# 8. certifications (1-10)
# 9. technical_skills (1-10)
# 10. soft_skills (1-10)

data = []
for _ in range(num_samples):
    # Random ratings from 3 to 10
    cgpa = np.random.uniform(5.0, 10.0)
    prog = np.random.randint(3, 11)
    probs = np.random.randint(3, 11)
    comm = np.random.randint(3, 11)
    lead = np.random.randint(3, 11)
    proj = np.random.randint(3, 11)
    intern = np.random.randint(3, 11)
    cert = np.random.randint(3, 11)
    tech = np.random.randint(3, 11)
    soft = np.random.randint(3, 11)
    
    # Calculate a weighted career readiness score (0 - 100)
    # Total potential sum = 10*2.5 + 10*1.5 + 10*1.5 + 10*1.0 + 10*1.0 + 10*1.0 + 10*1.0 + 10*0.5 + 10*1.5 + 10*1.0 = 125
    score_sum = (
        cgpa * 2.5 +
        prog * 1.5 +
        probs * 1.5 +
        comm * 1.0 +
        lead * 1.0 +
        proj * 1.0 +
        intern * 1.0 +
        cert * 0.5 +
        tech * 1.5 +
        soft * 1.0
    )
    
    # Scale score_sum to 0-100 base
    base_score = (score_sum / 125.0) * 100
    
    # Add a small random Gaussian noise representing student luck or presentation skill differences
    noise = np.random.normal(0, 2)
    final_score = np.clip(base_score + noise, 0, 100)
    
    data.append([cgpa, prog, probs, comm, lead, proj, intern, cert, tech, soft, final_score])

# Create DataFrame
columns = [
    "cgpa",
    "programming_skills",
    "problem_solving",
    "communication",
    "leadership",
    "projects",
    "internships",
    "certifications",
    "technical_skills",
    "soft_skills",
    "readiness_score"
]

df = pd.DataFrame(data, columns=columns)

# Separate features and target
X = df.drop("readiness_score", axis=1)
y = df["readiness_score"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest Regressor
regressor = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)
regressor.fit(X_train_scaled, y_train)

# Print metrics
r2 = regressor.score(X_test_scaled, y_test)
print(f"Regressor trained successfully. Test R2 score: {r2:.4f}")

# Save models and scaler
os.makedirs("models", exist_ok=True)
joblib.dump(regressor, "models/regressor_model.joblib")
joblib.dump(scaler, "models/regressor_scaler.joblib")

print("Serialized regressor_model.joblib and regressor_scaler.joblib in the 'models' directory.")
