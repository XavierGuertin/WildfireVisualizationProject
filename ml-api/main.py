from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router  # Import your router

app = FastAPI()

# Configure CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],  # Adjust to match your frontend URL
  allow_credentials=True,
  allow_methods=["POST", "OPTIONS"],  # Allow POST and OPTIONS
  allow_headers=["Content-Type"],  # Allow the headers your frontend sends
)

# Include the router
app.include_router(router)

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="127.0.0.1", port=8000)
