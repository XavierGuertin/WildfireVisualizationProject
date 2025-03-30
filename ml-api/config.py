from joblib import load

# Load once, at module import time
PIPELINE = load("final_pipeline.joblib")
