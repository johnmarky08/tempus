<div align="center">
  <img src="public/favicon.png" alt="T.E.M.P.U.S. Logo" width="120" height="120" />

# T.E.M.P.U.S.

### Thermal and Energy Metrics: Predictive Utility and Safety

A Laravel + Svelte application that combines live-style dashboard presentation, Python-powered machine learning forecasting, and a clean Inertia-driven frontend for tracking fuel price movement and heat risk indicators with real-time safety assessments.

</div>

---

## Overview

T.E.M.P.U.S. is a comprehensive monitoring and forecasting platform built to help users keep track of:

- **Fuel Price Forecasting** — ARIMAX time-series predictions for fuel prices by type
- **Heat Index Forecasting** — Random Forest regression for temperature and heat-related forecasting
- **Outdoor Safety Assessments** — Random Forest classification for determining outdoor activity safety based on weather and demographic factors

The project separates concerns between the web UI layer (Laravel + Svelte) and the ML layer (Python), with a lightweight PHP bridge orchestrating Python subprocess execution.

## Features

- **Live Dashboard** — Home page with project branding, team showcase, and navigation to feature pages
- **Fuel Price Tracking** — Display historical fuel prices and ARIMAX-powered predictions with caching (controller caches per-horizon/n_lags)
- **Heat Index Forecast** — Real-time heat index data with Random Forest regression forecasts (hourly forecasts via `rfr`)
- **Safety Assessment** — On-demand safety assessment powered by a Random Forest classifier (`rfc`) — accessible via the Heat Index page (JSON API) and the UI form
- **History Views** — Dedicated history pages for fuel prices and heat-index records (`/history/fuel-prices`, `/history/heat-index`)
- **Database-Backed ML** — Training data stored in MySQL; Python scripts load tables directly via `ml-algorithms/db_utils.py`
- **JSON Contract Interface** — Python scripts output JSON; `ml-algorithms/bridge.php` decodes and returns data to Laravel controllers
- **Error Handling & Resilience** — Bridge-level exception handling, cache fallbacks, and clear error messages surfaced to the frontend
- **Performance Optimization** — Caching for expensive ARIMAX and RFR predictions; background jobs recommended for heavy workloads
- **Responsive Design** — Tailwind CSS with Svelte components for mobile and desktop

## Project Structure

```
.
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Controller.php            — Base controller
│   │       ├── FuelPricesController.php  — Fuel prices page with caching (calls `use_ml('arimax', ...)`)
│   │       ├── HeatIndexController.php   — Heat index page + safety assessment (calls `use_ml('rfr'|'rfc', ...)`)
│   │       └── HistoryController.php     — History pages for fuel prices and heat index
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
│   │   ├── History.svelte            — History landing page
│   │   ├── history/                  — History subpages
│   │   │   ├── fuelPrice.svelte      — Fuel prices history table
│   │   │   └── heatIndex.svelte      — Heat index history table
│   │   ├── About.svelte              — System Overview and Team information
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

## Tech Stacks

- Backend: Laravel (PHP), MySQL
- Frontend: Svelte, Vite, Tailwind CSS
- ML: Python (NumPy, Pandas, scikit-learn, statsmodels, PyMySQL)
- Tooling: Composer, npm, Vite, PHP Artisan

## Key ML Algorithms (files and brief CLI)

- `ml-algorithms/arimax.py` — ARIMAX/SARIMAX forecasting per fuel type
    - CLI: `python ml-algorithms/arimax.py <horizon> <n_lags>`
- `ml-algorithms/random-forest-regressor.py` — Heat-index regression (hourly forecasts)
    - CLI: `python ml-algorithms/random-forest-regressor.py <forecast_hours>`
- `ml-algorithms/random-forest-classifier.py` — Safety assessment classifier
    - CLI: `python ml-algorithms/random-forest-classifier.py <date> <temperature> <humidity> <wind_speed> <age_range> <exertion_level>`
- `ml-algorithms/db_utils.py` — Shared DB utilities for Python scripts
- `ml-algorithms/bridge.php` — PHP bridge that exposes `use_ml()` to controllers

## Local Setup

### Prerequisites

Ensure you have installed:

- **PHP** — Laravel requirement
- **Composer** — PHP package manager
- **Node.js** and **npm** — JavaScript tooling
- **Python** — ML script runtime
- **MySQL** or compatible — database server
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
- `GET /fuel-prices` — Fuel prices tracking (uses `FuelPricesController`)
- `GET|POST /heat-index` — Heat index page and safety assessment endpoint (renders page on GET; accepts JSON/POST assessment requests)
- `GET /history` — Redirects to `/history/fuel-prices`
- `GET /history/fuel-prices` — Fuel prices history table (`HistoryController::fuelPrices`)
- `GET /history/heat-index` — Heat index history table (`HistoryController::heatIndex`)
- `Fallback` — Unmatched routes render a 404 `NotFound` Svelte page

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

## Developers

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

---

<p align="center">
  <strong>T.E.M.P.U.S. — Thermal and Energy Metrics: Predictive Utility and Safety</strong>
  <br>
  Built using Laravel, Svelte, and Python
  <br>
  <em>Making energy and safety data accessible and actionable</em>
</p>
