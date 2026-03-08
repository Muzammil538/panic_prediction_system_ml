

# 🏥 AI-Based Panic Attack Risk Prediction System

## 📌 Project Overview

This project is a **Full-Stack AI-Powered Mental Health Risk Prediction System** designed to estimate an individual’s **panic attack risk level** based on psychological, demographic, and workplace-related factors.

The system uses a **Machine Learning classification model** trained on a real-world mental health survey dataset to predict the probability that a person requires mental health treatment. This probability is interpreted as a **panic attack risk score**.

The platform includes:

* Secure Login & Registration
* Role-based access (Patient & Doctor)
* AI-powered risk assessment
* Risk severity classification
* Patient history tracking
* Doctor-patient workflow
* Data visualization dashboards

---

# 🧠 How the System Predicts Panic Attack Risk

The system uses a **supervised machine learning classification model** trained on a mental health dataset.

### Step 1: Data Input

The patient fills out an assessment form including demographic and psychological parameters.

### Step 2: Feature Encoding

The input is converted into numerical format matching the model’s trained feature structure.

### Step 3: Model Prediction

The model calculates:

* Treatment Recommendation (Yes / No)
* Probability Score (0–100%)

### Step 4: Risk Interpretation

Risk Score = Probability of needing treatment × 100

Severity is classified as:

* **Low Risk** → Below 40%
* **Moderate Risk** → 40% – 70%
* **High Risk** → Above 70%

---

# 📊 Parameters Used for Prediction

The system uses the following features:

## 1️⃣ Demographic Parameters

### Age

* Mental health patterns vary across age groups.

### Gender

* Certain mental health risks differ statistically across genders.

### Country

* Cultural and workplace differences influence mental health patterns.

---

## 2️⃣ Employment & Work Environment Factors

### self_employed

* Freelancers/self-employed individuals may face different stress factors.

### no_employees

* Company size impacts workplace support availability.

### remote_work

* Remote work can influence isolation and stress levels.

### tech_company

* Work type affects stress patterns.

---

## 3️⃣ Family & Medical Background

### family_history

* Strong predictor of mental health risk.
* Genetic predisposition increases probability.

---

## 4️⃣ Workplace Mental Health Support

### benefits

* Whether company provides mental health benefits.

### care_options

* Availability of mental health care support.

### wellness_program

* Presence of workplace wellness initiatives.

### seek_help

* Whether employees are encouraged to seek help.

### anonymity

* If anonymity is maintained when reporting mental health issues.

---

## 5️⃣ Psychological & Social Impact Indicators

### work_interfere

* How often mental health interferes with work performance.
* Strong predictor of treatment requirement.

### mental_health_consequence

* Fear of workplace consequences due to mental health.

### phys_health_consequence

* Physical health impact due to mental stress.

### coworkers

* Support level from coworkers.

### supervisor

* Support level from supervisors.

### mental_health_interview

* Comfort discussing mental health during interviews.

### phys_health_interview

* Comfort discussing physical health.

### mental_vs_physical

* Perception of mental health importance vs physical health.

### obs_consequence

* Observed negative consequences due to mental health issues.

---

# 🎯 Why These Parameters Help in Prediction

The machine learning model learns statistical relationships such as:

* Family history increases probability
* Frequent work interference increases severity
* Lack of workplace support increases risk
* Fear of consequences increases treatment likelihood

The algorithm assigns mathematical weights to each parameter based on training data.

It does NOT randomly guess.

It calculates probability based on learned patterns.

---

# 🔐 User Roles

## 👤 Patient

* Register & Login
* Submit Assessment
* View Risk Score
* View Severity
* View Trend Graph
* Send Doctor Request
* Track Doctor Approval Status

## 👨‍⚕️ Doctor

* Login
* View Patient Requests
* Accept Patients
* View Individual Patient Reports
* Monitor Risk Trends

---

# 🏗 System Architecture

Frontend:

* React (Vite)
* Tailwind CSS (Light professional hospital UI)
* Axios (API communication)

Backend:

* Flask
* SQLAlchemy
* SQLite Database
* JWT Authentication
* Bcrypt Password Hashing
* Scikit-learn ML Model

---

# ⚙ Installation & Running Instructions

## 🔹 1. Clone Repository

```bash
git clone <repository_url>
cd project_folder
```

---

## 🔹 2. Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
```

Install dependencies:

```bash
pip install -r requirements.txt

pip install pandas scikit-learn flask flask-cors flask-jwt-extended flask-bcrypt flask-sqlalchemy joblib numpy
```

Ensure these files exist:

* model.pkl
* features.pkl

Run backend:

```bash
python app.py
```

Backend runs at:

```
http://127.0.0.1:5000
```

---

## 🔹 3. Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🧪 Testing the System

1. Register as Patient
2. Login
3. Fill Assessment Form
4. Submit
5. View Risk Score and Trend Chart
6. Register as Doctor
7. Accept patient request
8. View patient reports

---

# ⚠ Important Notes

* This system provides **AI-based risk estimation**, not medical diagnosis.
* It assists in identifying potential mental health risk patterns.
* Clinical decisions should be made by qualified professionals.

---

# 📈 Model Performance

* Accuracy: ~84%
* Binary Classification (Treatment Required: Yes/No)
* Probability-based Risk Scoring

---

# 🚀 Future Enhancements

* Feature importance visualization
* ROC curve & confusion matrix display
* SHAP explainability
* Deployment to cloud
* Real-time chat with doctor

---

# 📌 Conclusion

This system integrates Machine Learning with a secure full-stack web platform to provide an intelligent, structured, and data-driven panic attack risk assessment tool.

It enables early detection, monitoring, and doctor-patient collaboration.


