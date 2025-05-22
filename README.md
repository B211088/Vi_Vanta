# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ViVanta Medical Platform

![ViVanta Logo](public/logo.png)

A modern medical platform built with React, Redux and TailwindCSS.

## 🚀 Features

- **User Authentication**

  - Login/Register with email verification
  - JWT authentication with HTTP-only cookies
  - Protected routes and role-based access

- **User Profile Management**

  - Personal information updates
  - Profile picture upload
  - Address management

- **Medical Services**
  - Appointment booking
  - Medical records
  - Doctor consultations

## 🛠️ Tech Stack

- **Frontend**
  - React 18
  - Redux Toolkit
  - TailwindCSS
  - React Router v6
- **Backend**
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/vivanta.git
```

2. Install frontend dependencies

```bash
cd client
npm install
```

3. Install backend dependencies

```bash
cd server
npm install
```

4. Set up environment variables

```bash
# Create .env file in server directory
cp .env.example .env
```

5. Start development servers

```bash
# Start frontend (in client directory)
npm run dev

# Start backend (in server directory)
npm run dev
```

## 📝 Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
