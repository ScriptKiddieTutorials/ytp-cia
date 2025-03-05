import pandas as pd
from io import StringIO
from fastapi import FastAPI, Request
from xgboost import XGBClassifier
from utils import *


# Load model
model = XGBClassifier()
model.load_model("model.json")

app = FastAPI()


@app.get("/")
def read_root():
    return {}


def api_v1(entry):
    csv_data = RAW_FEATURES_STR + "\n" + entry
    df = pd.read_csv(StringIO(csv_data))
    df_ex = preprocess(df)[ALL_FEATURES]
    res = model.predict(df_ex)
    return int(res[0])

def api_v2(entry):
    df = pd.DataFrame([entry])
    df_ex = preprocess(df)[ALL_FEATURES]
    res = model.predict(df_ex)
    return int(res[0])


@app.get("/api/{q}")
def process(q: str):
    print("api query:", q)
    return {"is_anomaly": api_v1(q)}

@app.get("/api_v2")
def process(req: Request):
    params = req.query_params._dict
    print("Parameters", params)
    return {"is_anomaly": api_v2(params)}
