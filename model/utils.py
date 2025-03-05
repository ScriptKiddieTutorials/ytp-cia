import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder


# Define features
RAW_FEATURES_STR = "id,user_account,role_id,user_id,action,description,timestamp,IP"

ALL_FEATURES = [
    "user_action",
    "user_ip",
    "user_account",
    "IP",
    "user_id",
    "role_id",
    "action",
    "hour",
    "minute",
    "second",
    "dayofweek",
    "day_type",
]


CAT_FEATURES = [
    "user_action",
    "user_ip",
    "user_account",
    "IP",
    "user_id",
    "role_id",
    "action",
    "dayofweek",
    "day_type",
]

NUM_FEATURES = ["hour", "minute", "second"]


# Define columns
COLUMNS = [
    "user_action",
    "user_ip",
    "user_account",
    "role_id",
    "user_id",
    "action",
    "description",
    "IP",
]


def identify_day_type(date):
    holidays = pd.to_datetime(
        [
            "2024-01-01",
            "2024-02-28",
            "2024-04-04",
            "2024-05-01",
            "2024-06-25",
            "2024-09-28",
            "2024-10-10",
        ]
    )
    if date in holidays:
        return "holiday"
    elif date.weekday() >= 5:
        return "weekend"
    else:
        return "weekday"


def preprocess(df, remove_outliers=False):
    # Initialize LabelEncoder and new DataFrame
    le = LabelEncoder()
    df_ex = pd.DataFrame()

    # Feature engineering: Create new encoded columns
    df["user_action"] = df["user_account"].astype(str) + "_" + df["action"].astype(str)
    df["user_ip"] = df["user_account"].astype(str) + "_" + df["IP"].astype(str)

    # Apply Label Encoding to newly created features
    for col_name in COLUMNS:
        df_ex[col_name] = le.fit_transform(df[col_name])

    # Extract time-based features
    pd_datetime = pd.to_datetime(df["timestamp"])
    df_ex["hour"] = pd_datetime.dt.hour
    df_ex["minute"] = pd_datetime.dt.minute
    df_ex["second"] = pd_datetime.dt.second
    df_ex["dayofweek"] = pd_datetime.dt.dayofweek
    df_ex["day_type"] = pd_datetime.map(identify_day_type)
    df_ex["day_type"] = le.fit_transform(df_ex["day_type"])

    # Detect and remove outliers
    def detect_outliers(df, features):
        outlier_indices = []
        for c in features:
            Q1, Q3 = np.percentile(df[c], [25, 75])
            IQR = Q3 - Q1
            outlier_step = 1.5 * IQR
            outlier_list_col = df[
                (df[c] < Q1 - outlier_step) | (df[c] > Q3 + outlier_step)
            ].index
            outlier_indices.extend(outlier_list_col)

        # Select observations with more than 2 outliers
        return list(set([x for x in outlier_indices if outlier_indices.count(x) > 2]))

    if remove_outliers:
        outliers_to_remove = detect_outliers(df_ex, ["hour", "minute", "second"])
        df_ex = df_ex.drop(outliers_to_remove, axis=0)

        # Handle missing values
        df_ex.fillna(0, inplace=True)

    return df_ex
