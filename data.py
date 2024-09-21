# Import necessary libraries
import pandas as pd
import warnings
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE

# Suppress FutureWarnings
warnings.simplefilter(action='ignore', category=FutureWarning)

# Read the CSV data into a pandas DataFrame
data = pd.read_csv('output.csv')  # Replace 'path_to_your_csv_file.csv' with the actual file path

# Display the first few rows of the dataframe
print("Original Data:")
print(data.head())

# Encode categorical variables
label_encoders = {}
for column in data.select_dtypes(include=['object']).columns:
    label_encoders[column] = LabelEncoder()
    data[column] = label_encoders[column].fit_transform(data[column])

# Separate features and target (assuming 'survival' is the target variable)
X = data.drop('survival', axis=1)
y = data['survival']

# Convert y to 1D array to avoid TypeError
y = y.values.ravel()

# Initialize variables to store resampled data
X_resampled = pd.DataFrame(columns=X.columns)
y_resampled = pd.Series(dtype='int')

# Apply SMOTE to generate synthetic samples until reaching 1000 rows
smote = SMOTE(sampling_strategy='auto', random_state=42)
while len(X_resampled) < 1000:
    X_temp, y_temp = smote.fit_resample(X, y)
    X_resampled = pd.concat([X_resampled, pd.DataFrame(X_temp, columns=X.columns)])
    y_resampled = pd.concat([y_resampled, pd.Series(y_temp)])

# Combine resampled features and target into a DataFrame
resampled_data = pd.concat([X_resampled, y_resampled.reset_index(drop=True)], axis=1)

# Limit the number of rows to 1000
resampled_data = resampled_data.iloc[:1000]

# Decode the numerical values back to original categorical values
for column, encoder in label_encoders.items():
    resampled_data[column] = encoder.inverse_transform(resampled_data[column])

# Save the augmented data to a new CSV file
resampled_data.to_csv('augmented_data.csv', index=False)

# Check the size of the new DataFrame
print("Augmented Data Shape:")
print(resampled_data.shape)

# Display the first few rows of the augmented dataframe
print("Augmented Data:")
print(resampled_data.head())
