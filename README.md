# 🎟️ Eventive - Full Stack Event Management System

**Eventive** is a modern, full-stack web application designed for browsing, creating, and managing events. It provides a seamless experience for users to discover and purchase tickets for upcoming events, and a powerful dashboard for administrators to manage all event-related operations.

The platform is built with the MERN stack (MongoDB, Express, React, Node.js) and integrates third-party services like Cloudinary for image hosting and Paddle for secure payment processing.

**Live Demo:** https://eventive-red.vercel.app

## Table of Contents

- [Features](#features)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Seeding the Database](#seeding-the-database)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

## Features

### User Features

- **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
- **Event Discovery:** A clean, responsive homepage that displays upcoming events with a "Load More" pagination feature.
- **Detailed Event View:** Users can click on any event to view detailed information, including date, location, description, price, and remaining tickets.
- **Secure Ticket Purchasing:** Integration with **Paddle (Billing)** for secure, overlay-based checkout.
- **Real-time Ticket Availability:** The number of available tickets for an event decreases in real-time after a successful purchase via Paddle Webhooks.
- **Personal Booking Page:** A private "My Bookings" page where users can view all their past ticket purchases, prefetched on login for a fast user experience.
- **Post-Purchase Experience:** A dedicated payment success page confirms the transaction, showing the unique transaction ID and providing clear next steps.

### Admin Features

- **Protected Admin Dashboard:** A dedicated and secure dashboard accessible only to admin users, featuring a fixed form and a scrollable event list for easy management.
- **Full CRUD for Events:**
  - **Create:** Admins can create new events via a comprehensive form.
  - **Read:** Admins can view all events (including past events) in a scrollable list.
  - **Update:** Admins can edit all key details of an existing event, including name, date, location, price, and total ticket count.
  - **Delete:** Admins can permanently delete events, which also removes the associated image from Cloudinary.
- **Cloudinary Image Uploads:** Event images are securely uploaded directly from the browser to a Cloudinary bucket.
- **Programmatic Paddle Integration:** When an admin creates or updates an event's price, the system automatically creates or archives corresponding products and prices via the Paddle API.

## Tech Stack

### Frontend

- **React 18:** For building the user interface with Hooks.
- **React Router v6:** For client-side routing and navigation.
- **Tailwind CSS:** For a modern, utility-first CSS framework.
- **Axios:** For making API requests to the backend.
- **`@paddle/paddle-js`:** The official NPM package for modern Paddle Billing integration.
- **Heroicons:** For high-quality SVG icons.

### Backend

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web application framework for building the REST API.
- **MongoDB:** NoSQL database for storing user, event, and booking data.
- **Mongoose:** ODM (Object Data Modeling) library for MongoDB.
- **JSON Web Token (JWT):** For secure user authentication.
- **`bcrypt.js`:** For hashing user passwords.
- **Paddle API:** For programmatic product/price creation.
- **Cloudinary API:** For image hosting and management.

### Development & Deployment

- **`dotenv`:** For managing environment variables.
- **Vite:** (or Create React App) For the frontend build tooling.
- **CORS:** For handling Cross-Origin Resource Sharing.

## System Architecture

The application follows a standard client-server architecture.

1.  The **React frontend** serves as the user interface, managing UI state and making API calls to the backend. It uses a Context API (`AuthContext`, `PaddleContext`) for global state management.
2.  The **Express backend** provides a RESTful API for all CRUD operations and handles business logic.
3.  **Authentication** is managed by JWTs. The frontend stores the token in `localStorage` and sends it in the `Authorization` header of protected requests. A `protect` middleware on the backend verifies the token.
4.  **Image uploads** use a secure, signed-upload flow. The frontend requests a signature from the backend, then uploads the file directly to Cloudinary. This avoids proxying large files through the server.
5.  **Payment processing** is offloaded to Paddle. A secure webhook from Paddle to the backend confirms successful transactions and triggers database updates (e.g., decrementing ticket count), ensuring a reliable system of record.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- **Node.js** (v18.x or later recommended)
- **npm** or **yarn**
- **MongoDB:** A running instance (either local or a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Paddle Sandbox Account (Billing):** For payment testing.
- **Cloudinary Account:** For image hosting.
- **`ngrok`:** (Recommended for testing webhooks locally)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/eventive.git
    cd eventive
    ```

2.  **Install backend dependencies:**

    ```bash
    cd server
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Environment Configuration

1.  In the `server` directory, create a `.env` file and add the following variables:

    ```ini
    # Server & Database
    PORT=5001
    MONGO_URI=your_mongodb_connection_string

    # Authentication
    JWT_SECRET=a_very_strong_and_long_secret_for_jwt

    # Paddle Billing (Get from your SANDBOX account)
    PADDLE_ENVIRONMENT=sandbox
    PADDLE_API_KEY=your_sandbox_api_key_starts_with_ts_...
    PADDLE_CLIENT_TOKEN=your_test_client_side_token_starts_with_test_...

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

2.  In the `client` directory, create a `.env` file and add your API URL:
    ```ini
    # client/.env
    VITE_APP_API_URL=http://localhost:5000/api
    ```
    _(Note: The variable name must start with `VITE_` if you are using Vite, or `REACT_APP_` for Create React App)._

## Usage

### Running the Application

1.  **Start the backend server:** From the `server` directory, run:

    ```bash
    npm start
    ```

    The server will be running on `http://localhost:5001`.

2.  **Start the frontend development server:** From the `client` directory, run:
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:5173` (or another port).

### Seeding the Database

To populate your database with sample admin/user accounts and events for testing:

1.  Navigate to the `server` directory.
2.  Run the import script:

    ```bash
    npm run data:import
    ```

3.  To clear the database, run:
    ```bash
    npm run data:destroy
    ```
    The sample credentials are:
    - **Admin:** `admin@example.com` / `password123`
    - **User:** `user@example.com` / `password123`

## API Endpoints

A brief overview of the main API routes. All protected routes require a `Bearer <token>` header.

| Method   | Endpoint                           | Description                                | Access  |
| :------- | :--------------------------------- | :----------------------------------------- | :------ |
| `POST`   | `/api/auth/register`               | Register a new user.                       | Public  |
| `POST`   | `/api/auth/login`                  | Authenticate a user and get a token.       | Public  |
| `GET`    | `/api/events`                      | Get paginated, upcoming events.            | Public  |
| `GET`    | `/api/events?view=admin`           | Get all events for the admin dashboard.    | Admin   |
| `POST`   | `/api/events`                      | Create a new event.                        | Admin   |
| `GET`    | `/api/events/:id`                  | Get details for a single event.            | Public  |
| `PUT`    | `/api/events/:id`                  | Update an event.                           | Admin   |
| `DELETE` | `/api/events/:id`                  | Delete an event.                           | Admin   |
| `GET`    | `/api/events/cloudinary-signature` | Get a signature for secure image uploads.  | Admin   |
| `GET`    | `/api/bookings/mybookings`         | Get all bookings for the logged-in user.   | Private |
| `GET`    | `/api/bookings/latest`             | Get the latest booking after a purchase.   | Private |
| `POST`   | `/api/webhooks/paddle`             | Webhook endpoint for Paddle notifications. | Public  |
| `GET`    | `/api/config`                      | Get public frontend configuration.         | Public  |

## Project Structure

```
📦 EazyByts-Final-Project
├─ backend
│  ├─ .gitignore
│  ├─ api
│  │  └─ index.js
│  ├─ config
│  │  ├─ cloudinary.js
│  │  └─ db.js
│  ├─ controllers
│  │  ├─ authController.js
│  │  ├─ bookingController.js
│  │  └─ eventController.js
│  ├─ middleware
│  │  └─ authMiddleware.js
│  ├─ models
│  │  ├─ Booking.js
│  │  ├─ Event.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  ├─ bookingRoutes.js
│  │  ├─ eventRoutes.js
│  │  └─ webhookRoutes.js
│  ├─ seeder
│  │  ├─ data
│  │  │  ├─ events.js
│  │  │  └─ users.js
│  │  └─ seeder.js
│  └─ vercel.json
└─ frontend
   ├─ .gitignore
   ├─ README.md
   ├─ eslint.config.js
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ public
   │  └─ vite.svg
   ├─ src
   │  ├─ App.css
   │  ├─ App.jsx
   │  ├─ api
   │  │  └─ axiosConfig.js
   │  ├─ assets
   │  │  └─ react.svg
   │  ├─ components
   │  │  ├─ events
   │  │  │  └─ EventCard.jsx
   │  │  ├─ layout
   │  │  │  ├─ Footer.jsx
   │  │  │  └─ Header.jsx
   │  │  ├─ routes
   │  │  │  ├─ AdminRoute.jsx
   │  │  │  └─ PrivateRoute.jsx
   │  │  └─ utils
   │  │     ├─ PaddleLoader.jsx
   │  │     └─ Spinner.jsx
   │  ├─ contexts
   │  │  ├─ AuthContext.jsx
   │  │  └─ PaddleContext.jsx
   │  ├─ hooks
   │  │  ├─ useAuth.js
   │  │  └─ usePaddle.js
   │  ├─ index.css
   │  ├─ main.jsx
   │  └─ pages
   │     ├─ AdminDashboardPage.jsx
   │     ├─ EventDetailsPage.jsx
   │     ├─ HomePage.jsx
   │     ├─ LoginPage.jsx
   │     ├─ MyBookingPage.jsx
   │     ├─ NotFoundPage.jsx
   │     ├─ PaymentSuccessPage.jsx
   │     ├─ ProfilePage.jsx
   │     ├─ RegisterPage.jsx
   │     └─ admin
   │        ├─ AdminEventList.jsx
   │        └─ CreateEventForm.jsx
   ├─ tailwind.config.js
   ├─ vercel.json
   └─ vite.config.js
```

## Future Improvements

- **Email Notifications:** Send confirmation emails to users after a successful ticket purchase using a service like SendGrid or Resend.
- **Search & Filtering:** Add a search bar and filtering options (by date, location, category) on the homepage.
- **User Profiles:** Allow users to update their profile information and password.
- **Testing:** Add unit and integration tests using a framework like Jest and React Testing Library for the frontend, and Jest/Supertest for the backend.
- **Event Categories:** Introduce categories for events (e.g., Music, Tech, Art) and allow users to browse by category.
