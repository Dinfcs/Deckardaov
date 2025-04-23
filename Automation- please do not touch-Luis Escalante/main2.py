import pandas as pd
import os
from pathlib import Path
import warnings
import yaml
from unidecode import unidecode
import util.drive.google_api as gdrive
import requests
import concurrent.futures
import numpy as np

# Disable warnings to keep output clean
warnings.simplefilter(action="ignore", category=UserWarning)

# Get path to Key Performance Indicator directory
def get_path():
    root = os.path.dirname(os.path.abspath(__name__))
    parent = os.path.dirname(root)
    parent = parent.replace("\\", "/")
    return parent

# Path definitions
SOURCE_DIR = get_path() + "/Source/"
FOLDER_DEST = get_path() + "/storage/"
ALLOCATION_DIR = get_path() + "/Allocation/"
ALLOCATION_PRE = get_path() + "/Pre-AM Work Planning"

# Ensure destination folder exists
os.makedirs(FOLDER_DEST, exist_ok=True)

# Load configuration
with open("config.yml", "r") as file:
    config_kpi = yaml.safe_load(file)

# List of people who no longer work at Deckard
leaveDeck = config_kpi["kpiConfig"]["deckardLeave"]

# Function to process work allocation files
def process_allocation_files():
    print("Processing work allocation files...")
    
    # Load both files without specifying dtypes initially
    data1 = ALLOCATION_DIR + "/Work_allocation_Address_Mapping.xlsx"
    data2 = ALLOCATION_PRE + "/Pre-Address Mapping Work Allocation.xlsx"
    
    # Useful columns to load
    cols = ["Date", "Type", "Analyst", "Absence", "Side job Hours"]
    
    # Safely read files
    try:
        df1 = pd.read_excel(
            data1, 
            sheet_name="Allocation", 
            usecols=cols,
            engine='openpyxl'
        )
        print(f"File 1 loaded successfully: {len(df1)} rows")
    except Exception as e:
        print(f"Error loading file 1: {e}")
        df1 = pd.DataFrame(columns=cols)
    
    try:
        df2 = pd.read_excel(
            data2, 
            sheet_name="Allocation", 
            usecols=cols,
            engine='openpyxl'
        )
        print(f"File 2 loaded successfully: {len(df2)} rows")
    except Exception as e:
        print(f"Error loading file 2: {e}")
        df2 = pd.DataFrame(columns=cols)
    
    # Check if we have data to continue
    if df1.empty and df2.empty:
        raise ValueError("Could not load work allocation files")
    
    # Concatenate results
    df = pd.concat([df1, df2], ignore_index=True)
    
    # Clean column names using vectorized operations
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace(r'[?/\\%()$-]', '_', regex=True)
    
    # Filter out people who left Deckard
    df = df[~df["analyst"].isin(leaveDeck)]
    
    # Remove rows with missing values in critical columns
    df.dropna(subset=["date", "analyst"], inplace=True)
    
    # Rename column
    df.rename(columns={"analyst": "by_who"}, inplace=True)
    
    # Fill missing values with defaults
    df["absence"] = df["absence"].fillna("-")
    
    # Safely convert side_job_hours to numeric
    df["side_job_hours"] = pd.to_numeric(df["side_job_hours"], errors='coerce').fillna(0)
    
    df["type"] = df["type"].fillna("Initial Review")
    
    return df

# Function to process a single Excel file
def process_excel_file(file_path):
    """Processes an Excel file and returns a DataFrame with required data."""
    try:
        print(f"Processing file: {file_path}")
        
        # Try to read all sheets and concatenate
        try:
            all_sheets = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')
            df = pd.concat(all_sheets.values(), ignore_index=True, sort=False)
            df = df.loc[:, ~df.columns.str.contains("^Unnamed")]
            
            # Verify required columns are present
            required_cols = [
                "by_who",
                "date",
                "mapped_via_cyborg_count",
                "no_match_found_nor_mapped_to_mus_count",
            ]
            
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                print(f"Missing columns in {file_path}: {missing_cols}")
                return pd.DataFrame()
            
        except Exception as e:
            print(f"Error reading all sheets from {file_path}: {e}")
            return pd.DataFrame()
        
        # Select only required columns
        df = df[required_cols]
        
        # Safely convert columns to numeric
        for col in ["mapped_via_cyborg_count", "no_match_found_nor_mapped_to_mus_count"]:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Remove rows with missing values in critical columns
        df.dropna(
            subset=["mapped_via_cyborg_count", "no_match_found_nor_mapped_to_mus_count"],
            inplace=True,
            how="all",
        )
        
        print(f"File processed successfully: {len(df)} rows")
        return df
    except Exception as e:
        print(f"General error processing {file_path}: {e}")
        return pd.DataFrame()

