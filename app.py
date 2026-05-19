from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

def calculate_days_between_dates(date1, date2):
    date_format = "%Y-%m-%d"
    a = datetime.strptime(date1, date_format)
    b = datetime.strptime(date2, date_format)
    delta = b - a
    return delta.days

def calculate_weeks_between_dates(date1, date2):
    days = calculate_days_between_dates(date1, date2)
    weeks = days // 7
    return weeks

# Example: how many monday from today until that_day
def calculate_specific_day_between_dates(specific_day, date1, date2):
    days = calculate_days_between_dates(date1, date2)
    specific_day_count = 0
    for i in range(days + 1):
        current_date = datetime.strptime(date1, "%Y-%m-%d") + timedelta(days=i)
        #%A gives the full weekday name, e.g., "Monday", "Tuesday", etc.
        if current_date.strftime("%A") == specific_day:
            specific_day_count += 1
    return specific_day_count

app = FastAPI()

@app.get("/days_between")
def get_days_between_dates(date1: str, date2: str):
    days = calculate_days_between_dates(date1, date2)
    return {"days_between": days}

@app.get("/weeks_between")
def get_weeks_between_dates(date1: str, date2: str):
    weeks = calculate_weeks_between_dates(date1, date2)
    return {"weeks_between": weeks}

@app.get("/specific_day_between")
def get_specific_day_between_dates(specific_day: str, date1: str, date2: str):
    specific_day_count = calculate_specific_day_between_dates(specific_day, date1, date2)
    return {"specific_day_count": specific_day_count}

# Serve frontend files
if os.path.exists("frontend"):
    app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def read_root():
    return FileResponse("frontend/index.html")