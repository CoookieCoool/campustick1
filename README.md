# CampusTick

<div align="center">
  <h3>A Full-Stack Web Application for Campus Event Ticketing and Management</h3>
</div>

## 📌 Overview
CampusTick is a micro-SaaS designed for university campuses. It allows students to discover and book tickets for campus events, and it empowers organizers to create events, manage capacities, and validate attendees efficiently using secure QR codes. The platform features a responsive, premium, dark-themed UI with glassmorphism aesthetics.

## ✨ Features
- **Role-Based Access Control**: Secure login and registration tailored for Students, Organizers, and Admins.
- **Event Discovery & Booking**: A seamless dashboard for students to view available campus events and book tickets with real-time seat availability updates.
- **Event Management**: Organizers can effortlessly create and manage events, including descriptions, venue details, and seating capacity.
- **QR Code Ticketing & Verification**: Automatic generation of secure QR code tickets upon successful booking. Organizers can scan QR tickets at the venue using a smartphone or webcam via the built-in scanner.
- **Immersive UI/UX**: Interactive design featuring custom components, a global `MouseGlow` pointer effect, optional micro-interactions, and dark-mode glassmorphism styling.

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, React Router DOM, Axios, HTML5-QRCode
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Security**: JWT (JSON Web Tokens), bcryptjs for password hashing

## 📂 Project Structure
- `/frontend`: React application configured with Vite.
- `/backend`: Node.js Express API server.
- `SRS.md`: Detailed Software Requirements Specification document.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with a [MongoDB](https://www.mongodb.com/) instance (local or Atlas cluster) running.

### 1. Backend Setup
Navigate into the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

Start the backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
Navigate into the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will typically run at `http://localhost:5173`.

## 👥 Usage Guide
- **Students**: Create an account, browse the dashboard for upcoming events, book your spot, and present the generated QR code at the event venue.
- **Organizers**: Register as an organizer (or get promoted), create new events, define seat capacities, and use the built-in scanner to validate student tickets in real-time.

## 🎓 Academic Context
This project was developed by B.Tech (CSE) 6th-semester students at **C.V. Raman Global University, Bhubaneswar**, for the Academic Year 2025-26.

---
*Please refer to [SRS.md](./SRS.md) for deeper architectural and database schema insights.*
