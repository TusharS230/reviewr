# Reviewr — Community Code Snippets

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Java](https://img.shields.io/badge/Java-Spring_Boot-orange)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

**Reviewr** is a full-stack web application designed for developers to share, browse, and review code snippets. It provides a collaborative environment where users can post their code solutions and receive feedback and ratings from the community.

## ✨ Features

- **🔐 User Authentication:** Secure login and registration using JWT (JSON Web Tokens).
- **📝 Snippet Management:** Create, view, and manage code snippets across multiple languages (Java, JavaScript, Python, C++, SQL).
- **⭐ Review System:** Leave 1-5 star ratings and comments on community snippets.
- **🎨 Modern UI/UX:** A responsive, vanilla HTML/CSS/JS frontend featuring a seamless Dark/Light mode toggle.
- **🔍 Filtering & Sorting:** Easily filter snippets by programming language and sort them by newest, oldest, or alphabetical order.

---

## 🛠️ Technology Stack

**Backend:**
- Java & Spring Boot
- Spring Security (JWT Authentication)
- Spring Data JPA (Hibernate)
- PostgreSQL

**Frontend:**
- HTML5, CSS3 (SCSS)
- Vanilla JavaScript (ES6 Modules)
- Fetch API for RESTful integration

---

## 🚀 Local Development Setup

### Prerequisites
- JDK 17+
- PostgreSQL
- Maven

### 1. Database Setup
Create a local PostgreSQL database named `reviewr_db`:
```sql
CREATE DATABASE reviewr_db;
```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Update your database credentials in `src/main/resources/application.properties` if necessary.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Open `index.html` using a local web server (e.g., VS Code Live Server). 
3. The frontend is configured to automatically point to `http://localhost:8080/api` when run locally via `config.js`.

---

## ☁️ Deployment

This project is fully containerized and ready for cloud deployment.

### Backend (Render)
The backend includes a `Dockerfile`. To deploy on Render:
1. Create a New Web Service connected to this repository.
2. Set the **Root Directory** to `backend`.
3. Set the Environment Variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).

### Frontend (Netlify/Vercel)
The frontend consists of static files. 
1. Update `API_BASE_URL` in `frontend/js/config.js` to point to your live backend URL.
2. Deploy the `frontend` folder to Netlify or Vercel as a static site.

---

## 📄 License
This project is open-source and available under the MIT License.
