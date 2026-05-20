<div align="center">
  <img src="public/favicon.png" alt="T.E.M.P.U.S. Logo" width="120" height="120" />

# T.E.M.P.U.S.

### Thermal and Energy Metrics: Predictive Utility and Safety

A Laravel 12 + Svelte 4 application that combines live-style dashboard presentation, Python-powered machine learning forecasting, and a clean Inertia-driven frontend for tracking fuel price movement and heat risk indicators with real-time safety assessments.

</div>

---

## Overview

T.E.M.P.U.S. is a comprehensive monitoring and forecasting platform built to help users keep track of:

- **Fuel Price Forecasting** — ARIMAX time-series predictions for fuel prices by type
- **Heat Index Trends** — Random Forest regression for temperature and heat-related forecasting
- **Outdoor Safety Assessments** — Random Forest classification for determining outdoor activity safety based on weather and demographic factors

The project separates concerns between the web UI layer (Laravel + Svelte) and the ML layer (Python), with a lightweight PHP bridge orchestrating Python subprocess execution.

## Tech Stack

### Backend

- **Laravel 12** — web framework for routing, controllers, and API orchestration
- **PHP 8.2+** — server language
- **Inertia.js 2.0** — reactive page component framework
- **MySQL** — database for training data and application state

### Frontend

- **Svelte 4** — reactive UI component framework
- **Vite 4.5** — build tooling and dev server
- **Tailwind CSS 3.4** — utility-first styling
- **Bootstrap 5.3** — component library
- **Axios 1.11** — HTTP client
- **JavaScript ES6+** — client-side logic

### Machine Learning & Data

- **Python 3** — ML script runtime
- **NumPy 2.4.6** — numerical computing
- **Pandas 3.0.3** — data manipulation and analysis
- **scikit-learn 1.8** — machine learning algorithms (RandomForest, preprocessing)
- **statsmodels 0.14.6** — ARIMAX time-series forecasting
- **PyMySQL 1.1** — Python-MySQL connector

### Build & Development Tools

- **Composer** — PHP dependency manager
- **npm** — Node.js package manager
- **Vite** — JavaScript bundler
- **Laravel Artisan** — CLI toolkit
- **Concurrently** — parallel process runner

## Database Schema

The application uses three primary ML data tables populated by seeders from XLSX datasets:

### fuel_prices

- `id` (Integer, Primary Key)
- `date` (Date)
- `price` (Decimal)
- `fuel_type` (String) — e.g., "Diesel", "Gasoline"
- `exchange_rate_to_usd` (Decimal)
- `normal_supply_flag` (Boolean)
- `timestamps`

### heat_index

- `id` (Integer, Primary Key)
- `date` (DateTime) — hourly granularity
- `temperature` (Decimal)
- `humidity` (Decimal)
- `wind_speed` (Decimal)
- `heat_index` (Decimal) — calculated or observed
- `timestamps`

### safety_assessment

- `id` (Integer, Primary Key)
- `date` (Date)
- `temperature` (Decimal)
- `humidity` (Decimal)
- `wind_speed` (Decimal)
- `age_range` (String) — e.g., "18-39", "40-59", "60+"
- `exertion_level` (Integer) — activity intensity
- `safety_label` (String) — classification label (e.g., "Safe", "Unsafe", "Moderate Risk")
- `timestamps`

## Features

- **Live Dashboard** — Home page with project branding, team showcase, and navigation to feature pages
- **Fuel Price Tracking** — Display historical fuel prices and ARIMAX-powered predictions with caching
- **Heat Index Forecast** — Real-time heat index data with Random Forest regression forecasts
- **Safety Assessment Page** — Interactive form for outdoor safety risk classification
- **Sample/Test Pages** — Dedicated Svelte pages for each ML model with configurable inputs and JSON result display
- **Database-Backed ML** — Training data stored in MySQL, loaded directly by Python scripts
- **JSON Contract Interface** — Python scripts output JSON; bridge decodes and controllers forward to frontend
- **Error Handling** — Bridge-level exception handling with descriptive error messages to users
- **Performance Optimization** — Caching layer for expensive ARIMAX predictions
- **Responsive Design** — Tailwind CSS with Svelte components for mobile and desktop

## Project Structure

