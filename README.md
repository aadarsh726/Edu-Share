# Edu-Share
EduShare is a project used for sharing files and ideas .
# 🧠 EduShare - AI Summarizer & Knowledge Sharing Platform

EduShare is a **MERN stack-based web application** that allows students and educators to share notes, past papers, study resources, and AI-powered summaries.  
Built for modern learners, EduShare combines **community-driven resource sharing** with an **AI assistant** that helps users summarize and understand academic content efficiently.

---

## 🚀 Project Overview

EduShare is designed to simplify academic collaboration. Users can upload, discover, and summarize educational materials instantly using the integrated **AI Summarizer**, powered by Google’s Gemini API.  
The platform focuses on speed, simplicity, and scalability — making it a go-to hub for academic sharing and productivity.

---

## 🧩 Tech Stack

| Layer | Technology | Description |
|-------|-------------|-------------|
| **Frontend** | React.js | Component-based UI for seamless single-page experience |
| **Backend** | Express.js | RESTful API framework for routing and middleware |
| **Runtime Environment** | Node.js | JavaScript runtime for executing backend logic |
| **Database** | MongoDB (with Mongoose) | NoSQL database storing user, post, and resource data |
| **AI Integration** | Gemini API | Provides text summarization and Q&A capabilities |
| **Styling** | Tailwind CSS | Clean, responsive, and fast design system |

---

## 🔄 MERN Stack Data Flow

1. A user interacts with the **React client** (Frontend).
2. The client sends an API request (e.g., `/api/posts`) to the **Express.js** server.
3. Express validates the user’s token and communicates with **MongoDB** for fetching or saving data.
4. MongoDB returns a JSON response to Express.
5. Express forwards this response to React, which updates the UI instantly.

---

## 🧱 Architecture Components

### **MongoDB (Database)**
- Stores structured and semi-structured data using flexible JSON-like documents.
- **Advantages:**
  - Flexible schema – allows nested documents (e.g., Comments in Posts).
  - High performance and horizontal scalability.
- **EduShare Usage:**
  - Stores `User`, `Post`, and `Resource` collections.
  - Indexed `User.weeklyScore` and `User.lifetimeScore` for real-time leaderboard ranking.

### **Express.js (Backend Framework)**
- Minimal and fast web framework for Node.js.
- **Advantages:**
  - Middleware for modularizing logic (e.g., authentication, validation).
  - Routing for handling different HTTP requests (GET, POST, PUT, DELETE).
- **EduShare Usage:**
  - Defines secure routes like `/api/auth/register`, `/api/posts/like/:id`.
  - Custom middleware `protect` checks JWTs and attaches user data to requests.

### **React.js (Frontend Library)**
- Declarative JavaScript library for building interactive UIs.
- **Advantages:**
  - Component-based structure for modular and reusable design.
  - Virtual DOM ensures smooth and fast UI updates.
- **EduShare Usage:**
  - SPA (Single Page Application) experience.
  - Uses hooks (`useState`, `useEffect`) and Context API for global state and authentication handling.

### **Node.js (Runtime Environment)**
- Asynchronous, non-blocking runtime for building scalable backend systems.
- **Advantages:**
  - Single-threaded event loop handles multiple concurrent requests efficiently.
  - Same language (JavaScript) for both client and server logic.
- **EduShare Usage:**
  - Runs the Express API.
  - Manages scheduled background tasks (e.g., resetting weekly leaderboard).

---

## 🧠 AI Integration

The **EduShare AI Summarizer** uses Google’s **Gemini 2.0 Flash Experimental** model for generating concise, context-aware summaries.  
Users can paste long notes or study materials, and the AI condenses them into structured short answers or key points.

---

## 📆 Project Timeline

| Phase | Description | Duration |
|-------|--------------|-----------|
| **Phase 1** | Foundation & Design | Week 1–4 |
| **Phase 2** | Backend Core | Week 2–5 |
| **Phase 3** | Frontend Core | Week 3–6 |
| **Phase 4** | Feature Expansion | Week 4–8 |
| **Phase 5** | Advanced Features | Week 5–9 |
| **Phase 6** | Testing & Stabilisation | Week 6–10 |
| **Phase 7** | Documentation | Week 7–10 |

---

## 🧰 Key Features

- 🔐 **JWT Authentication** – Secure user login and route protection.
- 🧾 **AI Summarizer** – Summarizes long academic texts in seconds.
- 🧠 **Leaderboard** – Ranks top contributors weekly and all-time.
- 📤 **Upload & Share** – Share study materials, notes, and resources.
- 🕒 **Responsive UI** – Works seamlessly across desktop and mobile.
- ⚙️ **Background Scheduler** – Automated leaderboard reset using Node.js timers.

---


