# Database Schema

The application uses PostgreSQL with four core entities.

## Users

| Column          | Description                |
| --------------- | -------------------------- |
| `id`            | Primary key                |
| `name`          | Resident/admin name        |
| `email`         | Unique user email          |
| `password_hash` | Hashed password            |
| `role`          | `resident` or `admin`      |
| `created_at`    | Account creation timestamp |

---

## Complaints

| Column        | Description                    |
| ------------- | ------------------------------ |
| `id`          | Primary key                    |
| `resident_id` | Foreign key to users           |
| `category`    | Complaint category             |
| `description` | Complaint details              |
| `photo_url`   | Optional Cloudinary URL        |
| `status`      | Open, In Progress, or Resolved |
| `priority`    | Low, Medium, or High           |
| `created_at`  | Creation timestamp             |
| `updated_at`  | Last update timestamp          |
| `resolved_at` | Resolution timestamp           |

Relationship:

```text
User 1 ──────────── N Complaints
```

---

## Complaint History

| Column         | Description                   |
| -------------- | ----------------------------- |
| `id`           | Primary key                   |
| `complaint_id` | Foreign key to complaints     |
| `status`       | Status at the transition      |
| `actor_id`     | User who performed the action |
| `note`         | Optional administrative note  |
| `created_at`   | Timestamp of the transition   |

Relationship:

```text
Complaint 1 ──────────── N ComplaintHistory
```

This provides the complete audit trail required by the problem statement.

---

## Notices

| Column         | Description                  |
| -------------- | ---------------------------- |
| `id`           | Primary key                  |
| `title`        | Notice title                 |
| `content`      | Notice content               |
| `is_important` | Whether the notice is pinned |
| `created_by`   | Admin who created it         |
| `created_at`   | Publication timestamp        |

Relationship:

```text
User/Admin 1 ──────────── N Notices
```

---

# Entity Relationship Diagram

```text
                    ┌─────────────────────┐
                    │        USERS        │
                    ├─────────────────────┤
                    │ PK id               │
                    │ name                │
                    │ email               │
                    │ password_hash       │
                    │ role                │
                    │ created_at          │
                    └─────────┬───────────┘
                              │
                    ┌─────────┴───────────┐
                    │                     │
                    ▼                     ▼
          ┌──────────────────┐    ┌──────────────────┐
          │    COMPLAINTS    │    │     NOTICES      │
          ├──────────────────┤    ├──────────────────┤
          │ PK id            │    │ PK id            │
          │ FK resident_id   │    │ title            │
          │ category         │    │ content          │
          │ description      │    │ is_important     │
          │ photo_url        │    │ created_by       │
          │ status           │    │ created_at       │
          │ priority         │    └──────────────────┘
          │ created_at       │
          │ updated_at       │
          │ resolved_at      │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────────┐
          │  COMPLAINT_HISTORY   │
          ├──────────────────────┤
          │ PK id                │
          │ FK complaint_id      │
          │ FK actor_id          │
          │ status               │
          │ note                 │
          │ created_at           │
          └──────────────────────┘
```
