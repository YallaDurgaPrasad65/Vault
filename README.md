# Vault - Secure File Storage Platform

![Vault Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)

---

## ✨ Features

- **Modern UI/UX**: Premium dark-themed glassmorphism design with fluid animations.
- **Secure Authentication**: JWT-based session management and bcrypt password hashing.
- **File Management**: Drag-and-drop file uploads, downloads, and deletions.
- **In-Browser Previews**: Built-in modal to view images, watch videos, and read PDFs without downloading.
- **Real-time Search**: Instantly filter your uploaded files by name.
- **Local Storage**: Uses a zero-configuration SQLite database (`better-sqlite3`) for easy deployment.

## 🛠️ Technology Stack

**Frontend:**
- Vanilla HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- CSS Variables & Flexbox/Grid for responsive layouts

**Backend:**
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/index.html) (via `better-sqlite3`)
- **Authentication:** `jsonwebtoken` & `bcryptjs`
- **File Handling:** `multer`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (or download the source code):
   ```bash
   git clone https://github.com/yourusername/vault-file-storage.git
   cd vault-file-storage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   The application uses a `.env` file for configuration. A default `.env` is provided, but you can modify it as needed:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key
   MAX_FILE_SIZE=52428800 # 50MB in bytes
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   *(Note: The `data.db` SQLite database and the `uploads/` directory will be generated automatically on startup).*

5. **Open in Browser:**
   Navigate to `http://localhost:3000` to access the login portal.

---

## 📁 Project Structure

```text
├── .env                  # Environment configuration
├── package.json          # Project metadata and dependencies
├── server.js             # Express application entry point
├── db.js                 # SQLite database initialization
├── SQL1.sql              # Database schema reference
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   ├── auth.js           # Signup and Login API routes
│   └── files.js          # File CRUD operations API
├── uploads/              # Automatically created directory for stored files
├── index.html            # Login interface
├── signup.html           # Registration interface
├── dashboard.html        # Main file management dashboard
├── style.css             # Global UI styles (Glassmorphism & animations)
├── dashboard.css         # Dashboard-specific layout styles
├── login.js              # Client-side login logic
├── signup.js             # Client-side registration logic
└── dashboard.js          # Client-side dashboard interactivity & API calls
```

---

## 🔐 API Reference

### Authentication
- `POST /api/auth/signup` - Register a new user account
- `POST /api/auth/login` - Authenticate and receive a JWT

### File Management (Requires `Authorization: Bearer <token>`)
- `GET /api/files` - Retrieve a list of the user's files
- `POST /api/files/upload` - Upload a new file (multipart/form-data)
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download a specific file
- `GET /api/files/:id/preview` - Stream file to browser for preview
- `DELETE /api/files/:id` - Permanently delete a file from disk and database

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
