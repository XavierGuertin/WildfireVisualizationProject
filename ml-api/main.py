# main.py
from fastapi import FastAPI
from router import router as predict_router

app = FastAPI()

# Add our router
app.include_router(predict_router)
