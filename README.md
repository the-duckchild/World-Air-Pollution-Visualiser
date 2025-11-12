# World Air Pollution Visualiser

[![Netlify Status](https://api.netlify.com/api/v1/badges/ef6f6594-1863-40b2-b2b9-1cfb9025f7a5/deploy-status)](https://app.netlify.com/projects/worldairqualityvisualiser/deploys)

## Description

World Air Pollution Visualiser is a full-stack web application for exploring and visualising air quality data in real time. The project features a modern React frontend (with 3D visualisation via React Three Fiber) and a robust .NET API backend. Easily interact with global air pollution data, get real-time updates, and enjoy beautiful, intuitive visuals.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)
- [License](#license)

## Features

- **Interactive Map** – Explore global air quality with an intuitive map interface. Select any location or station, and view real-time data at a glance.
- **3D AQI Visualisation** – Engaging, dynamic 3D displays powered by React Three Fiber.
- **Real-Time Data** – Fetch and display the latest Air Quality Index (AQI) data with live ticker tape updates.
- **Modular React Components** – Clean, reusable UI elements for easy maintenance and extension.
- **Responsive Design** – Mobile-friendly, desktop-ready experience.
- **Robust Backend** – .NET 8 API with CORS support, Swagger documentation, and environment-based configuration.
- **API Documentation** – Built-in Swagger UI for backend exploration.
- **Open Source** – MIT licensed for easy adaptation and enhancement.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)

### Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/the-duckchild/Air-Pollution-Visualiser.git
   cd Air-Pollution-Visualiser
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
   - Copy `.env.example` to `.env` in both `ui/` and `api/` folders.
   - Edit the `.env` files to provide API keys and configuration values.  
   - Common variables:
     - `VITE_API_BASE_URL` (frontend): set to your backend API endpoint.
     - `API_EXTERNAL_KEY` (backend): set your air quality data provider key.
   - For detailed setup, see comments in each `.env.example`.

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

- Visit [http://localhost:5173](http://localhost:5173) in your browser.
- Interact with the world map to:
  - Select a region and locate the nearest air pollution monitoring station.
  - View current AQI figures and see animated 3D visualisations.
  - Explore historical AQI charts or use filter options if available.
  - Watch the live ticker for rapid updates as data changes worldwide.

## Troubleshooting

- **.env Issues**: Ensure your `.env` files are correctly copied and contain all required variables and API keys.
- **Port Conflicts**: The frontend defaults to port 5173, backend typically to 5000 or 8000. Close any apps using these ports or adjust in your config.
- **CORS Errors**: Double-check your backend CORS configuration (`api/appsettings.json` or environment variables) to allow requests from your frontend's origin.
- **API Key/Quota Issues**: If you see “API Limit Exceeded” errors, confirm your external key is valid and not over its usage quota.
- **Platform Issues**:  
  - On Windows, use Git Bash or WSL for Unix-style commands.
  - On macOS/Linux, ensure you have the right permissions on files.
- **.NET Build Errors**: Verify you’ve installed the correct version of the .NET SDK.
- For further help, open an issue or check the project Discussions tab.

## Configuration

- **Frontend (`ui/.env`)**:  
  - Set the backend API URL (`VITE_API_BASE_URL`), map options, and UI features.
- **Backend (`api/.env`, `api/appsettings.json`)**:  
  - Configure database connection, CORS, and external air quality API keys.
- **Styling**:  
  - Edit `ui/src/styles/app.css` and `ui/src/styles/globals.css` for custom designs.
- **Map & Visuals**:  
  - Tweak defaults and behaviour in `ui/src/Pages/Home/HomePage.tsx` and `ui/src/components/AqiVisualiser/AqiVisualiser.tsx`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Contributions, bug reports, and feature requests welcome!**
