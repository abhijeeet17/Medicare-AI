import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import os

class DiabetesModel:
    def __init__(self):
        self.best_model = None
        self.scaler = None
        self.accuracy = 0.0
        self.model_name = "Not Trained"
        self.accuracies = {}

    def load_and_train(self, data_path):
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Dataset not found at {data_path}")
            
        df = pd.read_csv(data_path)
        
        # Preprocessing
        cols_to_clean = ['Glucose', 'Blood pressure', 'Insulin']
        # Check if columns exist to avoid errors if dataset changes
        existing_cols = [c for c in cols_to_clean if c in df.columns]
        df[existing_cols] = df[existing_cols].replace(0, np.nan)
        
        for i in df.select_dtypes(include='number').columns:
            df[i] = df[i].fillna(df[i].mean())

        X = df[['Pregnancies', 'Glucose', 'Blood pressure', 'Insulin', 'Age', 'Body mass index']]
        y = df['Outcome']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.feature_ranges = {}
        feature_cols = ['Pregnancies', 'Glucose', 'Blood pressure', 'Insulin', 'Age', 'Body mass index']
        for col in feature_cols:
            if col in df.columns:
                 self.feature_ranges[col] = {
                     "min": float(df[col].min()),
                     "max": float(df[col].max())
                 }

        self.scaler = MinMaxScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        models = {
            "Logistic Regression": LogisticRegression(),
            "KNN": KNeighborsClassifier(n_neighbors=5),
            "Naive Bayes": GaussianNB(),
            "Decision Tree": DecisionTreeClassifier(criterion='gini', random_state=42)
        }

        # LR
        models["Logistic Regression"].fit(X_train_scaled, y_train)
        pred_lr = models["Logistic Regression"].predict(X_test_scaled)
        acc_lr = accuracy_score(y_test, pred_lr)

        # KNN
        models["KNN"].fit(X_train_scaled, y_train)
        pred_knn = models["KNN"].predict(X_test_scaled)
        acc_knn = accuracy_score(y_test, pred_knn)

        # NB (Original used unscaled)
        models["Naive Bayes"].fit(X_train, y_train)
        pred_nb = models["Naive Bayes"].predict(X_test)
        acc_nb = accuracy_score(y_test, pred_nb)

        # DT (Original used unscaled)
        models["Decision Tree"].fit(X_train, y_train)
        pred_dt = models["Decision Tree"].predict(X_test)
        acc_dt = accuracy_score(y_test, pred_dt)

        self.accuracies = {
            "Logistic Regression": acc_lr * 100,
            "KNN": acc_knn * 100,
            "Naive Bayes": acc_nb * 100,
            "Decision Tree": acc_dt * 100
        }

        best_name = max(self.accuracies, key=self.accuracies.get)
        self.accuracy = self.accuracies[best_name]
        self.best_model = models[best_name]
        self.model_name = best_name
        
        print(f"Diabetes Model Trained. Best: {best_name} ({self.accuracy:.2f}%)")

    def get_metadata(self):
        return {
            "accuracy": self.accuracy,
            "model_name": self.model_name,
            "ranges": self.feature_ranges if hasattr(self, 'feature_ranges') else {},
            "all_accuracies": self.accuracies if hasattr(self, 'accuracies') else {}
        }

    def predict(self, features):
        # features: [Pregnancies, Glucose, Blood pressure, Insulin, Age, Body mass index]
        input_data = np.array([features])
        
        # Handling scaling
        if self.model_name in ["Logistic Regression", "KNN"]:
             input_data = self.scaler.transform(input_data)
             
        prediction = self.best_model.predict(input_data)
        return prediction[0]

diabetes_model = DiabetesModel()
