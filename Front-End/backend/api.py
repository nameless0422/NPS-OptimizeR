# backend/api.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from life_expectancy_yld import predict_death_age

app = FastAPI()

# React에서 API 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict-lifespan")
async def predict_lifespan(request: Request):
    data = await request.json()
    result = predict_death_age(data)
    return { "expectedDeathAge": round(result, 1) }
