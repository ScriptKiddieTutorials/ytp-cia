import pandas as pd
import numpy as np

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from utils import *


# File path configuration
DATA_DIR = "./data"
auth_log_path = DATA_DIR + "/authentication_log.csv"
operation_log_path = DATA_DIR + "/operation_log.csv"
org_role_path = DATA_DIR + "/org_role.csv"
system_role_path = DATA_DIR + "/system_role.csv"
organization_path = DATA_DIR + "/organization.csv"
auth_log_anomaly_path = DATA_DIR + "/authentication_log_anomaly.txt"
operation_log_anomaly_path = DATA_DIR + "/operation_log_anomaly.txt"

# Load files into pandas DataFrames
auth_log_df = pd.read_csv(auth_log_path)
operation_log_df = pd.read_csv(operation_log_path)
org_role_df = pd.read_csv(org_role_path)
system_role_df = pd.read_csv(system_role_path)
organization_df = pd.read_csv(organization_path)
auth_log_anomaly_df = pd.read_csv(auth_log_anomaly_path)
operation_log_anomaly_df = pd.read_csv(operation_log_anomaly_path)

# Merge authentication_log.csv and authentication_log_anomaly.txt
auth_anomaly_ids = [int(num.strip("[] ")) for num in auth_log_anomaly_df.columns]
auth_log_df["is_anomaly"] = 0
auth_log_df.loc[auth_log_df["id"].isin(auth_anomaly_ids), "is_anomaly"] = 1

# Merge operation_log.csv and operation_log_anomaly.txt
operation_anomaly_ids = [
    int(num.strip("[] ")) for num in operation_log_anomaly_df.columns
]
operation_log_df["is_anomaly"] = 0
operation_log_df.loc[
    operation_log_df["id"].isin(operation_anomaly_ids), "is_anomaly"
] = 1


# Select features
features = preprocess(auth_log_df, remove_outliers=True)[ALL_FEATURES]
target = auth_log_df["is_anomaly"].values

# Classify features
numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
categorical_transformer = Pipeline(
    steps=[("onehot", OneHotEncoder(handle_unknown="ignore"))]
)

# 建立處理管道
preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, NUM_FEATURES),
        ("cat", categorical_transformer, CAT_FEATURES),
    ]
)

# Split training and testing datasets
X_train, X_test, Y_train, Y_test = train_test_split(
    features, target, test_size=0.3, random_state=42
)

X_train.head()

model = Pipeline(
    steps=[("preprocessor", preprocessor), ("classifier", XGBClassifier())]
)

param_grid = {
    "classifier__max_depth": [3, 6, 10],
    "classifier__min_child_weight": [1, 5, 10],
    "classifier__gamma": [0.5, 1, 1.5, 2],
    "classifier__subsample": [0.6, 0.8, 1.0],
    "classifier__colsample_bytree": [0.6, 0.8, 1.0],
    "classifier__learning_rate": [0.01, 0.1, 0.2],
    "classifier__n_estimators": [100, 200, 300],
    "classifier__scale_pos_weight": [sum(Y_train == 0) / sum(Y_train == 1)],
}

optimal_params = {
    "max_depth": 14,
    "min_child_weight": 10,
    "gamma": 1,
    "subsample": 0.6,
    "colsample_bytree": 0.6,
    "learning_rate": 0.2,
    "n_estimators": 300,
    "scale_pos_weight": 21.580645161290324,
    "objective": "binary:logistic",  # Assuming a binary classification problem
}

model = XGBClassifier(**optimal_params, n_jobs=-1)  # Random forest learning

model.fit(X_train, Y_train)
model.save_model("model.json")

if __name__ == "__main__":
    Y_pred = model.predict(X_test)
    print(Y_pred)
