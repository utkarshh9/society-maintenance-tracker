# System Architecture

```text
                    ┌──────────────────────┐
                    │      Resident        │
                    │       / Admin        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │ React + TypeScript    │
                    └──────────┬───────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI API      │
                    │ Authentication       │
                    │ Business Logic       │
                    │ Role Authorization   │
                    └──────┬─────┬─────────┘
                           │     │
                ┌──────────┘     └────────────┐
                ▼                             ▼
       ┌──────────────────┐          ┌─────────────────┐
       │   PostgreSQL     │          │    Cloudinary   │
       │                  │          │                 │
       │ Users            │          │ Complaint       │
       │ Complaints       │          │ Photos          │
       │ History          │          │                 │
       │ Notices          │          └─────────────────┘
       └──────────────────┘
                │
                ▼
       ┌──────────────────┐
       │      Resend      │
       │ Email Service    │
       └──────────────────┘
```

---

# Project Structure

```text
society-maintenance-tracker/
│
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   │
│   │   ├── dependencies/
│   │   │   └── auth.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── complaint.py
│   │   │   ├── complaint_history.py
│   │   │   └── notice.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── complaints.py
│   │   │   ├── dashboard.py
│   │   │   ├── notices.py
│   │   │   └── upload.py
│   │   │
│   │   ├── schemas/
│   │   └── services/
│   │       ├── email_service.py
│   │       ├── overdue_service.py
│   │       └── storage_service.py
│   │
│   ├── scripts/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── resident/
│   │   ├── login/
│   │   ├── register/
│   │   └── components/
│   │
│   ├── src/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

---

# Complaint Lifecycle

A complaint starts as:

```text
OPEN
```

An administrator can move it to:

```text
IN_PROGRESS
```

and finally:

```text
RESOLVED
```

Each transition generates a new immutable history record.

Example:

```text
OPEN
│
├── Created by Resident
│   24 Aug, 10:00 AM
│
▼
IN_PROGRESS
│
├── Updated by Admin
│   24 Aug, 2:00 PM
│   "Technician assigned"
│
▼
RESOLVED
│
└── Updated by Admin
    25 Aug, 11:00 AM
    "Issue fixed"
```

---

# Overdue Detection

The overdue threshold is configurable.

For example:

```env
OVERDUE_THRESHOLD_DAYS=3
```

An unresolved complaint becomes overdue when its age exceeds the configured threshold.

Conceptually:

```text
is_overdue =
    status != RESOLVED
    AND
    current_time > created_at + threshold
```

Overdue complaints are surfaced in the administrator interface and dashboard.

---

# Photo Handling

Photos are not stored directly in PostgreSQL.

The upload flow is:

```text
Resident
    │
    │ image
    ▼
Next.js Frontend
    │
    │ multipart/form-data
    ▼
FastAPI
    │
    │ validation
    ▼
Cloudinary
    │
    │ secure URL
    ▼
FastAPI
    │
    ▼
PostgreSQL
```

The database stores the resulting Cloudinary URL.

The backend validates:

* File type
* File size
* Upload success

---

# Notification Flow

## Complaint Status Notification

```text
Admin changes status
        │
        ▼
FastAPI
        │
        ├── Update complaint
        │
        ├── Create history record
        │
        ▼
Email Service
        │
        ▼
Resident
```

## Important Notice Notification

```text
Admin creates important notice
        │
        ▼
Notice stored in database
        │
        ▼
Email Service
        │
        ▼
Residents
```
