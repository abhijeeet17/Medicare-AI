from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import contextlib
import os
import nbformat
from nbconvert import HTMLExporter

from ml_logic.heart import heart_model
from ml_logic.diabetes import diabetes_model

# Data input schemas
class HeartPredictionInput(BaseModel):
    age: int
    sex: str # "male" or "female"
    cp: int
    bp: float
    chol: float
    maxHR: float

class DiabetesPredictionInput(BaseModel):
    pregnancies: float
    glucose: float
    blood_pressure: float
    insulin: float
    age: float
    bmi: float

def convert_notebook_to_html(notebook_path, output_path):
    if not os.path.exists(notebook_path):
        print(f"Notebook not found: {notebook_path}")
        return
        
    print(f"Converting {notebook_path} to HTML...")
    try:
        with open(notebook_path, 'r', encoding='utf-8') as f:
            notebook_node = nbformat.read(f, as_version=4)
            
        html_exporter = HTMLExporter()
        html_exporter.template_name = 'classic' # simple look
        (body, resources) = html_exporter.from_notebook_node(notebook_node)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(body)
        print(f"Converted to {output_path}")
    except Exception as e:
        print(f"Error converting notebook: {e}")

# Lifespan context to train models on startup
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Load and Train Models
    print("Training models...")
    # Current working directory is 'backend' when running uvicorn from there
    # Files are in the parent directory (project root)
    cwd = os.getcwd()
    project_root = os.path.dirname(cwd) # Go up one level
    
    # 1. Train Models
    heart_csv = os.path.join(project_root, "datasets", "Heart_Disease_Prediction.csv")
    diabetes_csv = os.path.join(project_root, "datasets", "Dataset 1 _ Pima Indians diabetes dataset (PIDD).csv")
    
    try:
        heart_model.load_and_train(heart_csv)
    except Exception as e:
        print(f"Error training Heart Model: {e}")

    try:
        diabetes_model.load_and_train(diabetes_csv)
    except Exception as e:
        print(f"Error training Diabetes Model: {e}")
        
    # 2. Convert Notebooks
    # We want to serve them from backend/notebooks
    notebooks_dir = os.path.join(cwd, "notebooks")
    os.makedirs(notebooks_dir, exist_ok=True)
    
    import shutil
    # Copy raw notebooks for download
    try:
        shutil.copy(os.path.join(project_root, "heart_disease.ipynb"), os.path.join(notebooks_dir, "heart_disease.ipynb"))
        shutil.copy(os.path.join(project_root, "diabetese.ipynb"), os.path.join(notebooks_dir, "diabetese.ipynb"))
    except Exception as e:
        print(f"Error copying raw notebooks: {e}")

    convert_notebook_to_html(
        os.path.join(project_root, "heart_disease.ipynb"),
        os.path.join(notebooks_dir, "heart_disease.html")
    )
    convert_notebook_to_html(
        os.path.join(project_root, "diabetese.ipynb"), 
        os.path.join(notebooks_dir, "diabetes.html")
    )
        
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Notebooks
# Check if dir exists first (it should be created in lifespan, but just in case)
notebooks_path = os.path.join(os.getcwd(), "notebooks")
os.makedirs(notebooks_path, exist_ok=True)
app.mount("/notebooks", StaticFiles(directory=notebooks_path), name="notebooks")

@app.get("/")
def read_root():
    return {"message": "MediCare Backend is running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "heart_model": heart_model.model_name if heart_model.best_model else "Not Trained",
        "diabetes_model": diabetes_model.model_name if diabetes_model.best_model else "Not Trained"
    }

@app.get("/info/heart")
def info_heart():
    return heart_model.get_metadata()

@app.get("/info/diabetes")
def info_diabetes():
    return diabetes_model.get_metadata()

@app.post("/predict/heart")
def predict_heart(data: HeartPredictionInput):
    if not heart_model.best_model:
        raise HTTPException(status_code=503, detail="Heart Model not trained")
    
    # Map sex to 0/1
    sex_val = 1 if data.sex.lower() == "male" else 0
    
    # Input order: Age, Sex, Chest pain type, BP, Cholesterol, Max HR
    features = [data.age, sex_val, data.cp, data.bp, data.chol, data.maxHR]
    
    try:
        result = heart_model.predict(features)
        return {
            "prediction": "Heart Disease Detected" if result == 1 else "Normal",
            "risk": int(result),
            "model_used": heart_model.model_name,
            "accuracy": heart_model.accuracy
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/diabetes")
def predict_diabetes(data: DiabetesPredictionInput):
    if not diabetes_model.best_model:
        raise HTTPException(status_code=503, detail="Diabetes Model not trained")
        
    # Input order: Pregnancies, Glucose, Blood pressure, Insulin, Age, Body mass index
    features = [data.pregnancies, data.glucose, data.blood_pressure, data.insulin, data.age, data.bmi]
    
    try:
        result = diabetes_model.predict(features)
        return {
            "prediction": "Diabetic" if result == 1 else "Non-Diabetic",
            "risk": int(result),
            "model_used": diabetes_model.model_name,
            "accuracy": diabetes_model.accuracy
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
