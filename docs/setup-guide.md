# Prerequisites

Install:

* Python 3.14 or compatible Python version
* Node.js
* npm
* PostgreSQL
* Git

You will also need accounts/credentials for:

* PostgreSQL
* Cloudinary
* Resend

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Backend Environment Variables

Create:

```text
backend/.env
```

using `.env.example` as the template.

Example:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=your-verified-sender@example.com

OVERDUE_THRESHOLD_DAYS=3

FRONTEND_URL=http://localhost:3000
```

Do not commit `.env` to Git.

---

# Database Setup

After configuring `DATABASE_URL`, run:

```bash
alembic upgrade head
```

To generate a new migration after changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "description"
```

Then apply it:

```bash
alembic upgrade head
```

---

# Run Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available through the standard Swagger/OpenAPI interface:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Run the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```