```
.
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── ArimaxController.php      — ARIMAX endpoint
│   │       ├── RfrController.php         — Random Forest Regressor endpoint
│   │       ├── RfcController.php         — Random Forest Classifier endpoint
│   │       └── FuelPricesController.php  — Fuel prices page with caching
│   ├── Models/
│   │   └── User.php
│   ├── Utils/
│   │   └── HeatIndex.php
│   └── Providers/
├── ml-algorithms/
│   ├── bridge.php                    — PHP-Python subprocess bridge
│   ├── arimax.py                     — ARIMAX forecasting script
│   ├── random-forest-regressor.py   — Heat index forecasting
│   ├── random-forest-classifier.py  — Safety classification
│   └── db_utils.py                   — Database connection utilities
├── database/
│   ├── migrations/
│   │   ├── *_create_users_table.php
│   │   ├── *_create_fuel_prices_table.php
│   │   ├── *_create_heat_index_table.php
│   │   └── *_create_safety_assessment_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── FuelPricesSeeder.php      — Seeds from datasets/
│   │   ├── HeatIndexSeeder.php
│   │   └── SafetyAssessmentSeeder.php
│   └── factories/
├── resources/
│   ├── pages/
│   │   ├── Home.svelte               — Home/dashboard
│   │   ├── FuelPrice.svelte          — Fuel prices tracking
│   │   ├── HeatIndex.svelte          — Heat index display
│   │   ├── History.svelte            — Historical data
│   │   ├── About.svelte              — Team information
│   │   └── samples/
│   │       ├── arimax.svelte         — ARIMAX sample/test page
│   │       ├── rfr.svelte            — RFR sample/test page
│   │       └── rfc.svelte            — RFC sample/test page
│   ├── js/
│   │   ├── app.js                    — Main app entry
│   │   ├── bootstrap.js              — Inertia/Svelte setup
│   │   ├── theme.js                  — Theme switching
│   │   └── *.js                      — Utility modules
│   ├── views/
│   │   └── app.blade.php             — Blade template
│   └── css/
│       └── app.css
├── routes/
│   ├── web.php                       — Main route definitions
│   └── console.php
├── config/
│   ├── app.php, database.php, etc.  — Application configuration
├── datasets/
│   └── *.xlsx                        — Training data sources
├── public/
│   ├── index.php
│   └── images/
├── storage/                          — Logs, cache, temp files
├── tests/                            — Test suite
├── .env.example                      — Environment template
├── composer.json, package.json       — Dependencies
├── requirements.txt                  — Python dependencies
├── phpunit.xml, vite.config.js, etc. — Build config files
└── README.md                         — This file
```

## Local Setup

### Prerequisites

Ensure you have installed:

- **PHP 8.2+** — Laravel requirement
- **Composer 2.x+** — PHP package manager
- **Node.js 18+** and **npm 9+** — JavaScript tooling
- **Python 3.9+** — ML script runtime
- **MySQL 8.0+** or compatible — database server
- **Git** — version control

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd tempus

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Create Python virtual environment and install Python dependencies
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and generate an application key:

```bash
copy .env.example .env
```

Edit `.env` and configure your database connection:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tempus
DB_USERNAME=root
DB_PASSWORD=
```

Also set the Python executable path (optional; the bridge auto-detects `.venv`):

```env
PYTHON_EXECUTABLE=C:\path\to\python.exe
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

### 3. Database Setup

Run migrations to create tables:

```bash
php artisan migrate
```

Seed the database with training data from XLSX files in the `datasets/` folder:

```bash
php artisan db:seed
```

The seeders (`FuelPricesSeeder`, `HeatIndexSeeder`, `SafetyAssessmentSeeder`) read the first sheet of each XLSX file and populate the corresponding database tables.

### 4. Verify Python & Database Connection

Test that Python can connect to the database:

```bash
# Activate virtual environment if not already active
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Run a quick test script
python ml-algorithms/db_utils.py
```

## Running the Application

### Quick Start (Development Mode)

Start all services with a single command:

```bash
composer run dev
```

This runs:

- Laravel development server (default: `http://localhost:8000`)
- Vite development server with hot module replacement (HMR)
- Queue listener (for background jobs)

### Alternative: Run Services Separately

