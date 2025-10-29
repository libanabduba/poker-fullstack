from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import hands

app = FastAPI(title="Poker API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hands.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Poker API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

