import os
import pandas as pd
import json

def convert_all_csvs(input_dir, output_dir):
    """
    Convert all CSV files in a directory to JSON format for use in static websites.

    Args:
        input_dir (str): Directory containing the input CSV files.
        output_dir (str): Directory where JSON files will be saved.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Iterate over all files in the input directory
    for file_name in os.listdir(input_dir):
        if file_name.endswith('.csv'):  # Process only CSV files
            csv_path = os.path.join(input_dir, file_name)
            json_file_name = file_name.replace('.csv', '.json')
            json_path = os.path.join(output_dir, json_file_name)

            try:
                # Read the CSV file into a DataFrame
                df = pd.read_csv(csv_path)

                # Convert the DataFrame to a JSON array of records
                json_data = df.to_dict(orient='records')

                # Save the JSON data to a file
                with open(json_path, 'w') as json_file:
                    json.dump(json_data, json_file, indent=4)

                print(f"Converted {file_name} to {json_file_name}")

            except Exception as e:
                print(f"Error converting {file_name}: {e}")

if __name__ == "__main__":
    # Define the input directory containing CSV files
    input_directory = "data/price"
    # Define the output directory for JSON files
    output_directory = "data/json_output"

    # Convert all CSV files in the input directory to JSON
    convert_all_csvs(input_directory, output_directory)
