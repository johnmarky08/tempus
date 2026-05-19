<div align="center">
  <img src="public/favicon.png" alt="T.E.M.P.U.S. Logo" width="120" height="120" />

# T.E.M.P.U.S.

### Thermal and Energy Metrics: Predictive Utility and Safety

A Laravel + Svelte application that combines live-style dashboard presentation, Python-powered forecasting, and a clean Inertia-driven frontend for tracking fuel price movement and heat risk indicators.

</div>

---

## Overview

T.E.M.P.U.S. is a monitoring and forecasting platform built to help users keep track of:

- Fuel price changes through ARIMAX forecasting
- Heat index trends through Random Forest regression
- Outdoor safety risk levels through Random Forest classification

The project uses Laravel for routing and backend orchestration, Svelte for the UI, and Python scripts for the ML layer.

## Tech Stack

### Backend

- Laravel 12
- PHP 8.2+
- Inertia.js

### Frontend

- Svelte 4
- Vite
- Tailwind CSS
- JavaScript
- Axios

### Machine Learning

- Python 3
- NumPy
- Pandas
- scikit-learn
- statsmodels

### Design and Workflow Tools

- Figma
- Visual Studio Code
- Git / GitHub
- Google Colab

## Features

- Stylish home dashboard with project branding and team showcase
- Dedicated sample pages for each ML model
- Python bridge for executing forecasting scripts from Laravel
- Static datasets stored in the datasets folder for consistent local runs
- JSON output contract between Python and Laravel
- Inertia-powered navigation between Laravel and Svelte pages

## Project Structure

- app/Http/Controllers - Laravel controllers for each ML workflow
- ml-algorithms - Python forecasting scripts and PHP bridge
- resources/pages - Svelte pages rendered through Inertia
- resources/js - frontend bootstrapping and UI utilities
- public/images - logos, team images, and visual assets
- datasets - static CSV files used by the ML scripts

## Local Setup

### Prerequisites

Make sure you have the following installed:

- PHP 8.2 or later
- Composer
- Node.js and npm
- Python 3 with a working virtual environment

### Install Dependencies

```bash
composer install
npm install
pip install -r requirements.txt
```

### Environment Setup

```bash
copy .env.example .env
php artisan key:generate
```

If you are using a custom Python interpreter, set it in your environment before running the app:

```bash
set PYTHON_EXECUTABLE=C:\path\to\python.exe
```

### Database Setup

If you want to prepare the Laravel database locally, run:

```bash
php artisan migrate
```

## Run Locally

### Option 1: One-command development mode

```bash
composer run dev
```

This starts the Laravel server, queue listener, and Vite dev server together.

### Option 2: Run services separately

```bash
php artisan serve
npm run dev
```

If you need the Python ML layer to use the bundled virtual environment, the bridge will automatically prefer:

```bash
.venv/Scripts/python.exe
```

## Developer Info

### John Marky Natividad

- GitHub: https://github.com/johnmarky08
- Facebook: https://facebook.com/johnmarky.natividad
- Email: johnmarky.dev@gmail.com

### Nico Gabriel Domingo

- GitHub: https://github.com/dnekooo
- Facebook: https://facebook.com/nekoo.d6
- Email: domingonicogabriel06@gmail.com

### Joshua Bartolome

- GitHub: https://github.com/J0SH-ua
- Facebook: https://facebook.com/joshua.bartolome.906
- Email: bartolomej863@gmail.com

## Notes

- The datasets folder contains the static CSV files used by the ML scripts.
- The Python bridge is configured to use the workspace virtual environment first.
- The homepage and sample views are intentionally presentation-focused while the data logic lives in the Laravel and Python layers.

## How the ML pipeline works

This project separates concerns between the web UI (Laravel + Svelte) and the ML layer (Python). The high-level flow is:

- Data: static CSV datasets live in the `datasets/` folder (`fuel_prices.csv`, `heat_index.csv`, `safety_assessment.csv`).
- Python scripts: each ML algorithm is implemented in `ml-algorithms/`:
    - `arimax.py` — ARIMAX forecasting per fuel type (uses `statsmodels`, iterative lags, multi-process workers).
    - `random-forest-regressor.py` — heat index forecasting (feature engineering, rolling lags, RandomForestRegressor).
    - `random-forest-classifier.py` — outdoor safety classification (preprocessing, encoding, RandomForestClassifier).
- Bridge: `ml-algorithms/bridge.php` is a lightweight PHP bridge that launches the appropriate Python script as a subprocess, passing simple positional arguments and decoding JSON from stdout.
- Controllers: Laravel controllers call `use_ml(...)` (the bridge) and return the JSON payload as Inertia props to Svelte pages.

Key contract details:

- Input: the Python scripts read the CSVs from `datasets/` (no dynamic file upload in the current setup). Some scripts accept small CLI args (e.g. `horizon`, `n_lags`, `forecast_days`) and the classifier takes inference features.
- Output: each Python script prints a JSON object/array to stdout. The bridge decodes this JSON and returns it to Laravel; controllers forward it to the frontend in the `result` prop.

Operational notes and recommendations:

- Long-running tasks: ARIMAX performs grid search and may be slow for long histories. The bridge disables PHP request time limits, but for production you should move heavy training to a queued job (Laravel queue) and return async results.
- Reproducibility: the project provides `requirements.txt` and the bridge prefers the repository `.venv` interpreter. Use a dedicated virtual environment and install the requirements before running.
- Error handling: bridge throws structured exceptions when Python exits non-zero or emits invalid JSON; controllers display error text to the sample pages.
- Extensibility: to add a new model, add a Python CLI script following the JSON stdout contract, and expose it in `ml-algorithms/bridge.php` and a controller route.

---

<p align="center">
  Built with Laravel, Svelte, and Python for the T.E.M.P.U.S. project.
</p>
