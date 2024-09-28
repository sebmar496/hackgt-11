import pandas as pd
import os
from datetime import datetime
import requests

# Function to clean and format data
def clean_and_format_data(df):
    # Separate numeric and non-numeric columns
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    non_numeric_cols = df.select_dtypes(exclude=['float64', 'int64']).columns

    # Handle missing data
    df[numeric_cols] = df[numeric_cols].fillna(0)  # Fill missing numeric values with 0
    df[non_numeric_cols] = df[non_numeric_cols].fillna('N/A')  # Fill missing non-numeric values with 'N/A'
    
    # Standardize date formats (assuming 'report_Date' is in Unix timestamp format)
    if 'report_Date' in df.columns:
        df['report_Date'] = pd.to_datetime(df['report_Date'], unit='ms')  # Convert from Unix timestamp
    
    # Convert all column names to lowercase
    df.columns = [col.lower() for col in df.columns]
    
    # Example: Standardize text columns (strip whitespace and convert to lowercase)
    if 'nibrs_code_name' in df.columns:
        df['nibrs_code_name'] = df['nibrs_code_name'].str.strip().str.lower()
    
    # Example: Format numeric fields
    if 'victim_count' in df.columns:
        df['victim_count'] = df['victim_count'].astype(int)  # Ensure 'victim_count' is integer
    
    # Drop duplicate rows (if any)
    df.drop_duplicates(inplace=True)
    
    return df

# Fetch data from the ArcGIS API (as an example)
def fetch_data_from_api():
    url = "https://services3.arcgis.com/Et5Qfajgiyosiw4d/ArcGIS/rest/services/CrimeDataExport_2_view/FeatureServer/1/query"
    
    today_date = datetime.now().strftime('%Y-%m-%d')

    # Define the parameters to filter today's crimes
    params = {
    'where': f"report_Date BETWEEN DATE '{today_date} 00:00:00' AND DATE '{today_date} 23:59:59'",  # Filter for today's crimes using the DATE function
    'outFields': '*',  # Fetch all fields, or specify required fields
    'returnGeometry': 'false',  # Don't fetch geometry data
    'f': 'json'  # Fetch data in JSON format for easier inspection
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        # Extract the records from the JSON response (assuming the data is in 'features')
        records = [feature['attributes'] for feature in data.get('features', [])]
        return pd.DataFrame(records)
    else:
        print(f"Error fetching data: {response.status_code}")
        print(response.text)
        return None

# Function to save the cleaned data in a specific folder with a dynamic filename
def save_data_to_folder(df_cleaned):
    # Create the 'CrimeData' folder if it doesn't exist
    folder_name = 'CrimeData'
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    
    # Generate a dynamic filename based on the current date
    current_date = datetime.now().strftime('%Y-%m-%d')  # Format: YYYY-MM-DD
    file_name = f"Crime{current_date}.csv"
    file_path = os.path.join(folder_name, file_name)
    
    # Save the cleaned data to the file
    df_cleaned.to_csv(file_path, index=False)
    print(f"Data saved to {file_path}")

# Main execution
def main():
    # Fetch data from the API or load from a local file (uncomment if using a local file)
    # df = pd.read_csv('path_to_your_local_file.csv')
    
    df = fetch_data_from_api()  # Fetch data from the API
    
    if df is not None:
        # Clean and format the data
        df_cleaned = clean_and_format_data(df)
        
        # Save the cleaned data to the 'CrimeData' folder with a dynamic filename
        save_data_to_folder(df_cleaned)
    else:
        print("No data to process.")

# Run the script
if __name__ == "__main__":
    main()