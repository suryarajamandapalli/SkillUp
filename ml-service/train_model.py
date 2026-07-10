import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

# Define target career paths
CAREERS = [
    "Software Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Cyber Security Analyst",
    "Product Manager",
    "UI/UX Designer"
]

# Set seed for reproducibility
np.random.seed(42)
num_samples = 2000

# Features:
# 1. academic_performance (1-10)
# 2. programming_skills (1-10)
# 3. web_dev_skills (1-10)
# 4. data_skills (1-10)
# 5. security_skills (1-10)
# 6. networking_skills (1-10)
# 7. system_design_skills (1-10)
# 8. communication_skills (1-10)
# 9. project_management_skills (1-10)

data = []
for _ in range(num_samples):
    # Random baseline
    skills = np.random.randint(3, 9, size=9)
    
    # Assign high skills based on chosen career to create strong correlations
    career_choice = np.random.choice(CAREERS)
    
    # Adjust scores based on career profile
    if career_choice == "Software Engineer":
        skills[0] = np.random.randint(6, 11) # academic
        skills[1] = np.random.randint(7, 11) # programming
        skills[2] = np.random.randint(6, 11) # web dev
        skills[6] = np.random.randint(6, 11) # system design
    elif career_choice == "Data Scientist":
        skills[0] = np.random.randint(7, 11) # academic
        skills[1] = np.random.randint(7, 11) # programming
        skills[3] = np.random.randint(7, 11) # data skills
    elif career_choice == "DevOps Engineer":
        skills[1] = np.random.randint(5, 10) # programming
        skills[5] = np.random.randint(7, 11) # networking
        skills[6] = np.random.randint(7, 11) # system design
    elif career_choice == "Cyber Security Analyst":
        skills[4] = np.random.randint(7, 11) # security
        skills[5] = np.random.randint(7, 11) # networking
    elif career_choice == "Product Manager":
        skills[7] = np.random.randint(7, 11) # communication
        skills[8] = np.random.randint(7, 11) # project management
    elif career_choice == "UI/UX Designer":
        skills[2] = np.random.randint(7, 11) # web dev (design side)
        skills[7] = np.random.randint(6, 11) # communication
        
    data.append(list(skills) + [career_choice])

# Create DataFrame
columns = [
    "academic_performance",
    "programming_skills",
    "web_dev_skills",
    "data_skills",
    "security_skills",
    "networking_skills",
    "system_design_skills",
    "communication_skills",
    "project_management_skills",
    "career"
]

df = pd.DataFrame(data, columns=columns)

# Separate features and target
X = df.drop("career", axis=1)
y = df["career"]

# Encode target labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)
model.fit(X_train_scaled, y_train)

# Print accuracy
accuracy = model.score(X_test_scaled, y_test)
print(f"Model successfully trained with test accuracy: {accuracy:.4f}")

# Save models and encoders
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/career_model.joblib")
joblib.dump(scaler, "models/scaler.joblib")
joblib.dump(le, "models/label_encoder.joblib")

print("Serialized career_model.joblib, scaler.joblib, and label_encoder.joblib in the 'models' directory.")
