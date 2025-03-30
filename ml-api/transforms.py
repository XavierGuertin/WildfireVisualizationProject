# transforms.py
import pandas as pd
import numpy as np
from config import PIPELINE

def transform_and_predict(features_dict: dict) -> float:

    df = pd.DataFrame([features_dict])

    df = pd.get_dummies(df, columns=["month", "day"], drop_first=False)

    pipeline_cols = PIPELINE.named_steps['scaler'].feature_names_in_

    for col in pipeline_cols:
        if col not in df.columns:
            df[col] = 0

    df = df.reindex(columns=pipeline_cols, fill_value=0)

    pred_log = PIPELINE.predict(df)

    pred_area = np.exp(pred_log) - 1.0

    return float(pred_area[0])
