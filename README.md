# MandiConnect Spring Boot API

This module supplies the API layer for the Crop Price Prediction & Mandi Connect Platform.

## Endpoints

- `GET /api/health`
- `GET /api/centres`
- `GET /api/farmers?mandiId=CTR-001`
- `GET /api/price-forecasts`

## Run from IntelliJ IDEA

1. Open the `backend` folder as a Maven project.
2. Open `MandiConnectApplication.java`.
3. Click the green Run icon beside `main`.
4. The API starts at `http://localhost:8080`.

The Angular frontend reads price forecasts from `http://localhost:8080/api/price-forecasts`. It retains simulated forecast cards only when the API is offline.

## Current scope

The API deliberately uses in-memory demo data. MySQL/JPA authentication and production market-data integrations can be added as the next phase without changing the REST route contract.
