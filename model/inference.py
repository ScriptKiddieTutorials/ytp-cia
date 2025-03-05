import pandas as pd
from io import StringIO
from xgboost import XGBClassifier
from utils import *


# Load model
model = XGBClassifier()
model.load_model("model.json")


def make_inference(entry):
    csv_data = RAW_FEATURES_STR + "\n" + entry
    df = pd.read_csv(StringIO(csv_data))
    # print(df)
    df_ex = preprocess(df)[ALL_FEATURES]
    return model.predict(df_ex)


def main():
    while True:
        entry = input("Enter login entry: ")
        verdict = make_inference(entry)[0]
        print(("NORMAL", "ANOMALY")[verdict])


if __name__ == "__main__":
    main()
