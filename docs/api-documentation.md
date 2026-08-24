# API Documentation

The API follows a REST architecture and uses JWT bearer authentication for protected endpoints.

Base URL:

```text
/api
```

## Authentication

### Register

```http
POST /api/auth/register
```

Creates a new resident account.

Example request:

```json
{
  "name": "Resident Name",
  "email": "resident@example.com",
  "password": "password"
}
```

### Login

```http
POST /api/auth/login
```

Authenticates a user and returns an access token.

### Current User

```http
GET /api/auth/me
```

Returns the authenticated user's information.

---

# Complaints API

### Create Complaint

```http
POST /api/complaints
```

Resident-only endpoint.

Creates a new complaint with category, description, and optional photo URL.

### Get Complaints

```http
GET /api/complaints
```

Residents receive their own complaints.

Administrators can access all complaints.

Supported filtering includes:

```text
category
status
date
```

### Get Complaint

```http
GET /api/complaints/{complaint_id}
```

Returns complaint details and associated information.

### Update Priority

```http
PATCH /api/complaints/{complaint_id}/priority
```

Admin-only endpoint.

Supported values:

```text
LOW
MEDIUM
HIGH
```

### Update Status

```http
PATCH /api/complaints/{complaint_id}/status
```

Admin-only endpoint.

Supported lifecycle:

```text
OPEN
IN_PROGRESS
RESOLVED
```

An optional note can be recorded with the status change.

Every status transition creates a complaint history record.

### Complaint History

```http
GET /api/complaints/{complaint_id}/history
```

Returns the complete status history for the complaint.

Each history entry records:

* Status
* Actor
* Timestamp
* Optional note

---

# Photo Upload API

### Upload Complaint Photo

```http
POST /api/upload/photo
```

Requires:

```text
multipart/form-data
```

Field:

```text
file
```

Supported image formats include:

```text
JPEG
PNG
JPG
WEBP
GIF
```

The application validates file type and size before uploading the image to Cloudinary.

The API returns the uploaded image URL.

---

# Notice API

### Get Notices

```http
GET /api/notices
```

Returns the notice board.

Important notices are displayed first.

### Create Notice

```http
POST /api/notices
```

Admin-only endpoint.

Example:

```json
{
  "title": "Water Supply Maintenance",
  "content": "Water supply will be unavailable from 10 AM to 2 PM.",
  "is_important": true
}
```

### Get Notice

```http
GET /api/notices/{notice_id}
```

Returns an individual notice.

### Delete Notice

```http
DELETE /api/notices/{notice_id}
```

Admin-only endpoint.

---

# Dashboard API

### Dashboard Statistics

```http
GET /api/dashboard/stats
```

Admin-only endpoint.

Provides:

* Total complaints
* Complaints by status
* Complaints by category
* Overdue complaint count

### Overdue Complaints

```http
GET /api/dashboard/overdue
```

Admin-only endpoint.

Returns unresolved complaints that have exceeded the configured overdue threshold.