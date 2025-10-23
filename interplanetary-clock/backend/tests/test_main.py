from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

# Mock data for a successful OpenWeatherMap API call
mock_weather_data = {
    "sys": {
        "sunrise": 1661834187,
        "sunset": 1661882248
    },
    "wind": {
        "speed": 5.5
    },
    "clouds": {
        "all": 75
    }
}

# Mock data for a successful USGS seismic API call
mock_seismic_data = {
    "features": [{}, {}] # 2 earthquakes
}

def test_get_earth_data_success(mocker):
    """
    Test the success path for the /api/earth/{location} endpoint, mocking external APIs.
    This test ensures the timezone format is correct to prevent frontend crashes.
    """
    # Mock the async client used in the endpoint
    mock_async_client = mocker.patch('httpx.AsyncClient').return_value.__aenter__.return_value

    # Create mock responses for the two API calls
    mock_weather_response = mocker.MagicMock()
    mock_weather_response.raise_for_status.return_value = None
    mock_weather_response.json.return_value = mock_weather_data

    mock_seismic_response = mocker.MagicMock()
    mock_seismic_response.raise_for_status.return_value = None
    mock_seismic_response.json.return_value = mock_seismic_data

    # Set the side_effect to return the correct mock response based on the URL
    def get_side_effect(url):
        if "openweathermap" in url:
            return mock_weather_response
        else:
            return mock_seismic_response
            
    mock_async_client.get.side_effect = get_side_effect

    # Make the request to the endpoint
    response = client.get("/api/earth/New York")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    
    # Verify the timezone is a string (the fix for the main bug)
    assert isinstance(data["timeZone"], str)
    assert data["timeZone"] == "America/New_York"
    
    # Verify other data points are correctly processed
    assert data["wind"] == "Avg. 5.5 m/s"
    assert data["cloudCover"] == "75 %"
    assert data["seismic"] == "2 >M2.5"

def test_get_earth_data_invalid_location():
    """
    Test that a 404 Not Found error is returned for a location that doesn't exist.
    """
    response = client.get("/api/earth/InvalidCity")
    assert response.status_code == 404
    assert response.json() == {"detail": "Location not found"}
