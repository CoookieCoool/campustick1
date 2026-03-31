`<div align="center">
  <h3>CampusTick: Event tickting and management | SRS v1.0 | CVR Global University, CSE | March 2026</h3>
  <hr />
  <img src="https://upload.wikimedia.org/wikipedia/en/6/6a/C._V._Raman_Global_University_Logo.png" width="100" height="auto" alt="CVRGU Logo" />
  <h2>C.V. RAMAN GLOBAL UNIVERSITY</h2>
  <p>Department of Computer Science & Engineering<br/><em>Bhubaneswar, Odisha — Academic Year 2025-26</em></p>

  <h1>SOFTWARE REQUIREMENTS SPECIFICATION</h1>
  <h1>CampusTick</h1>
  <p><strong>A Full-Stack Web Application for Campus Event Ticketing and Management</strong></p>
</div>

<br/>

| Document Type | Software Requirements Specification (SRS) |
| :--- | :--- |
| **Version** | 1.0 |
| **Project Title** | CampusTick - Campus Event Ticketing System |
| **Application Name** | CampusTick |
| **Institution** | C.V. Raman Global University, Bhubaneswar, Odisha |
| **Department** | Computer Science & Engineering (CSE) |
| **Semester** | 6th Semester, B.Tech (CSE) |
| **Date** | March 2026 |

<br/>

<div align="center">
  <h3>Project Team Members</h3>
</div>

| S.No. | Name | Registration No. |
| :---: | :--- | :---: |
| **1.** | Raj Ratan Panigrahi | 2301020351 |
| **2.** | Charan Dipak Sahu | 2301020407 |
| **3.** | Ayushman Nayak | 2301020191 |
| **4.** | Jayprakash Sahu | 2301020079 |
| **5.** | Subham Behera | 2301020099 |

<hr/>

<div style="page-break-after: always;"></div>

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the requirements and technical specifications for **CampusTick**, a modern, full-stack campus event ticketing and management web application. It outlines the platform's features, architecture, and constraints to guide the development process. 

### 1.2 Scope
CampusTick is a micro-SaaS designed for university campuses. It allows students to discover and book tickets for campus events and empowers organizers to create events, manage capacities, and validate attendees efficiently using QR codes. The system features a responsive, premium, dark-themed UI with glassmorphism aesthetics.

### 1.3 Target Audience
- **Students**: To browse upcoming events, book tickets, and manage their event registrations.
- **Organizers / Clubs**: To list events, set ticket capacities, track registrations in real-time, and scan student tickets at the venue.
- **Admins**: To oversee platform operations.

---

## 2. Overall Description

### 2.1 Technology Stack
- **Frontend**: React 18, Vite, React Router DOM, Axios, HTML5-QRCode
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Additional Tools**: Nodemailer (Email distribution), QRCode (Ticket Generation)

### 2.2 System Features
1. **User Authentication & Authorization**: Secure login and registration with Role-Based Access Control (Student vs. Organizer).
2. **Event Discovery**: A dashboard for students to view available and upcoming campus events.
3. **Event Management**: Organizers can create events with specific details (title, description, venue, date, price, capacity).
4. **Ticket Booking**: Students can secure tickets. The system auto-updates available seating capacity.
5. **QR Code Verification**: Every generated ticket embeds a unique cryptographic string encoded into a QR Code. Organizers can scan the QR code via smartphone/webcam using the built-in `html5-qrcode` scanner.
6. **Immersive UI/UX**: Custom hooks and components for visual feedback, including a global `MouseGlow` pointer effect, optional `ClickSound` micro-interactions, page transition animations, and dark-mode glassmorphism styling.

---

## 3. Database Schema Design (MongoDB)

### 3.1 User Model
Stores user credentials and roles.
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed via *bcrypt*)
- `role` (Enum: `student`, `organizer`, `admin`)

### 3.2 Event Model
Stores event details created by organizers.
- `title`, `description`, `venue` (String)
- `date` (Date)
- `price` (Number, default 0)
- `capacity` (Number)
- `availableSeats` (Number, dynamically updated)
- `createdBy` (ObjectId ref to User)

### 3.3 Ticket Model
Maps users to events and securely stores QR status.
- `event` (ObjectId ref to Event)
- `user` (ObjectId ref to User)
- `qrData` (String, unique identifier payload for the QR)
- `qrCode` (String, Base64 data URL)
- `status` (Enum: `valid`, `used`, `cancelled`, default: `valid`)
- `scannedAt` (Date)

---

## 4. API Endpoints

### 4.1 Authentication Routes (/api/auth)
- `POST /register`: Register a new user account.
- `POST /login`: Authenticate and return JWT token.

### 4.2 Event Routes (/api/events)
- `GET /`: Fetch all available events.
- `GET /:id`: Fetch specific event detail.
- `POST /`: Create a new event (Organizer only).
- `PUT /:id` & `DELETE /:id`: Update or remove an event.

### 4.3 Ticket Routes (/api/tickets)
- `POST /book`: Book an event ticket and generate the QR code.
- `GET /my-tickets`: Fetch the authenticated user's booked tickets.
- `POST /scan`: Validate a QR code payload and update ticket status to `used` (Organizer only).

---

## 5. Security and Non-Functional Requirements
- **Data Protection**: Passwords are mathematically hashed via `bcryptjs` before insertion into MongoDB.
- **REST API Security**: Protected routes require valid `Authorization: Bearer <token>` headers. Roles are strictly enforced in routing middleware.
- **UI Responsiveness**: The app is built mobile-first, ensuring event viewing and ticket scanning work flawlessly on mobile and desktop browsers.
- **Cross-Origin Configuration**: Handled via `cors` to allow safe communication between frontend and backend ports.

---

## 6. Future Scope
- **Payment Gateway Integration**: Automating financial transactions for paid events directly through the app.
- **Email Confirmations**: Leveraging `nodemailer` to dispatch customized HTML event schedules to registrants.
- **Advanced Analytics**: Delivering organizers actionable insights into attendance rates vs. booking rates.
`
