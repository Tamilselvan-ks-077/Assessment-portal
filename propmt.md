You are a senior React.js frontend engineer and UI/UX architect.

I am building a production-ready online assessment platform for a client.

REFERENCE:
Use https://www.testportal.com/ as a FUNCTIONAL and UX reference only.

IMPORTANT:
Do NOT copy Testportal's branding, logo, copyrighted illustrations, exact text, or visual identity.
Create an original modern design inspired by the general concept of an online assessment platform.

TECH STACK:

- React.js
- Vite
- JavaScript or TypeScript
- React Router
- Tailwind CSS
- Axios
- React Hook Form
- Zod for validation where appropriate
- Recharts for analytics
- Lucide React for icons
- REST API communication
- Responsive mobile-first design

BACKEND:
The frontend will communicate with a separate REST API backend.

DATABASE:
PostgreSQL exists behind the backend.
DO NOT connect React directly to PostgreSQL.

==================================================
PRODUCT
==================================================

Build a complete online assessment platform where:

ADMIN / TEST CREATOR can:

- Register/login
- Create assessments
- Edit assessments
- Delete assessments
- Add questions
- Edit questions
- Delete questions
- Reorder questions
- Configure marks
- Configure time limits
- Configure passing score
- Configure attempts
- Generate/share assessment access codes
- View participants
- Monitor attempts
- View results
- View analytics
- Export results
- Manage profile/settings

PARTICIPANT can:

- Open an assessment using an access code
- Enter required information
- Start assessment
- View questions
- Navigate between questions
- Select answers
- Save answers
- See remaining time
- Submit assessment
- See result when allowed
- Review answers when allowed

==================================================
APPLICATION AREAS
==================================================

Create these main areas:

PUBLIC:

/ 
Landing page

/login
Login

/register
Registration

/test/:accessCode
Public assessment access page

/test/:accessCode/start
Assessment start page

/test/:accessCode/attempt/:attemptId
Assessment taking interface

/test/:accessCode/result/:attemptId
Assessment result

ADMIN:

/dashboard
Dashboard

/assessments
Assessment list

/assessments/create
Create assessment

/assessments/:id
Assessment overview

/assessments/:id/edit
Edit assessment

/assessments/:id/questions
Question management

/assessments/:id/settings
Assessment settings

/assessments/:id/results
Assessment results

/assessments/:id/analytics
Assessment analytics

/participants
Participants

/profile
Profile

/settings
Settings

==================================================
DESIGN SYSTEM
==================================================

Create a completely original professional SaaS design.

Design goals:

- Modern
- Clean
- Premium
- Professional
- Trustworthy
- Fast
- Minimal
- Mobile-first
- Easy for non-technical users

Use:

- Soft backgrounds
- White cards
- Subtle borders
- Medium rounded corners
- Clear typography
- Strong visual hierarchy
- Accessible contrast
- Consistent spacing
- Minimal shadows
- Professional dashboard UI

Avoid:

- Excessive gradients
- Excessive animations
- Huge unnecessary hero sections
- AI-looking generic UI
- Overuse of glassmorphism
- Excessive rounded elements
- Cluttered dashboards

Create a reusable design system:

Colors:
- Primary
- Secondary
- Success
- Warning
- Error
- Neutral

Typography:
- Page title
- Section title
- Card title
- Body
- Caption
- Label

Components:
- Button
- Input
- Select
- Checkbox
- Radio
- Modal
- Drawer
- Toast
- Badge
- Card
- Table
- Pagination
- Tabs
- Dropdown
- Tooltip
- Empty state
- Loading state
- Error state
- Confirmation dialog

==================================================
MOBILE-FIRST REQUIREMENTS
==================================================

This application will primarily be used through mobile browsers.

DO NOT simply shrink desktop layouts.

Design mobile layouts intentionally.

Mobile requirements:

- Bottom navigation where appropriate
- Collapsible navigation
- Touch-friendly controls
- Minimum comfortable tap target
- No horizontal scrolling
- Responsive tables
- Cards instead of wide tables on mobile
- Sticky assessment timer
- Sticky question navigation when appropriate
- Large readable question text
- Large answer options
- Easy previous/next controls
- Mobile-friendly modals
- Mobile-friendly dropdowns
- Safe spacing around screen edges
- Support portrait orientation
- Handle small screens correctly

Test at:

320px
360px
375px
390px
414px
768px
1024px
1440px

==================================================
LANDING PAGE
==================================================

Create:

Navbar

Logo/brand placeholder

Navigation:
- Features
- Solutions
- Pricing
- Resources

Actions:
- Login
- Get Started

Hero:

Headline explaining online assessments.

Supporting text.

Primary CTA:
Create an Assessment

Secondary CTA:
Take a Test

Include a visual dashboard/assessment preview.

Sections:

- How it works
- Assessment features
- Use cases
- Analytics preview
- Security
- Testimonials placeholder
- CTA
- Footer

==================================================
ADMIN DASHBOARD
==================================================

Create a professional dashboard.

Dashboard cards:

- Total Assessments
- Active Assessments
- Total Participants
- Completed Attempts
- Average Score

Charts:

- Assessment attempts over time
- Average scores
- Completion rate
- Pass/fail distribution