If you prefer manual control:

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start Vite dev server
npm run dev
```

### Build for Production

```bash
npm run build
php artisan config:cache
```

### Important Notes

- **Python Executable**: The bridge (`ml-algorithms/bridge.php`) automatically looks for Python in this order:
    1. `PYTHON_EXECUTABLE` environment variable (if set)
    2. `.venv/Scripts/python.exe` (repository virtual environment)
    3. System `python` command
- **Virtual Environment**: Always activate the `.venv` before running artisan commands or starting the app if you want to ensure ML scripts use the bundled interpreter.

- **Database Encoding**: Ensure MySQL uses `utf8mb4` charset for full character support (configured in migrations).

## API Endpoints & Routes

### Main Pages

- `GET /` — Redirects to `/home`
- `GET /home` — Home dashboard
- `GET /about` — Team/About page
- `GET /fuel-prices` — Fuel prices tracking with predictions
- `GET /heat-index` — Heat index display page
- `GET /history` — Historical data view

### ML Sample/Test Pages

These pages allow interactive testing of each ML model with configurable inputs:

- `GET /sample/arimax?horizon=7&n_lags=3&run=1` — ARIMAX forecasting test
- `GET /sample/rfr?forecast_hours=24&run=1` — Random Forest Regressor test
- `GET /sample/rfc?temperature=34&humidity=53&wind_speed=16&age_range=18-39&exertion_level=3&run=1` — Random Forest Classifier test

**Note:** Append `&run=1` to execute the ML model; otherwise, inputs are displayed without results.

### Response Format

All ML endpoints return Inertia-rendered Svelte components with props:

```javascript
{
  algorithm: "arimax|rfr|rfc",
  inputs: { /* ...input parameters... */ },
  result: { /* ...JSON output from Python script... */ },
  error: null,  // or error message string if execution failed
  note: "..."   // contextual information
}
```

## Controllers

### ArimaxController

Handles ARIMAX fuel price forecasting. Accepts `horizon` (forecast days) and `n_lags` (AR lags) query parameters.

### RfrController

Handles Random Forest Regressor for heat index forecasting. Accepts `forecast_hours` query parameter.

### RfcController

Handles Random Forest Classifier for outdoor safety assessment. Accepts temperature, humidity, wind_speed, age_range, and exertion_level query parameters.

### FuelPricesController

Displays historical fuel prices and cached ARIMAX predictions. Includes `refresh=1` query parameter to bypass cache.

## Team

### John Marky Natividad

- **GitHub:** https://github.com/johnmarky08
- **Facebook:** https://facebook.com/johnmarky.natividad
- **Email:** johnmarky.dev@gmail.com

### Nico Gabriel Domingo

- **GitHub:** https://github.com/dnekooo
- **Facebook:** https://facebook.com/nekoo.d6
- **Email:** domingonicogabriel06@gmail.com

### Joshua Bartolome

- **GitHub:** https://github.com/J0SH-ua
- **Facebook:** https://facebook.com/joshua.bartolome.906
- **Email:** bartolomej863@gmail.com

## How the ML Pipeline Works

T.E.M.P.U.S. implements a clean separation of concerns between the web tier (Laravel + Svelte) and the ML tier (Python), orchestrated by a lightweight PHP-Python bridge.

### Data Flow

1. **Data Preparation**
    - XLSX source files in `datasets/` are loaded by seeders
    - Seeders read the first sheet and insert records into the corresponding MySQL tables
    - Heat index table stores hourly granularity (datetime values)
    - Fuel prices and safety assessment tables store daily or event-level granularity

2. **Python ML Scripts**
    - Each ML algorithm is a standalone CLI script in `ml-algorithms/`:
        - **arimax.py** — ARIMAX time-series forecasting per fuel type
            - Reads `fuel_prices` table (date, price, fuel_type, exchange_rate_to_usd, normal_supply_flag)
            - Performs automated hyperparameter grid search (p, d, q, P, D, Q orders)
            - Supports configurable `horizon` (days to forecast) and `n_lags` (autoregressive lags)
            - Uses `statsmodels.tsa.arima.ARIMA` for modeling
            - Outputs JSON: forecast values, confidence intervals, and metadata
        - **random-forest-regressor.py** — Heat index regression for forecasting
            - Reads `heat_index` table (datetime, temperature, humidity, wind_speed, heat_index)
            - Engineers rolling lag features for temporal dependencies
            - Trains `RandomForestRegressor` on historical patterns
            - Accepts `forecast_hours` parameter for multi-step ahead prediction
            - Outputs JSON: predicted heat index values and feature importance
        - **random-forest-classifier.py** — Safety classification for outdoor activity
            - Reads `safety_assessment` table (date, temperature, humidity, wind_speed, age_range, exertion_level, safety_label)
            - Preprocesses categorical features (one-hot encoding for age_range)
            - Trains `RandomForestClassifier` to predict safety labels
            - Accepts inference features (temperature, humidity, wind_speed, age_range, exertion_level) via CLI args
            - Outputs JSON: predicted class and probability scores

    - All Python scripts use `ml-algorithms/db_utils.py` for database connectivity:
        - Loads connection settings from `.env` file (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
        - Returns pandas DataFrames with optional date parsing
        - Handles date/datetime columns appropriately per table schema

3. **PHP Bridge Layer**
    - `ml-algorithms/bridge.php` exports the `use_ml()` function
    - Bridge launches the appropriate Python script as a subprocess
    - Passes CLI arguments safely using `escapeshellarg()`
    - Captures stdout (JSON) and stderr (error messages)
    - Decodes JSON and returns PHP objects/arrays, or throws exceptions on error
    - Disables PHP execution time limits for long-running ARIMAX grid search

4. **Laravel Controllers**
    - Controllers load the bridge function and call `use_ml(script, ...args)`
    - Catch exceptions and format error messages for frontend display
    - Return data as Inertia props to Svelte pages
    - Can cache results (e.g., `FuelPricesController` caches ARIMAX predictions indefinitely)
    - Display inputs, results, and error states to users

5. **Svelte Frontend**
    - Svelte components receive props from Inertia responses
    - Display input forms or parameters used by ML model
    - Show results in formatted tables or JSON displays
    - Display error messages if ML execution fails
    - Sample pages (`arimax.svelte`, `rfr.svelte`, `rfc.svelte`) show raw JSON for debugging

### Key Architectural Patterns

- **JSON Contract**: Python scripts output structured JSON; bridge and controllers pass it unchanged to frontend
- **Stateless Inference**: RFC is pure inference; ARIMAX and RFR train on historical data at request time
- **Lazy Loading**: Bridge function loaded on-demand in controllers; Python interpreter path resolved at runtime
- **Error Propagation**: Python errors surface with descriptive messages to help debugging
- **Caching**: FuelPricesController caches ARIMAX results to reduce computation overhead

### Best Practices & Recommendations

1. **Long-Running Tasks**
    - ARIMAX grid search can be slow for large histories (multiple fuel types, auto p/d/q search)
    - For production, offload to Laravel queued jobs and return async results via polling/WebSocket
    - Use `set_time_limit(0)` in bridge to handle long execution times

2. **Reproducibility**
    - Always use the bundled `.venv` virtual environment for consistent package versions
    - Activate `.venv` before running artisan commands or starting the dev server
    - Version-pin all Python packages in `requirements.txt`

3. **Database**
    - Ensure MySQL charset is `utf8mb4` (configured in migrations)
    - PyMySQL connection uses `autocommit=True` to avoid transaction issues
    - Seeders insert records in bulk; expect multi-second seeding for large XLSX files

4. **Error Handling**
    - Bridge throws `InvalidArgumentException` for wrong argument counts
    - Bridge throws `RuntimeException` if Python exits non-zero or returns invalid JSON
    - Controllers display error text in the `error` prop; sample pages show it in red

5. **Extensibility**
    - To add a new ML model:
        1. Create a Python script in `ml-algorithms/` following the JSON stdout contract
        2. Register it in `use_ml()` switch statement in `bridge.php`
        3. Create a Laravel controller that calls `use_ml()`
        4. Create a Svelte page and add a route in `routes/web.php`

6. **Performance Optimization**
    - Cache expensive results (ARIMAX predictions are cached indefinitely in FuelPricesController)
    - Use database indexes on date columns for faster seeding and queries
    - Consider running ARIMAX training in a background job for production

## Configuration Files

- **`.env`** — Environment variables (database, Python path, app key)
- **`config/database.php`** — Database connection settings
- **`config/app.php`** — Laravel framework configuration
- **`vite.config.js`** — Vite build tool configuration
- **`tailwind.config.js`** — Tailwind CSS customization
- **`postcss.config.js`** — PostCSS plugins (autoprefixer, tailwind)
- **`phpunit.xml`** — PHPUnit test configuration
- **`requirements.txt`** — Python package versions

## Notes & Troubleshooting

### Common Issues

1. **"Python process failed" or "Invalid JSON output"**
    - Ensure MySQL is running and credentials in `.env` are correct
    - Check that the virtual environment is activated and `requirements.txt` is installed
    - Run a quick test: `python ml-algorithms/db_utils.py` to verify DB connectivity

2. **"Python script not found"**
    - Verify the script exists in `ml-algorithms/` and file permissions are correct

3. **Slow ARIMAX predictions**
    - ARIMAX grid search is computationally expensive; this is normal for large datasets
    - Use smaller `horizon` or `n_lags` values for quicker results in development

4. **Database seeding takes a long time**
    - Large XLSX files (1000+ rows) may take several seconds to seed
    - This is expected; one-time operation during setup

5. **Vite hot reload not working**
    - Ensure `npm run dev` is running in a separate terminal
    - Check that your editor/browser allows Vite HMR connections

### Useful Commands

```bash
# View application logs
tail -f storage/logs/laravel.log

# Run tests
php artisan test

# Clear all caches
php artisan cache:clear

# Refresh database (wipe and reseed)
php artisan migrate:fresh --seed

# Check Laravel tinker shell
php artisan tinker

# View registered routes
php artisan route:list
```

---

<p align="center">
  <strong>T.E.M.P.U.S. — Thermal and Energy Metrics: Predictive Utility and Safety</strong>
  <br>
  Built using Laravel 12, Svelte 4, and Python 3
  <br>
  <em>Making energy and safety data accessible and actionable</em>
</p>