# Function to process all Excel files in parallel
def process_excel_files_parallel():
    print("Processing Excel files in parallel...")
    
    # Get all file paths
    file_paths = list(Path(SOURCE_DIR).glob("*.xlsx"))
    
    if not file_paths:
        print(f"No Excel files found in {SOURCE_DIR}")
        return pd.DataFrame()
    
    print(f"Found {len(file_paths)} Excel files")
    
    # Save sorted list of filenames
    file_names = [file_path.name for file_path in file_paths]
    file_names.sort()
    with open(FOLDER_DEST + r"/fileName.txt", "w") as fp:
        for item in file_names:
            fp.write("%s\n" % item)
    
    # Process files in parallel
    dfs = []
    max_workers = min(os.cpu_count() or 4, len(file_paths))
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {executor.submit(process_excel_file, file_path): file_path for file_path in file_paths}
        
        for future in concurrent.futures.as_completed(future_to_file):
            file_path = future_to_file[future]
            try:
                df = future.result()
                if not df.empty:
                    dfs.append(df)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
    
    # Combine all DataFrames
    if dfs:
        print(f"Combining {len(dfs)} DataFrames...")
        stack = pd.concat(dfs, ignore_index=True)
        
        # Filter out people who left Deckard
        stack = stack[~stack["by_who"].isin(leaveDeck)]
        
        # Ensure by_who is string before applying lower and unidecode
        stack["by_who"] = stack["by_who"].astype(str)
        
        # Normalize names using vectorized operations
        stack["by_who"] = stack["by_who"].str.lower().apply(unidecode)
        
        # Replace names using dictionary
        values = config_kpi["kpiConfig"]["normalizedNames"]
        stack["by_who"] = stack["by_who"].replace(values)
        stack["by_who"] = stack["by_who"].str.title()
        
        # Convert to numeric types if needed
        for col in ["mapped_via_cyborg_count", "no_match_found_nor_mapped_to_mus_count"]:
            if pd.api.types.is_numeric_dtype(stack[col]):
                stack[col] = stack[col].astype("int16")
        
        # Group by name and date
        stack = stack.groupby(by=["by_who", "date"], as_index=False).sum()
        
        # Sort values
        return stack.sort_values(by=["date", "by_who"], ascending=False)
    else:
        print("Could not process Excel files. Returning empty DataFrame.")
        return pd.DataFrame()

# Prepare lookup tables for target calculations
def prepare_target_lookup_tables(config_data):
    """
    Preprocess configuration to create efficient lookup tables
    """
    lookup_tables = {}
    
    for category in ["initial", "manitenece", "finalpass"]:
        lookup_tables[category] = []
        
        if category in config_data:
            for record in config_data[category]:
                if "config" in record:
                    for item in record["config"]:
                        lookup_tables[category].append({
                            "start": pd.to_datetime(item["start"]),
                            "end": pd.to_datetime(item["end"]),
                            "result": item["result"]
                        })
    
    return lookup_tables

# Vectorized target calculation
def calculate_targets(df, config):
    """Efficiently calculates targets"""
    # Initialize result column with zeros
    result_series = pd.Series(0.0, index=df.index)
    
    # Verify required columns are present
    required_cols = ["type", "absence", "side_job_hours", "date"]
    for col in required_cols:
        if col not in df.columns:
            print(f"Warning! Missing column: {col}")
            return result_series
    
    # Common conditions
    address_mapping = ["Initial Review", "Final Pass", "Maintenance"]
    
    # Ensure side_job_hours is numeric
    df["side_job_hours"] = pd.to_numeric(df["side_job_hours"], errors='coerce').fillna(0)
    
    valid_absence = ((df["absence"] == "-") & (df["side_job_hours"] < 7.5)) | \
                    ((df["absence"] == "Sick leave") & (df["side_job_hours"] > 0) & (df["side_job_hours"] < 7.5))
    
    lookup_tables = prepare_target_lookup_tables(config)
    
    # For each type and date range
    category_map = {
        "Initial Review": "initial", 
        "Final Pass": "finalpass", 
        "Maintenance": "manitenece"
    }
    
    for type_name, config_key in category_map.items():
        type_mask = (df["type"] == type_name) & valid_absence
        
        if not type_mask.any() or config_key not in lookup_tables:
            continue
        
        # For each period in configuration
        for period in lookup_tables[config_key]:
            date_mask = (df["date"] >= period["start"]) & (df["date"] < period["end"])
            combined_mask = type_mask & date_mask
            
            if combined_mask.any():
                result_series.loc[combined_mask] = (
                    (7.5 - df.loc[combined_mask, "side_job_hours"]) * 
                    (period["result"] / 7.5)
                )
    
    return result_series

