# ===============================
# app.py (FULLY FIXED VERSION)
# ===============================

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
import joblib
import numpy as np
from datetime import datetime

# ===============================
# App Config
# ===============================

app = Flask(__name__)

# Proper CORS for Vite frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Strong JWT secret (32+ chars)
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this-very-long-secure-2026"

db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ===============================
# Load ML Model
# ===============================

model = joblib.load("model.pkl")
features = joblib.load("features.pkl")

# ===============================
# Database Models
# ===============================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # doctor / patient


class DoctorPatient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending / accepted


class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# ===============================
# Create Database
# ===============================

with app.app_context():
    db.create_all()

# ===============================
# Utility
# ===============================

def calculate_severity(risk_score):
    if risk_score < 40:
        return "Low"
    elif risk_score < 70:
        return "Moderate"
    else:
        return "High"

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# ===============================
# Routes
# ===============================

@app.route("/")
def home():
    return jsonify({"message": "Mental Health AI Backend Running"})

# ===============================
# Register
# ===============================

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if role not in ["doctor", "patient"]:
        return jsonify({"message": "Invalid role"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_pw,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# ===============================
# Login
# ===============================

@app.route("/login", methods=["POST"])
def login():

    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "name": user.name,
        "role": user.role
    })

# ===============================
# Predict (Patient Only)
# ===============================

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():

    patient_id = int(get_jwt_identity())
    data = request.json

    # =========================
    # Convert Input
    # =========================

    age = int(data.get("age",0))

    gender_map = {"Male":0,"Female":1,"Other":2}
    gender = gender_map.get(data.get("gender"),0)

    family_history = 1 if data.get("family_history") == "Yes" else 0
    previous_anxiety = 1 if data.get("previous_anxiety") == "Yes" else 0

    stress_map = {"Low":0,"Moderate":1,"High":2}
    stress_level = stress_map.get(data.get("stress_level"),0)

    sleep_map = {"<5":0,"5-7":1,">7":2}
    sleep_hours = sleep_map.get(data.get("sleep_hours"),1)

    sleep_quality_map = {"Good":0,"Disturbed":1,"Very poor":2}
    sleep_quality = sleep_quality_map.get(data.get("sleep_quality"),0)

    caffeine_map = {"None":0,"1-2":1,"3-4":2,">4":3}
    caffeine = caffeine_map.get(data.get("caffeine"),0)

    alcohol_map = {"None":0,"Occasionally":1,"Frequently":2}
    alcohol = alcohol_map.get(data.get("alcohol"),0)

    smoking = 1 if data.get("smoking") == "Yes" else 0

    screen_map = {"<2 hrs":0,"2-5 hrs":1,">5 hrs":2}
    screen_time = screen_map.get(data.get("screen_time"),1)

    activity_map = {"Regular":0,"Sometimes":1,"None":2}
    physical_activity = activity_map.get(data.get("physical_activity"),1)

    support_map = {"Strong":0,"Moderate":1,"Weak":2}
    social_support = support_map.get(data.get("social_support"),1)

    duration_map = {"<5 min":0,"5-15 min":1,">15 min":2}
    attack_duration = duration_map.get(data.get("attack_duration"),0)

    impact_map = {"No":0,"Sometimes":1,"Frequently":2}
    activity_impact = impact_map.get(data.get("activity_impact"),0)

    triggers = data.get("attack_triggers",[])

    trigger_stress = 1 if "During stress" in triggers else 0
    trigger_crowd = 1 if "In crowded places" in triggers else 0
    trigger_night = 1 if "At night" in triggers else 0
    trigger_random = 1 if "Without reason" in triggers else 0
    trigger_exam = 1 if "Before exams/work" in triggers else 0

    symptoms = data.get("symptoms",{})
    symptom_count = sum(symptoms.values())

    history = data.get("psychiatric_history",[])

    history_anxiety = 1 if "Anxiety Disorder" in history else 0
    history_depression = 1 if "Depression" in history else 0
    history_panic = 1 if "Panic Disorder" in history else 0
    history_ptsd = 1 if "PTSD" in history else 0

    # =========================
    # Feature Vector
    # =========================

    input_data = np.array([[

        age,
        gender,
        family_history,
        previous_anxiety,
        stress_level,
        sleep_hours,
        sleep_quality,
        caffeine,
        alcohol,
        smoking,
        screen_time,
        physical_activity,
        social_support,
        attack_duration,
        activity_impact,
        trigger_stress,
        trigger_crowd,
        trigger_night,
        trigger_random,
        trigger_exam,
        symptom_count,
        history_anxiety,
        history_depression,
        history_panic,
        history_ptsd

    ]])

    # =========================
    # Prediction
    # =========================

    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]

    risk_score = round(probabilities[1] * 100,2)
    severity = calculate_severity(risk_score)

    # =========================
    # Previous Assessment
    # =========================

    previous = Assessment.query.filter_by(
        patient_id=patient_id
    ).order_by(Assessment.timestamp.desc()).first()

    trend = "First Assessment"
    previous_risk = None

    if previous:

        previous_risk = previous.risk_score

        if risk_score > previous_risk:
            trend = "Risk Increased"
        elif risk_score < previous_risk:
            trend = "Risk Decreased"
        else:
            trend = "Risk Stable"

    # =========================
    # Save New Assessment
    # =========================

    assessment = Assessment(
        patient_id=patient_id,
        risk_score=risk_score,
        severity=severity
    )

    db.session.add(assessment)
    db.session.commit()

    # =========================
    # Influential Factors
    # =========================

    importances = model.feature_importances_

    feature_importance = sorted(
        zip(features, importances),
        key=lambda x: x[1],
        reverse=True
    )[:3]

    top_factors = [f[0] for f in feature_importance]

    # =========================
    # Response
    # =========================

    return jsonify({

        "assessment_id": assessment.id,

        "risk_score": risk_score,
        "severity": severity,

        "previous_risk": previous_risk,
        "trend": trend,

        "top_factors": top_factors,

        "date": assessment.timestamp.strftime("%Y-%m-%d"),
        "time": assessment.timestamp.strftime("%H:%M")

    })
