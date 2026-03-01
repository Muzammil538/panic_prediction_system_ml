# train_model.py

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# ===============================
# 1️⃣ LOAD DATA
# ===============================
df = pd.read_csv("../survey.csv")

# ===============================
# 2️⃣ BASIC CLEANING
# ===============================

# Drop irrelevant columns
df = df.drop(["Timestamp", "comments", "state"], axis=1)

# Remove unrealistic ages
df = df[(df["Age"] > 15) & (df["Age"] < 100)]

# ===============================
# 3️⃣ CLEAN GENDER COLUMN
# ===============================
def clean_gender(g):
    g = str(g).lower()
    if "male" in g or g == "m":
        return "Male"
    elif "female" in g or g == "f":
        return "Female"
    else:
        return "Other"

df["Gender"] = df["Gender"].apply(clean_gender)

# ===============================
# 4️⃣ SIMPLIFY COUNTRY
# ===============================
def simplify_country(c):
    if c in ["United States", "Canada", "United Kingdom"]:
        return c
    else:
        return "Other"

df["Country"] = df["Country"].apply(simplify_country)

# ===============================
# 5️⃣ HANDLE MISSING VALUES
# ===============================
for col in df.columns:
    if df[col].dtype == "object":
        df[col].fillna(df[col].mode()[0], inplace=True)

# ===============================
# 6️⃣ ENCODE CATEGORICAL DATA
# ===============================
df = pd.get_dummies(df, drop_first=True)

# ===============================
# 7️⃣ SPLIT FEATURES & TARGET
# ===============================
X = df.drop("treatment_Yes", axis=1)
y = df["treatment_Yes"]

# ===============================
# 8️⃣ TRAIN TEST SPLIT
# ===============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ===============================
# 9️⃣ TRAIN MODEL
# ===============================
model = RandomForestClassifier(
    n_estimators=500,
    max_depth=None,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# ===============================
# 🔟 EVALUATION
# ===============================
accuracy = model.score(X_test, y_test)

print("\nModel Accuracy:", accuracy)
print("\nClassification Report:")
print(classification_report(y_test, model.predict(X_test)))

# ===============================
# 1️⃣1️⃣ SAVE MODEL & FEATURES
# ===============================
joblib.dump(model, "model.pkl")
joblib.dump(X.columns.tolist(), "features.pkl")

print("\nModel and feature list saved successfully.")