# Main function
def main():
    try:
        # Process work allocation files
        wa = process_allocation_files()
        
        # Process work statistics files in parallel
        js = process_excel_files_parallel()
        
        # Terminate if no data found
        if js.empty:
            print("No data found in work statistics files")
            return
        
        print(f"Work data: {len(js)} rows")
        print(f"Allocation data: {len(wa)} rows")
        
        # Convert dates to datetime format
        js["date"] = pd.to_datetime(js["date"])
        wa["date"] = pd.to_datetime(wa["date"])
        
        # Remove work allocation records after last date in js
        if not js.empty:
            wa = wa[wa["date"] <= js["date"].max()]
        
        # Merge dataframes (full outer join)
        result = pd.merge(js, wa, how="outer", on=["by_who", "date"])
        
        print(f"After merge: {len(result)} rows")
        
        # Fill missing values
        result["absence"] = result["absence"].fillna("-")
        result["side_job_hours"] = result["side_job_hours"].fillna(0)
        result["mapped_via_cyborg_count"] = result["mapped_via_cyborg_count"].fillna(0)
        result["no_match_found_nor_mapped_to_mus_count"] = result["no_match_found_nor_mapped_to_mus_count"].fillna(0)
        result["type"] = result["type"].fillna("Initial Review")
        
        # Efficiently calculate target_review and target_matching
        targetReview_config = config_kpi["kpiConfig"]["targetReview"]
        targetMatch_config = config_kpi["kpiConfig"]["targetMatch"]
        
        result["target_review"] = calculate_targets(result, targetReview_config)
        result["target_matching"] = calculate_targets(result, targetMatch_config)
        
        # Vectorized calculation of total_review and total_match
        address_mapping = ["Initial Review", "Final Pass", "Maintenance"]
        result["total_review"] = 0
        result["total_match"] = 0
        
        mask = result["type"].isin(address_mapping)
        result.loc[mask, "total_review"] = result.loc[mask, "mapped_via_cyborg_count"] + result.loc[mask, "no_match_found_nor_mapped_to_mus_count"]
        result.loc[mask, "total_match"] = result.loc[mask, "mapped_via_cyborg_count"]
        
        # Rename columns
        result.rename(
            columns={
                "mapped_via_cyborg_count": "match_found",
                "no_match_found_nor_mapped_to_mus_count": "no_match_found",
            },
            inplace=True,
        )
        
        # Sort by date and by_who
        result = result.sort_values(by=["date", "by_who"], ascending=False, ignore_index=True)
        
        # Add position and team using merge instead of apply
        try:
            position_data = pd.read_csv("database/position_and_team.csv")
            result = pd.merge(
                result,
                position_data[["name", "position", "team"]],
                left_on="by_who",
                right_on="name",
                how="left"
            )
            result["position"] = result["position"].fillna("Unknown")
            result["team"] = result["team"].fillna("Unknown")
            
            # Remove redundant column if exists
            if "name" in result.columns:
                result.drop("name", axis=1, inplace=True)
        except Exception as e:
            print(f"Error processing position and team data: {e}")
            result["position"] = "Unknown"
            result["team"] = "Unknown"
        
        # Export final file
        output_path = os.path.join(FOLDER_DEST, r"output-kpi.csv")
        result.to_csv(output_path, index=False)
        print(f"File successfully saved to: {output_path}")
        
        # Upload to Google Drive
        upload_to_google_drive(output_path)
        
        # Update dashboard
        update_dashboard()
        
    except Exception as e:
        print(f"Error in main execution: {e}")
        import traceback
        traceback.print_exc()

def upload_to_google_drive(file_path):
    print("Uploading file to Google Drive...")
    
    try:
        # Credentials folder
        CREDENTIALS = os.path.abspath("./util/auth")
        
        # Ensure credentials directory exists
        os.makedirs(CREDENTIALS, exist_ok=True)
        
        # Check if file already exists
        varl = gdrive.search_file()
        if not varl:
            file_id = gdrive.upload_with_conversion(
                folder_id="0AKP2xztV7OGeUk9PVA", file_path=file_path
            )
            print(f"File uploaded with ID: {file_id}")
        else:
            file_id = varl[0]["id"]
            update_file = gdrive.update_file(file_id=file_id, file_path=file_path)
            print(f"File updated with ID: {file_id}")
    except Exception as e:
        print(f"Error uploading to Google Drive: {e}")

def update_dashboard():
    print("Updating dashboard...")
    
    try:
        # Apps Script URL
        apps_script_url = "https://script.google.com/a/macros/deckard.com/s/AKfycbzMKCF4EhFdhoS9ZeaOGoWveo2igyfAn1Funn4IRCJwjXK7mvAbvwrQCu5banFTX7ZfAQ/exec"
        
        response = requests.get(apps_script_url)
        if response.status_code == 200:
            print("Data saved successfully")
        else:
            print(f"There was a problem. Response code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error calling Apps Script: {e}")

if __name__ == "__main__":
    main()