# ===============================
# History (Patient Only)
# ===============================

@app.route("/history", methods=["GET"])
@jwt_required()
def history():

    user = get_current_user()

    if user.role != "patient":
        return jsonify({"message": "Only patients can view history"}), 403

    records = Assessment.query.filter_by(patient_id=user.id).all()

    history_data = [
        {
            "risk_score": r.risk_score,
            "severity": r.severity,
            "timestamp": r.timestamp.isoformat()
        }
        for r in records
    ]

    return jsonify(history_data)

# ===============================
# Get Doctors
# ===============================

@app.route("/doctors", methods=["GET"])
@jwt_required()
def get_doctors():

    doctors = User.query.filter_by(role="doctor").all()

    return jsonify([
        {"id": d.id, "name": d.name}
        for d in doctors
    ])

# ===============================
# Patient Requests Doctor
# ===============================

@app.route("/request-doctor", methods=["POST"])
@jwt_required()
def request_doctor():

    user = get_current_user()

    if user.role != "patient":
        return jsonify({"message": "Only patients can request doctors"}), 403

    doctor_id = request.json.get("doctor_id")

    doctor = User.query.get(doctor_id)

    if not doctor or doctor.role != "doctor":
        return jsonify({"message": "Invalid doctor"}), 400

    existing = DoctorPatient.query.filter_by(
        doctor_id=doctor_id,
        patient_id=user.id
    ).first()

    if existing:
        return jsonify({"message": "Request already exists"}), 400

    new_request = DoctorPatient(
        doctor_id=doctor_id,
        patient_id=user.id,
        status="pending"
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({"message": "Request sent to doctor"})

# ===============================
# Doctor Views Pending Requests
# ===============================

@app.route("/doctor/requests", methods=["GET"])
@jwt_required()
def doctor_requests():

    user = get_current_user()

    if user.role != "doctor":
        return jsonify({"message": "Only doctors allowed"}), 403

    requests = DoctorPatient.query.filter_by(
        doctor_id=user.id,
        status="pending"
    ).all()

    result = []

    for r in requests:
        patient = User.query.get(r.patient_id)
        result.append({
            "request_id": r.id,
            "patient_id": patient.id,
            "patient_name": patient.name
        })

    return jsonify(result)

# ===============================
# Doctor's Patients and Reports
@app.route("/doctor/patients", methods=["GET"])
@jwt_required()
def doctor_patients():
    user = get_current_user()

    if user.role != "doctor":
        return jsonify({"message": "Only doctors allowed"}), 403

    relations = DoctorPatient.query.filter_by(
        doctor_id=user.id,
        status="accepted"
    ).all()

    result = []
    for rel in relations:
        patient = User.query.get(rel.patient_id)
        if not patient:
            continue
        records = Assessment.query.filter_by(patient_id=patient.id).all()
        result.append({
            "id": patient.id,
            "name": patient.name,
            "reports": [
                {
                    "risk_score": r.risk_score,
                    "severity": r.severity,
                    "timestamp": r.timestamp.isoformat()
                }
                for r in records
            ]
        })

    return jsonify(result)

# ===============================
# Doctor Accept Request
# ===============================

@app.route("/doctor/accept", methods=["POST"])
@jwt_required()
def accept_request():

    user = get_current_user()

    if user.role != "doctor":
        return jsonify({"message": "Only doctors allowed"}), 403

    request_id = request.json.get("request_id")
    print(f"Doctor {user.id} accepting request {request_id}")

    req = DoctorPatient.query.get(request_id)

    if not req or req.doctor_id != user.id:
        print(f"Invalid request: req={req}, doctor_id={req.doctor_id if req else None}, user_id={user.id}")
        return jsonify({"message": "Invalid request"}), 400

    print(f"Before update: status={req.status}")
    req.status = "accepted"
    db.session.commit()
    print(f"After update: status={req.status}")

    return jsonify({"message": "Patient accepted"})

# ===============================
# Doctor Views Patient Reports
# ===============================

@app.route("/doctor/patient/<int:patient_id>", methods=["GET"])
@jwt_required()
def patient_reports(patient_id):

    user = get_current_user()

    if user.role != "doctor":
        return jsonify({"message": "Only doctors allowed"}), 403

    relation = DoctorPatient.query.filter_by(
        doctor_id=user.id,
        patient_id=patient_id,
        status="accepted"
    ).first()

    if not relation:
        return jsonify({"message": "Not authorized"}), 403

    records = Assessment.query.filter_by(patient_id=patient_id).all()

    return jsonify([
        {
            "risk_score": r.risk_score,
            "severity": r.severity,
            "timestamp": r.timestamp.isoformat()
        }
        for r in records
    ])

# ===============================
# Patient Doctor Status
# ===============================

@app.route("/patient/doctor-status", methods=["GET"])
@jwt_required()
def doctor_status():

    user = get_current_user()

    if user.role != "patient":
        return jsonify({"message": "Only patients allowed"}), 403

    relation = DoctorPatient.query.filter_by(
        patient_id=user.id
    ).first()

    print(f"Patient {user.id} checking doctor status. Relation: {relation}")
    if relation:
        print(f"Relation ID: {relation.id}, Status: {relation.status}, Doctor ID: {relation.doctor_id}")

    if not relation:
        return jsonify({"status": "none"})

    doctor = User.query.get(relation.doctor_id)

    response = {
        "status": relation.status,
        "doctor_name": doctor.name
    }
    print(f"Returning response: {response}")
    return jsonify(response)


# ===============================
# JWT Error Handlers
# ===============================

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"JWT UNAUTHORIZED: {error}")
    return jsonify({"msg": "Request does not contain an access token"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"JWT INVALID TOKEN: {error}")
    return jsonify({"msg": "Signature verification failed"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"JWT EXPIRED")
    return jsonify({"msg": "The token has expired"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    print(f"JWT REVOKED")
    return jsonify({"msg": "The token has been revoked"}), 401

@jwt.user_lookup_loader
def user_lookup_callback(jwt_header, jwt_data):
    identity = jwt_data["sub"]
    print(f"JWT USER LOOKUP: {identity}")
    return User.query.get(identity)

# ===============================
# Run
# ===============================

if __name__ == "__main__":
    app.run(debug=True)