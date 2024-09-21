from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
#from imblearn.over_sampling import SMOTE

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('trained_model_voting.pkl')

# Define the column order used during training
column_order = ['vaccinated', 'age', 'duration', 'severity', 'concurrent',
                'sex_m', 'breed_hf', 'breed_jry', 'breed_mg', 'breed_nd']

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Create a DataFrame from the incoming data
    new_data_point = pd.DataFrame(data, index=[0])
    
    # Reorder columns to match training data
    new_data_point = new_data_point.reindex(columns=column_order, fill_value=0)
    
    # Make predictions on the new data point
    prediction = model.predict_proba(new_data_point)

    # Extract the probability of survival
    prob_survival = prediction[0][0]*100  # Assuming the first class is survival

    # Return the result as JSON
    return jsonify({'prob_survival': float(prob_survival)})  # Convert to float for JSON serialization


if __name__ == '__main__':
    app.run(debug=True)
