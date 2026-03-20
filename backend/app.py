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
from datetime import datetime, timezone,timedelta

# ===============================
# App Config
# ===============================

app = Flask(__name__)

# Proper CORS for Vite frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)
# Strong JWT secret (32+ chars)
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this-very-long-secure-2026"

# When False, all doctor-specific endpoints are disabled and return a consistent message.
DOCTOR_FEATURE_ENABLED = False

def doctor_feature_disabled_response():
    return jsonify({"message": "Doctor feature is disabled"}), 403


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
    # Store timestamps in UTC so clients can render local time correctly
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
class LiveHealthData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer)
    heart_rate = db.Column(db.Float)
    stress_level = db.Column(db.Float)
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
    return db.session.get(User, user_id)


def iso_timestamp(dt):
    """Return an ISO-8601 timestamp string with timezone information.

    If dt is naive, assume it is UTC (stored by the server) and attach UTC tzinfo.
    """
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

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
    
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

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
    try:
        user_id = int(get_jwt_identity())
        data = request.json

        # Load artifacts
        model = joblib.load("model.pkl")
        tfidf = joblib.load("tfidf.pkl")
        feature_names = joblib.load("features.pkl")

        # -----------------------------
        # 1. TF-IDF (Symptoms)
        # -----------------------------
        symptoms_text = data.get("Symptoms", "")
        symptoms_vector = tfidf.transform([symptoms_text]).toarray()[0]

        # -----------------------------
        # 2. Numeric Features
        # -----------------------------
        numeric_feature_names = feature_names[:-len(symptoms_vector)]

        numeric_values = []
        for feature in numeric_feature_names:
            numeric_values.append(data.get(feature, 0))

        # -----------------------------
        # 3. Final Input
        # -----------------------------
        final_input = np.array(numeric_values + list(symptoms_vector)).reshape(1, -1)

        # -----------------------------
        # 4. Prediction
        # -----------------------------
        prediction = model.predict(final_input)[0]
        prob = model.predict_proba(final_input)[0][1]

        risk_score = round(prob * 100, 2)

        # -----------------------------
        # 5. Severity
        # -----------------------------
        if risk_score < 40:
            severity = "Low"
        elif risk_score < 70:
            severity = "Moderate"
        else:
            severity = "High"

        # -----------------------------
        # 6. Previous Comparison
        # -----------------------------
        last_record = (
            Assessment.query
            .filter_by(patient_id=user_id)
            .order_by(Assessment.timestamp.desc())
            .first()
        )

        previous_risk = last_record.risk_score if last_record else None

        if previous_risk is None:
            trend = "No Previous Data"
        else:
            diff = risk_score - previous_risk
            if abs(diff) < 2:
                trend = "Stable"
            elif diff > 0:
                trend = "Risk Increased"
            else:
                trend = "Risk Decreased"

        # -----------------------------
        # 7. Influential Factors
        # -----------------------------
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[-5:]

        top_factors = [feature_names[i] for i in top_indices]

        # -----------------------------
        # 8. Save Assessment
        # -----------------------------
        assessment = Assessment(
            patient_id=user_id,
            risk_score=risk_score,
            severity=severity
        )

        db.session.add(assessment)
        db.session.commit()

        # -----------------------------
        # 9. Response
        # -----------------------------
        return jsonify({
            "assessment_id": int(assessment.id),
            "risk_score": float(risk_score),
            "severity": severity,
            "previous_risk": float(previous_risk) if previous_risk is not None else None,
            "trend": trend,
            "top_factors": top_factors,
            "date": assessment.timestamp.strftime("%Y-%m-%d"),
            "time": assessment.timestamp.strftime("%H:%M")
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": "Prediction failed"}), 500
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
            "timestamp": iso_timestamp(r.timestamp)
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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return doctor_feature_disabled_response()

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
    if not DOCTOR_FEATURE_ENABLED:
        return jsonify({"status": "none"})

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


@app.route("/live-data", methods=["POST"])
@jwt_required()
def post_live_data():

    patient_id = int(get_jwt_identity())
    data = request.json

    record = LiveHealthData(
        patient_id=patient_id,
        heart_rate=data.get("heart_rate"),
        stress_level=data.get("stress_level")
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"message": "Live data stored"})


@app.route("/live-data", methods=["GET"])
@jwt_required()
def get_live_data():

    patient_id = int(get_jwt_identity())

    records = LiveHealthData.query.filter_by(
        patient_id=patient_id
    ).order_by(LiveHealthData.timestamp.desc()).limit(20).all()

    return jsonify([
        {
            "heart_rate": r.heart_rate,
            "stress_level": r.stress_level,
            "time": r.timestamp.strftime("%H:%M:%S")
        }
        for r in records
    ])

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