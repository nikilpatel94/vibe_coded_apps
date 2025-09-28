# Interplanetary Clock

A sleek and informative web application that displays real-time Earth and Mars time, complete with dynamic backgrounds and key planetary details.

## Features

*   **Split-Screen Display:** Dedicated sections for Earth and Mars time.
*   **Real-time Earth Clock:** Shows current Earth date, day of the week, and time in Coordinated Universal Time (UTC) with AM/PM.
*   **Dynamic Earth Background:** Background image changes between day and night based on Earth's local time.
*   **Real-time Mars Clock:** Displays the current Mars Sol Date, Martian Year, and Mars Coordinated Time (MTC).
*   **Dynamic Mars Background:** Background image changes between day and night based on Mars Coordinated Time (MTC).
*   **Informative Details:** Includes full timezone names, Martian Year, and a reference to the Perseverance Rover mission.
*   **Sleek Design:** Utilizes the futuristic 'Orbitron' font for a modern aesthetic.
*   **Dockerized:** Easily deployable using Docker.

## Technologies Used

*   React
*   HTML
*   CSS
*   JavaScript
*   Docker

## Setup and Running

To get the Interplanetary Clock running on your local machine, follow these steps:

### Prerequisites

Ensure you have [Docker](https://www.docker.com/get-started) installed on your system.

### Instructions

1.  **Navigate to the Project Directory:**
    Open your terminal or command prompt and navigate to the `interplanetary-clock` directory:
    ```bash
    cd interplanetary-clock
    ```

2.  **Build the Docker Image:**
    Build the application's Docker image. This process might take a few minutes as it downloads necessary dependencies and builds the React application.
    ```bash
    docker-compose build
    ```

3.  **Start the Docker Container:**
    Once the image is built, start the Docker container. The application will be accessible via your web browser.
    ```bash
    docker-compose up
    ```

4.  **Access the Application:**
    Open your web browser and go to:
    [http://localhost:7000](http://localhost:7000)

    You should now see the Interplanetary Clock displaying Earth and Mars time in real-time!

## Customization

### Changing Background Images

You can easily customize the background images for Earth and Mars by editing the `earthDayImage`, `earthNightImage`, `marsDayImage`, and `marsNightImage` constants in `src/components/EarthClock.js` and `src/components/MarsClock.js` respectively. Remember to use direct image URLs for optimal performance.

### Changing the Port

If port `7000` is in use or you prefer a different port, you can change it by editing the `docker-compose.yml` file. Modify the `ports` mapping under the `interplanetary-clock` service. For example, to use port `8000`:

```yaml
services:
  interplanetary-clock:
    ports:
      - "8000:80"
```

After making changes to `docker-compose.yml`, you might need to rebuild and restart your Docker containers:

```bash
docker-compose down
docker-compose build
docker-compose up
```