# AIIA Clinical Trials Dashboard & Evidence Synthesis System (CSE-PROJECT-2025-26-09)
MERN app for managing Ayurvedic clinical-trial records. **All seeded data is synthetic demo data.** It is a research-record system, not a prescribing or diagnostic tool; FHIR/CDISC/ICH E2A support is simplified and not certified.

## Stack
React + Vite + Tailwind + Recharts + React Hook Form | Express + Mongoose + JWT + bcryptjs + Helmet + rate limiting + pdfkit | MongoDB (local or Atlas)

## Setup (Windows, VS Code terminal)
1. Install Node 18+ and MongoDB Community (or create a free MongoDB Atlas cluster and use its URI).
2. `copy .env.example .env` then edit `JWT_SECRET`, `MONGO_URI`, `SEED_ADMIN_PASSWORD`.
3. `npm install` then `npm run install:all`
4. `npm run seed` (creates demo data and users: admin@aiia.demo, researcher1..5@aiia.demo, monitor@aiia.demo, viewer@aiia.demo, all using SEED_ADMIN_PASSWORD)
5. `npm run dev` -> web http://localhost:5173, API http://localhost:5000

## Roles
admin (everything, user management) · researcher (create/edit trial data) · monitor (safety/enrollment review, adverse events) · viewer (read-only, no patient records). Self-registered users start as viewer.

## API (all under /api, JWT bearer)
auth: POST register, POST login, GET/PUT me · CRUD (GET list with page/limit/q/field filters, GET/:id, POST, PUT/:id, DELETE/:id): trials, patients, enrollments, treatments, followups, outcomes, adverse-events, evidence, notifications, users(admin) · GET analytics/dashboard · GET reports/{trials|patients|enrollment|followups|adverse-events|evidence}?format=csv|pdf&from&to&trial · GET fhir/export/:Resource, POST fhir/import (validation).

## Models
User, ClinicalTrial, Patient, Enrollment, Treatment, FollowUp, ClinicalOutcome, AdverseEvent, EvidenceStudy, Notification, AuditLog (server/models/index.js).

## Deployment
Build client with `npm run build`, host `client/dist` on any static host (set API proxy/base URL), deploy `server` to Render/Railway with env vars from `.env.example` and a MongoDB Atlas URI; set `CLIENT_URL` to the frontend origin.

## Screenshots
Add your screenshots here after running the app.
