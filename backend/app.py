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

    user = get_current_user()

    if user.role != "patient":
        return jsonify({"message": "Only patients can submit assessments"}), 403

    data = request.json

    input_data = [data.get(feature, 0) for feature in features]
    input_array = np.array([input_data])

    prediction = model.predict(input_array)[0]
    probabilities = model.predict_proba(input_array)[0]

    risk_score = round(probabilities[1] * 100, 2)
    severity = calculate_severity(risk_score)

    assessment = Assessment(
        patient_id=user.id,
        risk_score=risk_score,
        severity=severity
    )

    db.session.add(assessment)
    db.session.commit()

    return jsonify({
        "treatment_recommended": bool(prediction),
        "risk_score": risk_score,
        "severity_index": severity
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