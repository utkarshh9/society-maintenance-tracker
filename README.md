# Society Maintenance Tracker

A full-stack apartment society maintenance management platform that enables residents to raise and track maintenance complaints while giving administrators a centralized system to manage complaint lifecycles, priorities, overdue issues, notices, and resident notifications.

## Live Application

* **Frontend:** https://society-maintenance-tracker-platform.vercel.app/
* **Backend API:** https://society-maintenance-tracker-b0ui.onrender.com/

---

## Features

### Resident

* Registration and login
* JWT-based authentication
* Create maintenance complaints
* Select complaint category
* Add complaint description
* Upload optional complaint photo
* View personal complaints
* View complaint details
* View complete complaint status history
* View notice board
* Receive email notifications

### Admin

* Secure admin authentication
* View all resident complaints
* Filter complaints by category, status, and date
* Set complaint priority
* Update complaint status
* Add notes during status changes
* View complete complaint history
* Identify overdue complaints
* View overdue complaints prominently
* Create notices
* Mark notices as important
* View dashboard statistics

### Complaint Lifecycle

```text
OPEN
  │
  ▼
IN_PROGRESS
  │
  ▼
RESOLVED
```

Once a complaint reaches `RESOLVED`, it is considered closed and cannot be reopened through the normal lifecycle.

### Priority

```text
LOW
MEDIUM
HIGH
```

### Overdue Detection

Complaints that remain unresolved beyond the configured overdue threshold are identified as overdue.

The threshold is configurable through the backend configuration.

### Photo Upload

Complaint photos are uploaded to Cloudinary.

The application stores the resulting Cloudinary URL rather than storing image binary data in PostgreSQL.

### Notifications

The system supports email notifications for:

1. Complaint status changes
2. New important notices

### Notice Board

Administrators can publish notices and optionally mark them as important.

Important notices are displayed at the top of the resident notice board.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* React Router / Next.js App Router
* Recharts
* Lucide icons

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* JWT authentication
* Passlib / bcrypt
* Python Multipart

## Database

* PostgreSQL

## External Services

* Cloudinary — complaint photo storage
* Resend — email notifications

## Deployment

* Vercel — frontend
* Render — backend
* PostgreSQL hosting — production database