Recent assessments list.

Recent activity.

Quick actions:

Create Assessment
Add Question
View Results

==================================================
ASSESSMENT CREATOR
==================================================

Build a powerful assessment creation workflow.

Step structure:

1. Basic Information
2. Questions
3. Settings
4. Publish

Basic information:

- Title
- Description
- Category
- Instructions
- Duration
- Passing score

Question types:

- Single Choice
- Multiple Choice
- True / False
- Short Answer
- Long Answer

Question editor must support:

- Question text
- Options
- Correct answer
- Marks
- Explanation
- Required/optional
- Question ordering

Allow drag-and-drop question ordering if practical.

==================================================
QUESTION MANAGEMENT
==================================================

Create a clean question builder.

Example:

Question 1

"What is HTTP?"

○ HyperText Transfer Protocol
○ High Transfer Text Protocol
○ Hyper Transfer Process
○ None

Correct answer:
HyperText Transfer Protocol

Marks:
1

Explanation:
HTTP is an application-layer protocol...

Provide:

Edit
Duplicate
Delete
Move Up
Move Down

==================================================
ASSESSMENT TAKING UI
==================================================

This is one of the most important screens.

Make it extremely mobile-friendly.

Header:

Assessment name

Timer

Question counter

Example:

Question 4 of 20
02:35 remaining

Question card.

Answer options.

Navigation:

Previous
Next

Question navigation:

1 2 3 4 5 ...

States:

Unanswered
Answered
Marked for review
Current

Submit button.

Before submitting show confirmation:

"You have answered 17 of 20 questions.
Are you sure you want to submit?"

==================================================
RESULT PAGE
==================================================

Show:

Score

Percentage

Pass / Fail

Correct answers

Incorrect answers

Unanswered

Time taken

Question breakdown

Optional review answers

Use visual charts where useful.

==================================================
ANALYTICS
==================================================

Create analytics dashboard with:

- Attempts
- Completion rate
- Average score
- Highest score
- Lowest score
- Pass percentage
- Average completion time

Charts:

- Attempts over time
- Score distribution
- Question performance
- Pass/fail distribution

Use Recharts.

==================================================
API ARCHITECTURE
==================================================

Create a clean API service layer.

Example:

src/
  api/
    client.js
    authApi.js
    assessmentApi.js
    questionApi.js
    attemptApi.js
    resultApi.js
    analyticsApi.js
    participantApi.js

Use Axios.

Create centralized:

- Base URL
- Authorization headers
- Error handling
- Request interceptor
- Response interceptor

Never hardcode API URLs throughout components.

Use environment variables:

VITE_API_BASE_URL

==================================================
AUTHENTICATION
==================================================

Implement frontend authentication architecture.

Support:

- Login
- Register
- Logout
- Current user
- Protected routes
- Role-based routes

Roles:

ADMIN
TEST_CREATOR
PARTICIPANT

Never store sensitive secrets in frontend code.

Handle expired sessions gracefully.

==================================================
STATE MANAGEMENT
==================================================

Keep state architecture clean.

Use:

- React Context where appropriate
- Local component state for local UI
- Server/API state using a suitable pattern

Do not create unnecessary global state.

==================================================
ERROR / LOADING STATES
==================================================

Every API-driven screen must have:

Loading state

Empty state

Error state

Success state

Example:

Loading assessments...

No assessments found.

Unable to load assessments.
Try again.

==================================================
ACCESSIBILITY
==================================================

Follow accessible UI practices.

Include:

- Keyboard navigation
- Proper labels
- Focus states
- Semantic HTML
- Accessible buttons
- ARIA where necessary
- Good color contrast
- Screen-reader-friendly form controls

==================================================
PERFORMANCE
==================================================

Optimize for mobile.

Use:

- Lazy-loaded routes
- Code splitting
- Optimized images
- Debounced search
- Pagination
- Memoization where useful
- Avoid unnecessary re-renders

Assessment taking page must remain responsive even with many questions.

==================================================
SECURITY
==================================================

Never trust frontend validation.

Frontend validation is only for UX.

Backend must validate:

- Authentication
- Authorization
- Assessment ownership
- Attempt ownership
- Answer submission
- Scores

Do not expose correct answers before submission.

Do not put secrets in frontend.

==================================================
CODE QUALITY
==================================================

Use reusable components.

Avoid huge components.

Prefer:

components/
pages/
layouts/
hooks/
api/
services/
utils/
types/
constants/

Use meaningful names.

Do not duplicate code.

Do not use fake API calls in the final implementation.

If backend APIs are not available yet:

Create a clearly separated API service layer and temporary mock data only for UI development.

==================================================
IMPORTANT DEVELOPMENT RULE
==================================================

Before coding:

1. Inspect the existing repository.
2. Understand the current structure.
3. Do not unnecessarily delete existing code.
4. Create a clear implementation plan.
5. Implement the application incrementally.
6. Run the project.
7. Test every route.
8. Check mobile responsiveness.
9. Fix console errors.
10. Fix broken navigation.
11. Verify API integration points.
12. Perform a final UI/UX review.

Do not stop after creating only the landing page.

Build the complete frontend application architecture.

The final result should look like a real production SaaS product, not an AI-generated demo.