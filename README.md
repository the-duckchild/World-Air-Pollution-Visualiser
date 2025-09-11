# Air Pollution Visualiser

## Description

Air Pollution Visualiser is a full-stack web application for exploring and visualising air quality data interactively. It features a React-based frontend with 3D AQI visualisation and a .NET API backend, allowing users to view, search, and analyse air pollution data from various stations.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)
- [License](#license)

## Installation

### Prerequisites

- Node.js and npm
- .NET 8 SDK

### Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/air-pollution-visualiser.git
   cd air-pollution-visualiser
   ```

2. **Install frontend dependencies**
   ```sh
   cd ui
   npm install
   ```

3. **Install backend dependencies**
   ```sh
   cd ../api
   dotnet restore
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env` in both `ui/` and `api/` folders and set your API keys and configuration.

5. **Run the backend**
   ```sh
   cd api
   dotnet run
   ```

6. **Run the frontend**
   ```sh
   cd ../ui
   npm run dev
   ```

## Usage

- Open your browser and go to `http://localhost:5173`.
- Use the interactive map to select a location or find the nearest air pollution station.
- View AQI figures and 3D visualisations.
- Explore features such as ticker tape updates and historical data.

## Features

- Interactive map for selecting locations and stations
- 3D AQI visualisation using React Three Fiber
- Real-time air quality data fetching
- Modular React components
- Responsive design
- API backend with CORS support and Swagger documentation
- Customisable configuration via `.env` files

## Configuration

- **Frontend (`ui/.env`)**: Set API endpoints, keys, and other UI options.
- **Backend (`api/.env`, `api/appsettings.json`)**: Configure database connection, external API keys, and CORS settings.
- **Styling**: Customise styles in `ui/src/styles/app.css` and `ui/src/styles/globals.css`.
- **Map and visualisation settings**: Adjust defaults in `ui/src/Pages/Home/HomePage.tsx` and `ui/src/components/AqiVisualiser/AqiVisualiser.tsx`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
