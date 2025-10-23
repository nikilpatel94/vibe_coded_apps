import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime
import json
from dotenv import load_dotenv

app = FastAPI()

# Load locations from the JSON file at startup
script_dir = os.path.dirname(__file__)
locations_path = os.path.join(script_dir, 'locations.json')
with open(locations_path, "r") as f:
    location_coords = json.load(f)

# In-memory cache for Mars data
cache = {"mars_data": None, "last_fetch": None}

@app.get("/api/locations")
async def get_locations():
    return list(location_coords.keys())


# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fetch secrets
load_dotenv()
OPEN_WEATHER_KEY = os.getenv("OPEN_WEATHER_KEY")
if not OPEN_WEATHER_KEY:
    raise ValueError("OPEN_WEATHER_KEY not found in environment. Please set it in your .env file.")
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")


@app.get("/api/earth/{location}")
async def get_earth_location_data(location: str):
    if location not in location_coords:
        raise HTTPException(status_code=404, detail="Location not found")
    
    location_info = location_coords[location]
    lat = location_info['lat']
    lon = location_info['lon']
    timezone_str = location_info['tz']

    # Fetch weather data from OpenWeatherMap (using the free Current Weather endpoint)
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPEN_WEATHER_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        try:
            weather_response = await client.get(weather_url)
            weather_response.raise_for_status() # Will raise an exception for 4XX/5XX responses
            weather_data = weather_response.json()

            # The response structure is different for this endpoint
            sunrise_ts = weather_data['sys']['sunrise']
            sunset_ts = weather_data['sys']['sunset']
            day_length_seconds = sunset_ts - sunrise_ts
            day_length_hours = int(day_length_seconds / 3600)
            day_length_minutes = int((day_length_seconds % 3600) / 60)

            # Fetch seismic data
            seismic_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
            seismic_response = await client.get(seismic_url)
            seismic_data = seismic_response.json()

            return {
                "timeZone": timezone_str,
                "sunrise": sunrise_ts,
                "sunset": sunset_ts,
                "dayLength": f"{day_length_hours}H {day_length_minutes}M",
                "seismic": f"{len(seismic_data['features'])} >M2.5",
                "wind": f"Avg. {weather_data['wind']['speed']} m/s",
                "cloudCover": f"{weather_data['clouds']['all']} %",
                "weather": weather_data['weather'][0]['main'],
                "temperature": f"{weather_data['main']['temp']}°C",
            }

        except httpx.HTTPStatusError as e:
            # Log the error for debugging
            print(f"Error from OpenWeatherMap API: {e.response.json()}")
            return {"error": "Could not fetch weather data. API key or subscription issue."}
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return {"error": "An unexpected error occurred while fetching data."}


@app.get("/api/mars/{location_name}")
async def get_mars_location_data(location_name: str):
    mars_location_data = {
        'GALE CRATER': {
            'timeOffset': 0,
            'solarDawn': '05:30',
            'solLength': '24H 39M',
            'seismic': '0 Marsquakes',
        },
        'JEZERO CRATER': {
            'timeOffset': 0.5, # Example offset
            'solarDawn': '05:45',
            'solLength': '24H 39M',
            'seismic': '0 Marsquakes',
        },
        'OLYMPUS MONS': {
            'timeOffset': -2.0, # Example offset
            'solarDawn': '06:00',
            'solLength': '24H 39M',
            'seismic': '1 Marsquake > M2.0',
        },
        'VALLES MARINERIS': {
            'timeOffset': 1.0, # Example offset
            'solarDawn': '05:00',
            'solLength': '24H 39M',
            'seismic': '0 Marsquakes',
        },
    }
    # Fetch Mars weather data
    mars_weather_url = f"https://api.nasa.gov/insight_weather/?api_key={NASA_API_KEY}&feedtype=json&ver=1.0"
    async with httpx.AsyncClient() as client:
        mars_weather_response = await client.get(mars_weather_url)
        mars_weather_data = mars_weather_response.json()

    # Get the most recent Sol
    sol_keys = mars_weather_data.get('sol_keys', [])
    if not sol_keys:
        return mars_location_data.get(location_name) # Fallback to hardcoded data
    
    last_sol = sol_keys[-1]
    weather = mars_weather_data[last_sol]

    # Combine with hardcoded data
    location_data = mars_location_data.get(location_name)
    if not location_data:
        return {"error": "Location not found"}

    return {
        **location_data,
        "windSpeeds": f"{weather['HWS']['av']} m/s",
        "localWind": f"Avg. {weather['HWS']['av']} m/s",
        "pressure": f"{weather['PRE']['av']} Pa",
        "temp": f"{weather['AT']['av']}° C",
    }
