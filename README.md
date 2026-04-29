# Smart Digital Banking System — Root README

## Project Structure

```
SmartDigitalBankingSystem/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── LoadingSpinner.js
    │   │   ├── layout/
    │   │   │   ├── Navbar.js
    │   │   │   ├── Sidebar.js
    │   │   │   └── DashboardLayout.js
    │   │   └── transactions/
    │   │       ├── TransactionModal.js
    │   │       └── TransactionCard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── TransactionsPage.js
    │   │   ├── ProfilePage.js
    │   │   └── ToolsPage.js
    │   ├── services/
    │   │   └── api.js
    │   ├── tests/
    │   │   └── LoadingSpinner.test.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

## Step-by-Step Setup

### 1. Clone / Open the project
```bash
cd SmartDigitalBankingSystem
```

### 2. Setup Backend
```bash
cd backend
npm install
# Edit .env and set your MONGO_URI
npm run dev
```
Backend runs at: **http://localhost:5000**

### 3. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

### 4. Production Build / Fullstack Deployment
If you want to deploy the backend and serve the React app from the same Node server, build the frontend first:
```bash
cd frontend
npm install
npm run build
```
Then start the backend in production mode:
```bash
cd ../backend
npm install
# Windows:
set NODE_ENV=production&& npm start
# macOS / Linux:
NODE_ENV=production npm start
```

### Single-command fullstack deployment
From `backend` you can also build the frontend and start the server with one command:
```bash
npm run fullstack
```

The backend will serve the `frontend/build` assets and expose the API at `http://localhost:5000/api`.

### Fullstack Startup Script (Windows)
A single command can launch backend, frontend, and the Streamlit dashboard together:
```bash
run-fullstack.bat
```
This opens three new terminals:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`
- Streamlit dashboard on `http://localhost:8502`

### Streamlit Dashboard
You can run the analytics dashboard against the same local MongoDB database:
```bash
python -m pip install -r requirements.txt
streamlit run src/dashboard_rl.py --server.port 8501
```
If port `8501` is already occupied, use an alternate port:
```bash
streamlit run src/dashboard_rl.py --server.port 8502
```
If MongoDB is running on `mongodb://localhost:27017/smartbankdb`, the dashboard will load live data from the same `transactions` collection used by the backend. If the database is empty or unavailable, the dashboard falls back to a simulated dataset.

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description            |
|--------|-----------------------|---------|------------------------|
| POST   | /api/auth/register    | Public  | Register new user      |
| POST   | /api/auth/login       | Public  | Login & get JWT token  |
| GET    | /api/auth/me          | Private | Get current user       |
| PUT    | /api/auth/password    | Private | Update password        |

### Transactions
| Method | Endpoint                            | Access  | Description              |
|--------|-------------------------------------|---------|--------------------------|
| GET    | /api/transactions                   | Private | List (paginated+filtered)|
| POST   | /api/transactions                   | Private | Create transaction       |
| GET    | /api/transactions/:id               | Private | Get single transaction   |
| PUT    | /api/transactions/:id               | Private | Update notes/tags        |
| DELETE | /api/transactions/:id               | Private | Delete transaction       |
| GET    | /api/transactions/stats/dashboard   | Private | Dashboard analytics      |

### Users
| Method | Endpoint              | Access  | Description         |
|--------|-----------------------|---------|---------------------|
| GET    | /api/users/profile    | Private | Get profile         |
| PUT    | /api/users/profile    | Private | Update profile      |
| DELETE | /api/users/profile    | Private | Deactivate account  |
| GET    | /api/users            | Admin   | List all users      |

---

## Postman API Testing Examples

### Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Pankaj",
  "lastName": "Yadav",
  "email": "pankaj@smartbank.com",
  "password": "SmartBank@123",
  "phone": "9876543210",
  "accountType": "savings"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "pankaj@smartbank.com",
  "password": "SmartBank@123"
}
```

### Create Transaction (requires Bearer token)
```
POST http://localhost:5000/api/transactions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "debit",
  "amount": 500,
  "description": "Grocery shopping",
  "category": "food"
}
```

### Get Dashboard Stats
```
GET http://localhost:5000/api/transactions/stats/dashboard
Authorization: Bearer <your_jwt_token>
```

---

## Running Tests
```bash
cd frontend
npm test
```

---

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, React Router 6, Chart.js    |
| Styling    | Custom CSS, Bootstrap 5, Glassmorphism|
| State      | React Context API + useState/useEffect|
| HTTP       | Axios with JWT interceptors           |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB + Mongoose (ODM)              |
| Auth       | JWT + bcryptjs                        |
| Security   | Helmet, CORS, Rate Limiting           |
| Testing    | Jest + React Testing Library          |

---

## Features Implemented

✅ Landing page with animated hero  
✅ Video background section  
✅ Responsive Navbar with JS toggle  
✅ 2-step registration with password strength  
✅ Login with validation & password visibility  
✅ JWT protected routes (frontend + backend)  
✅ Dashboard with 4 stat cards  
✅ Bar, Doughnut, and Line charts (Chart.js)  
✅ Transaction CRUD with atomic balance updates  
✅ Paginated transaction list with filters/search  
✅ MongoDB aggregation pipelines for analytics  
✅ Collapsible sidebar with active state  
✅ Profile edit + password change  
✅ Weather App (Open-Meteo, no API key!)  
✅ QR Code Generator (with download)  
✅ Rich Text Editor (with local save)  
✅ Toast notifications  
✅ Skeleton loading states  
✅ MVC architecture (backend)  
✅ Jest unit tests  
✅ Error handling middleware  
✅ Rate limiting & Helmet security headers  
