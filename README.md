# Parking Management System

A web application built with **Node.js**, **Express**, **Sequelize**, **Angular**, and **PostgreSQL** to manage parking bookings. Users can register, log in, view their booking history, and manage bookings in real-time. The system utilizes **SendGrid** for sending registration and password emails to users.

---

## Table of Contents
1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Setup and Installation](#setup-and-installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
5. [Environment Variables](#environment-variables)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features
- **User Registration**: Allows users to register an account, after which they receive an email with a password to access the system.
- **Login**: Secure login functionality for users.
- **Booking Management**: Users can create, edit, and delete parking bookings.
- **Booking History**: Users can view their previous bookings.

---

## Technology Stack
- **Frontend**: Angular
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: SendGrid
- **Version Control**: Git

---

## Prerequisites

Before starting the setup, make sure you have the following installed:
- **Node.js** (>= 14.x)
- **npm** (>= 6.x)
- **PostgreSQL** (>= 13.x)
- **SendGrid** account for email functionality
- **Angular CLI** (if you are working with Angular frontend)
- **Git** for version control

---

## Setup and Installation

### Backend Setup (Node.js and Express)
1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/AyeshaMubasher/Parking_Reservation
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the database:
    - Create a PostgreSQL database (`Parking_Reservation_Sytem`) for the application.

4. Set up environment variables:
    - Create a `.env` file in the root directory and add the following values:
        ```ini
        API_KEY=your_sendgrid_api_key
        JWT_Secret_Key=your_jwt_secret_key
        Host=localhost
        DATABASE=Parking_Reservation_System
        USER_NAME=postgres
        PASSWORD=9697
        ```

5. Run the backend:
    ```bash
    npm start
    ```

    The backend will run on `http://localhost:8000`.

---

### Frontend Setup (Angular)
1. Open the frontend project.

2. Install frontend dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create `src/environments/environment.ts` and `src/environments/environment.developments` files and add the following:
        ```typescript
        export const environment = {
            domin: "http://localhost:8000"
        };
        ```

4. Run the Angular app:
    ```bash
    ng serve --open
    ```

    The frontend will be available at `http://localhost:4200`.

---

## Environment Variables

- **DATABASE**: Database Name
- **USER_NAME**: Database user name
- **PASSWORD**: Database password
- **API_KEY**: API key for SendGrid to send emails.
- **JWT_SECRET**: Secret key for signing JSON Web Tokens.

---

## Usage

1. **Register**: Navigate to the registration page and create an account. You will receive an email with your login password.
2. **Login**: Log in using the credentials sent to your email.
3. **Booking Management**:
   - **View Bookings**: After logging in, the homepage will show all your previous bookings.
   - **Add a Booking**: You can add a new parking booking by entering details like date, time, and parking spot.
   - **Edit/Delete Booking**: You can edit or delete any existing bookings.

---

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, create a new branch, and submit a pull request.

1. Fork the repository.
2. Clone your fork:
    ```bash
    git clone https://github.com/yourusername/Parking_Reservation.git
    ```
3. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
4. Make your changes and commit them:
    ```bash
    git commit -m "Add new feature"
    ```
5. Push your branch:
    ```bash
    git push origin feature-name
    ```
6. Create a pull request on GitHub.

---

## License

This project is licensed under the MIT License.
