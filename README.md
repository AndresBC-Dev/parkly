# 🅿️ Parkly - Parking Management System

Parkly is a professional, full-stack parking management solution designed to handle vehicle flow (cars and motorcycles) in real-time. Built with a focus on speed, reliability, and modern aesthetics.

![Parkly Header](https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200)

## 🚀 Features

-   **Real-time Dashboard**: Live occupancy tracking for cars (30 spaces) and motorcycles (15 spaces).
-   **Intelligent Pricing**: Support for Minute, Hour, 15-min Fraction, and Day billing cycles.
-   **Multi-Currency Engine**: System-wide support for **COP, USD, and EUR** with automatic historical conversion.
-   **Persistent Storage**: MySQL 8.0 integration with automatic schema migration.
-   **Dockerized**: Entire stack (DB + API + Web) containerized for one-click deployment.
-   **Modern UX**: Dark-mode primary UI, smooth animations, and a floating WhatsApp support button.
-   **Security**: Bcrypt-encrypted authentication and role-based access control.

## 🛠️ Tech Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons.
-   **Backend**: Go (Golang) 1.22, Go-Chi (Router), CORS middleware.
-   **Database**: MySQL 8.0.
-   **Infrastructure**: Docker, Docker Compose, Nginx (Frontend server).

## 📦 Project Structure

```text
parkly/
├── parkly-frontend/   # React Application (Nginx container)
├── parkly-backend/    # Go API (Golang container)
├── docker-compose.yml # Service orchestration
└── ...config files
```

## ⚡ Quick Start

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/AndresBC-Dev/parkly.git
    cd parkly
    ```

2.  **Start the entire stack**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the applications**:
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend API**: [http://localhost:8080](http://localhost:8080)
    -   **Database**: Port `3306` (User: `root`, Password: `rootpassword`)

## 🔑 Default Credentials

-   **User**: `Andres Buitrago` (or `admin`)
-   **Password**: `password` (Currently mocked for easy entry)

## 📋 Requirements Compliance

This project was built following the official requirements for the "Software Development Activity":
-   [x] Capacity: 30 cars / 15 motorcycles.
-   [x] Different rates for Sedan, SUV, and Motorcycle.
-   [x] Entry/Exit registration with automatic pricing.
-   [x] Real-time cupos (spaces) validation.
-   [x] Persistent storage in MySQL.
-   [x] WhatsApp integration.

---

Developed by **Andres Buitrago** with ❤️ and Go.
