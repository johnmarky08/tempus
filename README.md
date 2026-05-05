## 🚀 Installation

Clone the repository and run the following commands in order:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## 🧪 Running the Project

To start the development server and compile frontend assets:

- Open XAMPP and start **Apache** and **MySQL**.
- Run the following: (Only run migrate once)

```bash
php artisan migrate
composer run dev
```

## ✅ Before Committing

Make sure to run a production frontend build before committing:

```bash
cp .env.example .env
```
