# Society Maintenance Tracker — System Design

## 1. Architecture Overview

Society Maintenance Tracker is a full-stack web application built around a REST-based architecture. The frontend provides separate resident and administrator workflows, while a FastAPI backend handles authentication, authorization, complaint management, notices, dashboard aggregation, photo uploads, overdue detection, and notifications. PostgreSQL provides persistent relational storage, Cloudinary stores complaint images, and an email service handles resident notifications.

The system uses role-based access control with two roles: `resident` and `admin`. Residents can create and track their own complaints, while administrators can manage all complaints, priorities, statuses, notices, and dashboard information.

## 2. Complaint History Model

Complaint lifecycle tracking is implemented using two related entities: `complaints` and `complaint_history`.

The `complaints` table stores the current state of a complaint, including its category, description, priority, status, timestamps, and optional photo URL. A complaint follows the lifecycle:

```text
OPEN → IN_PROGRESS → RESOLVED
```

Once resolved, the complaint is considered closed.

Instead of overwriting historical information, every status transition creates a new record in `complaint_history`. Each history record contains the complaint ID, resulting status, actor ID, timestamp, and optional administrative note.

For example, when an administrator changes a complaint from `OPEN` to `IN_PROGRESS`, the current complaint record is updated and a corresponding history record is inserted. This produces an auditable timeline of the complete complaint lifecycle.

This design separates the current state from the historical audit trail and allows residents and administrators to see exactly what happened, when it happened, and who performed each action.

## 3. Overdue Detection

Overdue detection is based on a configurable threshold rather than a hard-coded duration. The threshold is supplied through application configuration, for example:

```text
OVERDUE_THRESHOLD_DAYS=3
```

An unresolved complaint is considered overdue when its age exceeds the configured threshold. Resolved complaints are excluded from overdue calculations.

Conceptually:

```text
status != RESOLVED
AND
current_time > created_at + configured_threshold
```

The overdue state can therefore be derived from the complaint's creation timestamp and current status rather than requiring a separate permanent boolean field.

This approach prevents stale overdue flags and ensures that the dashboard and administrator complaint view reflect the current state of the system. Overdue complaints are surfaced prominently so administrators can prioritize unresolved issues.

## 4. Photo Handling

Complaint photos are optional. When a resident submits an image, the frontend sends it to the FastAPI upload endpoint using multipart form data.

The backend first validates the file type and maximum file size. Valid images are uploaded to Cloudinary using a project-specific folder. Cloudinary returns a secure URL, which is stored with the complaint in PostgreSQL.

The image itself is therefore not stored in the relational database.

The flow is:
```text
Resident 
→ Frontend 
→ FastAPI 
→ Validation 
→ Cloudinary 
→ Secure Image URL 
→ PostgreSQL
```

This keeps the database lightweight while using dedicated object/media storage for potentially large image files.

## 5. Notification Flow

The system has two primary notification events.

### Complaint Status Changes

When an administrator changes a complaint's status, the backend updates the complaint and creates the corresponding history record. The resident is then notified by email with the updated status and relevant information.

```text
Admin Status Update 
→ Database Update 
→ History Record 
→ Email Service 
→ Resident
```

### Important Notices

Administrators can publish notices and optionally mark them as important. Important notices are pinned at the top of the resident notice board and trigger email notifications to residents.

```text
Admin Creates Important Notice 
→ Notice Stored 
→ Email Service 
→ Residents
```

## 6. Design Summary

The architecture emphasizes traceability, clear role separation, and simple relational modeling. The complaint/history separation provides a complete audit trail, derived overdue detection avoids stale state, Cloudinary provides scalable image storage, and event-driven notification points ensure residents remain informed without coupling notification data to the core complaint records.

Together, these components directly address the system's primary requirements: transparent complaint tracking, overdue visibility, priority management, photo support, notices, dashboard reporting, and resident communication.