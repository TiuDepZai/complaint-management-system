# Complaint Management System (CMS)

**Live:** [http://54.79.147.114/](http://54.79.147.114/)

A **MERN-based** CMS where customers can register complaints and track them, and admins can manage categories and view all complaints. Authentication is **JWT-based**; UI is **React + Tailwind**; server is **Node/Express** with **MongoDB**.

---

## Features

### Auth & Roles
- **JWT authentication**, protected API routes
- Roles: **admin**, **user**

### Categories (admin)
- Create / Read / Update / Delete
- Case-insensitive unique names
- Status: **Active** / **Inactive**
- “Active categories” endpoint for complaint form dropdown

### Complaints (users & admin)
- Users can create, view, update (description/category), and delete their own complaints
- Each complaint gets a unique reference (e.g., `CMP-123456-AB12CD`)
- Admin can view all complaints (`/complaints?all=1`)

### Frontend UX
- Logged-in users: “Register Complaint” and “View Complaints”
- Admin: “Categories” link in navbar; “View All Complaints” on home
- Client-side validation on forms
- Modals for create/edit with success banners

### Testing & CI
- Unit tests with **Mocha + Chai + Sinon**
- **GitHub Actions** CI on `main` that runs tests on a self-hosted runner

---

## Tech Stack
- **Frontend:** React, React Router, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas or self-hosted)
- **Auth:** JWT (`Authorization: Bearer <token>`)
- **Testing:** Mocha, Chai, Sinon
- **CI:** GitHub Actions (self-hosted runner)

---

## Prerequisites
- **Node.js 18+** (CI currently uses **Node 22**)
- **Yarn** (`npm i -g yarn`) or **npm**
- **MongoDB** connection string
- A **JWT secret**

---

## Environment Variables
Create `backend/.env`:

```env
MONGO_URI=<your mongodb connection string>
JWT_SECRET=<your jwt secret>
PORT=5000
```
<<<<<<< HEAD

If your frontend needs a custom API base URL, set it in your axios instance or use an env like `VITE_API_BASE_URL` / `REACT_APP_API_BASE_URL` and reference it in axios config.

=======
>>>>>>> origin/main
---

## Project Setup (Local)

1) **Clone & install**
```bash
<<<<<<< HEAD
git clone <your-repo-url>
=======
git clone <https://github.com/TiuDepZai/complaint-management-system.git>
>>>>>>> origin/main
cd complaint-management-system
```

2) **Backend**
```bash
cd backend
yarn install        # or: npm install
# create backend/.env as shown above
yarn start          # or: npm run start
# server runs on http://localhost:5000
```

3) **Frontend**
```bash
cd ../frontend
yarn install        # or: npm install
yarn start          # or: npm run start
# app runs on http://localhost:3000
```

> Ensure your frontend axios base URL points to your backend (e.g., `http://localhost:5000` during local dev).

---

## Running Tests (Backend)

```bash
cd backend
yarn test     # or: npm test
```

**Tests cover:**

- **Categories:** list, create, update, delete validations/flows
- **Complaints:** create, list (mine/admin), update (ownership, field validation), delete (ownership/admin)

---

## API Quick Reference

> **All protected endpoints require:** `Authorization: Bearer <JWT>`

### Categories (admin)

- `GET /api/categories` → list all (desc by `createdAt`)
- `GET /api/categories/active` → list **Active** only (for dropdown)
- `POST /api/categories` → create `{ name, description?, status? }`
- `PUT /api/categories/:id` → update fields
- `DELETE /api/categories/:id` → delete (**blocked** if in use by complaints)

### Complaints

- `POST /api/complaints` → create  
  **Body:** `{ name, email, subject, description, category, priority }`

- `GET /api/complaints` → list **my** complaints  
  **Admin options:** `?all=1` to list all, or `?userId=<id>` to filter

- `PUT /api/complaints/:id` → update `{ description?, category? }` (**owner or admin**)

- `DELETE /api/complaints/:id` → delete (**owner or admin**)

---

## CI (GitHub Actions + Self-hosted Runner)

- **Workflow:** `.github/workflows/ci.yml`
- **Triggers:** on push to `main`

**Pipeline steps:**
- Installs backend and frontend dependencies
- Builds frontend
- Runs backend tests

**Expected repository secrets:**
- `MONGO_URI`, `JWT_SECRET`, `PORT`  
  *(Optionally populate `backend/.env` during the job if you use a PROD stage.)*

> Ensure your self-hosted runner has Node/Yarn and any tools your pipeline requires.

---

## Usage

### Admin
- Log in → Navbar shows **Categories**
- Home shows **View All Complaints** (links to `/complaints?all=1`)
- Manage categories; see all complaints

### User
- Home shows **Register Complaint** and **View Complaints**
- Register creates a complaint with a **reference number**
- View your complaints; edit description/category or delete

---

## Roadmap

- Complaint statuses & assignments
- Search & filtering (category, priority, date)
- Email notifications on submission & updates
- Pagination for large lists
- Admin dashboard metrics

---

## Repository Structure

```
/frontend        # React app
/backend         # Express API
  /controllers   # categoryController, complaintController
  /models        # Category.js, Complaint.js, User.js (expected)
  /routes        # REST routes
  /test          # example_test.js (categories + complaints tests)
.github/workflows/ci.yml  # CI pipeline
```

---

## License

MIT © Complaint Management System
