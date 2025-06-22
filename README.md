# Profile Management Dashboard

A full-stack company dashboard application built using the **MERN stack** (MongoDB → PostgreSQL with Neon), enabling secure **Admin and Employee login**, **profile management**, and **admin-level control** over employee records.

---

## Live Demo

- 🔗 **Frontend**: [https://profile-management-frontend-gamma.vercel.app](https://profile-management-frontend-gamma.vercel.app)  
- 🔗 **Backend API**: [https://profile-management-backend-api.vercel.app](https://profile-management-backend-api.vercel.app)

---

## Features

### Authentication & Authorization
- Secure **JWT-based login/signup**
- Admin and Employee role separation
- Auth tokens stored securely using HTTP-only cookies

### Employee Functionality
- Sign up with personal details and profile picture
- View and edit their profile
- Delete their own account
- Logout securely

### Admin Functionality
- All employee functionalities
- Access a searchable employee dashboard
- Edit or delete **any employee's** account
- View quick stats: total users, recent activity, etc.

### Image Uploads
- Profile pictures uploaded via **Cloudinary**
- Image previews available before submission

### Tech Stack

| Layer        | Technology              | Description                                      |
|--------------|-------------------------|--------------------------------------------------|
| Frontend     | React.js (Vite)         | SPA framework for building responsive UI         |
| Backend      | Node.js + Express.js    | RESTful API development                          |
| Database     | Neon PostgreSQL         | Cloud-hosted serverless PostgreSQL               |
| Auth         | JSON Web Tokens (JWT)   | Secure login/logout with role-based access       |
| File Storage | Cloudinary              | Image uploads and secure media hosting           |
| Styling      | Inline CSS & React      | Custom styles via JavaScript objects             |
| Deployment   | Vercel                  | Hosting for both frontend and backend            |


---------------------------------------------------------------------------------------------

## ⚙️ Local Setup Instructions

| Step | Action                                                                 | Command / Notes                                                                 |
|------|------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| 1    | Clone the repository                                                   | `git clone https://github.com/InfiniteVoid07/Profile-Management.git`            |
| 2    | Navigate to project folder                                             | `cd Profile-Management`                                                         |
| 3    | Install backend dependencies                                           | `cd backend` → `npm install`                                                    |
| 4    | Create a `.env` file in the backend folder                             | Add `PORT`, `JWT_SECRET`, `DATABASE_URL`, `CLOUDINARY_URL`, etc.                |
| 5    | Start backend server locally                                           | `node index.js` or `nodemon index.js`                                           |
| 6    | Install frontend dependencies                                          | `cd ../frontend` → `npm install`                                                |
| 7    | Create a `.env` file in the frontend folder                            | Add `VITE_API_URL=http://localhost:5000` (or your backend URL)                  |
| 8    | Start the frontend development server                                  | `npm run dev`                                                                   |
| 9    | Open the app in browser                                                | Visit `http://localhost:5173`                                                   |

Remember to update your backend and frontend link from vercel app to local server link i.e localhost:5000 etc.

