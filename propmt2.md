You are a senior backend engineer and PostgreSQL architect.

Build the backend for a production-ready online assessment platform inspired by the functionality of https://www.testportal.com/.

Use it only as a functional reference. Do NOT copy its branding, source code, text, or assets.

TECH STACK:
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- REST API
- JWT authentication
- bcrypt
- Zod validation
- Helmet
- CORS
- Rate limiting

IMPORTANT:
The React frontend is separate and will communicate with this backend through REST APIs.
Never connect React directly to PostgreSQL.

==================================================
CORE FEATURES
==================================================

Authentication:
- Register
- Login
- Logout
- Refresh token
- Current user
- JWT authentication

Roles:
- ADMIN
- TEST_CREATOR
- PARTICIPANT

Assessment management:
- Create assessment
- Edit assessment
- Delete assessment
- Publish/close assessment
- Generate unique access code
- Duration
- Passing score
- Maximum attempts
- Start/end date
- Shuffle questions/options

Questions:
- Single Choice
- Multiple Choice
- True/False
- Short Answer
- Long Answer
- Add/edit/delete/reorder questions

Participants:
- Register participant
- Track participants
- Track attempts

Assessment attempts:
- Start test
- Save answers
- Submit test
- Attempt limits
- Expiration
- Server-side timer validation

Results:
- Score
- Percentage
- Correct
- Incorrect
- Unanswered
- Pass/Fail
- Time taken

Analytics:
- Total attempts
- Average score
- Pass rate
- Completion rate
- Score distribution
- Question performance

==================================================
DATABASE
==================================================

Use Prisma + PostgreSQL.

Create these main models:

User
Assessment
Question
QuestionOption
Participant
AssessmentAttempt
AttemptAnswer
RefreshToken
AuditLog

Relationships:

User
 └── Assessments
      ├── Questions
      │    └── Options
      ├── Participants
      └── Attempts
           └── Answers

Use:
- Foreign keys
- Unique constraints
- Proper indexes
- Transactions
- Safe cascade rules

Create:

prisma/schema.prisma
migrations
seed script
.env.example

Seed development data:
- Admin
- Test creator
- Participant
- Sample assessment
- Sample questions

==================================================
REST API
==================================================

AUTH:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

ASSESSMENTS:

GET    /api/v1/assessments
POST   /api/v1/assessments
GET    /api/v1/assessments/:id
PATCH  /api/v1/assessments/:id
DELETE /api/v1/assessments/:id
POST   /api/v1/assessments/:id/publish
POST   /api/v1/assessments/:id/close

QUESTIONS:

GET    /api/v1/assessments/:id/questions
POST   /api/v1/assessments/:id/questions
PATCH  /api/v1/questions/:questionId
DELETE /api/v1/questions/:questionId

PUBLIC TEST:

GET  /api/v1/public/tests/:accessCode
POST /api/v1/public/tests/:accessCode/start
GET  /api/v1/public/attempts/:attemptId
POST /api/v1/public/attempts/:attemptId/answers
POST /api/v1/public/attempts/:attemptId/submit

RESULTS:

GET /api/v1/assessments/:id/results
GET /api/v1/attempts/:attemptId/result

ANALYTICS:

GET /api/v1/assessments/:id/analytics

PARTICIPANTS:

GET  /api/v1/assessments/:id/participants
POST /api/v1/assessments/:id/participants

PROFILE:

GET   /api/v1/users/me
PATCH /api/v1/users/me

==================================================
SECURITY
==================================================

Never trust the frontend for:

- Authorization
- Scores
- Correct answers
- Assessment ownership
- Attempt limits
- Test expiration

Correct answers must NEVER be returned through participant APIs.

The server must calculate scores.

Validate every request using Zod.

Implement:

- JWT authentication
- Role-based authorization
- Password hashing
- Helmet
- CORS
- Rate limiting
- Secure error handling
- Audit logging

Never expose:
- Password hashes
- JWT secrets
- Database credentials
- Correct answers to participants
- Production stack traces

==================================================
API RESPONSE
==================================================

Use a consistent response format:

Success:

{
  "success": true,
  "data": {},
  "message": "Success"
}

Error:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}

==================================================
PROJECT STRUCTURE
==================================================

Use:

src/
  config/
  controllers/
  routes/
  services/
  repositories/
  middleware/
  validators/
  modules/
  utils/
  app.ts
  server.ts

Keep controllers thin.
Put business logic in services.
Keep database logic organized.

==================================================
PERFORMANCE
==================================================

Implement:

- PostgreSQL indexes
- Pagination
- Search/filtering
- Efficient Prisma queries
- Avoid N+1 queries
- Transactions for critical operations

==================================================
TESTING
==================================================

Create tests for:

- Register/Login
- Authentication
- Authorization
- Assessment CRUD
- Question CRUD
- Access codes
- Starting attempts
- Saving answers
- Submitting attempts
- Expired attempts
- Attempt limits
- Automatic grading
- Results
- Analytics
- Invalid requests

Create Swagger/OpenAPI documentation.

==================================================
IMPORTANT DEVELOPMENT PROCESS
==================================================

Before coding:

1. Inspect the existing project.
2. Understand the current structure.
3. Do not delete existing working code unnecessarily.
4. Design the database first.
5. Create Prisma schema and migrations.
6. Build authentication.
7. Build assessment/question APIs.
8. Build participant/attempt APIs.
9. Build grading/results.
10. Build analytics.
11. Add security and validation.
12. Add tests.
13. Run the backend.
14. Test all API endpoints.
15. Fix errors and improve performance.

Build this as a real production backend, not a simple CRUD demo.

The backend must be secure, maintainable, scalable, testable, and ready for the React frontend.