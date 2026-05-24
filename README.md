# Intern View API

Backend REST API for the Intern View interview preparation platform. This repository provides the server-side implementation for user registration, interview sessions, college and company management, job openings, feedback, and resume/career application workflows.

## Built With

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- AWS S3 SDK for resume/video storage
- Nodemailer for email workflows
- CORS and middleware for request validation

## Key Features

- User account registration for default users, students, college admins, and super admins
- Token-based authentication with protected routes
- Interview session management for technical and HR interview flows
- Series/interview tracking and confidence scoring
- Company management, eligibility, and placement workflows
- Career application and resume upload support
- Branch, college, admin, and student management APIs
- Feedback and contact support endpoints

## Prerequisites

- Node.js installed
- MongoDB instance or Atlas cluster
- AWS credentials for S3 buckets
- Email SMTP account for sending emails

## Installation

1. Clone the repository

```bash
git clone https://github.com/satyamguptabtech/intern_view.git
cd api_internview
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file at the project root with the following values:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
secret=your_jwt_secret
ACCESSKEY=your_aws_access_key_id
SECRETKEY=your_aws_secret_access_key
BUCKET=your_resume_bucket_name
IMAGE_BUCKET=your_image_bucket_name
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

> Note: `firebase-admin` is included in dependencies, but the current setup does not expose a configured Firebase service account in the repository.

## Run the Server

```bash
node index.js
```

Or during development:

```bash
npx nodemon index.js
```

## Default Root

- `GET /` - Returns a welcome message

## Authentication

- Most protected routes require a Bearer token in the `Authorization` header.
- Example: `Authorization: Bearer <token>`
- Tokens are issued by login and registration endpoints via JWT using `process.env.secret`.

## API Endpoints

### User Routes (`/user`)

- `POST /user/register-default` - Register default user
- `POST /user/register-student` - Register student
- `POST /user/register-college-admin` - Register college admin
- `POST /user/register-admin` - Register admin
- `POST /user/register-super-admin` - Register super admin
- `POST /user/login` - Login
- `POST /user/uploadinfo` - Upload user details (authenticated)
- `POST /user/updateassets` - Update user assets (authenticated)
- `POST /user/updateimage` - Update user image (authenticated)
- `POST /user/updateyear` - Update academic year (authenticated)
- `POST /user/updateresume` - Update resume (authenticated)
- `GET /user/getinfo` - Get authenticated user info
- `GET /user/getcoin` - Get user coin balance
- `POST /user/givecoins` - Give coins to user
- `POST /user/emailvarification` - Send email verification OTP
- `POST /user/varifyemail` - Verify email OTP
- `POST /user/forgot-password` - Request password reset email
- `POST /user/edit-password` - Change password (authenticated)
- `GET /user/college-admins` - Get college admin list (authenticated)
- `GET /user/testing` - Test endpoint

### Feedback Routes (`/feedback`)

- `POST /feedback/uploadfeedback` - Upload feedback (authenticated)
- `POST /feedback/contact-us` - Contact support

### Career / Application Routes (`/carrer`)

- `POST /carrer/apply` - Submit career application
- `POST /carrer/uploadresume` - Upload resume (authenticated)
- `POST /carrer/emailcheak` - Verify email validity

### Job Openings (`/job`)

- `POST /job/career/add` - Add a job opening (authenticated)
- `POST /job/career/remove/:id` - Remove job opening by ID (authenticated)
- `GET /job/career` - List all job openings (authenticated)
- `GET /job/career/:id` - Get job opening by ID (authenticated)
- `GET /job/career/location/:location` - Search openings by location (authenticated)
- `GET /job/career/title/:title` - Search openings by title (authenticated)

### Interview Routes (`/interview`)

- `POST /interview/start` - Start a technical interview session (authenticated)
- `POST /interview/stop` - Stop interview session and submit results (authenticated)
- `GET /interview/getdetail` - Get interview details (authenticated)
- `POST /interview/uploadvideo` - Generate upload URL for interview video (authenticated)
- `GET /interview/getUrl` - Get video URL (authenticated)
- `POST /interview/ackServer` - Acknowledge video upload completion (authenticated)
- `POST /interview/insertconfidence` - Insert per-question confidence score
- `POST /interview/insertaccuracy` - Insert per-question accuracy score

### HR Interview Routes (`/hrInterview`)

- `POST /hrInterview/start` - Start HR interview session (authenticated)
- `POST /hrInterview/stop` - Stop HR interview session and submit results (authenticated)
- `GET /hrInterview/getdetail` - Get HR interview details (authenticated)
- `POST /hrInterview/uploadvideo` - Generate upload URL for HR interview video (authenticated)
- `GET /hrInterview/getUrl` - Get HR interview video URL (authenticated)
- `POST /hrInterview/insertconfidence` - Insert confidence score for HR interview

### Series Routes (`/series`)

- `POST /series/startseries` - Start a series interview sequence (authenticated)
- `GET /series/getinfo` - Get current series info (authenticated)
- `POST /series/insert` - Insert interview results into a series (authenticated)

### Company Routes (`/company`)

- `POST /company/add` - Add a new company (authenticated)
- `POST /company/add-company-to-college` - Add a company to a college (college admin only)
- `POST /company/update/:company_id` - Update company data (college admin only)
- `GET /company/details/:company_id` - Get company details (authenticated)
- `GET /company/list` - Get all companies (authenticated)
- `GET /company/companies-to-college` - Get companies visiting colleges (authenticated)
- `POST /company/update-status/:company_id` - Update hiring status (college admin only)
- `GET /company/eligible` - Get eligible companies list (authenticated)
- `DELETE /company/delete/:company_id` - Delete a company (college admin only)

### Student Routes (`/student`)

- `GET /student/all` - Get all students (authenticated)
- `GET /student/upcoming-drives` - Get upcoming drive list (authenticated)
- `GET /student/recent-placements` - Get recent placements (authenticated)
- `GET /student/:id` - Get student by ID (authenticated)
- `PUT /student/update/:id` - Update student info (authenticated)
- `DELETE /student/delete/:id` - Delete student (authenticated)

### College Routes (`/college`)

- `POST /college` - Create a college
- `GET /college/all` - List colleges
- `GET /college/:id` - Get college by ID (super admin only)
- `PUT /college/:id` - Update college (super admin only)
- `DELETE /college/:id` - Delete college (super admin only)

### College Admin Routes (`/collegeadmin`)

- `POST /collegeadmin/students/bulk` - Add students in bulk (college admin only)
- `POST /collegeadmin/student/add` - Add a single student (college admin only)
- `POST /collegeadmin/mark-hired` - Mark students hired (college admin only)
- `GET /collegeadmin/recent-placements` - Get college admin recent placements (college admin only)

### Admin Routes (`/admin`)

- `POST /admin/approve-college-admin` - Approve a college admin (admin only)

### Branch Routes (`/branch`)

- `POST /branch` - Create branch (admin only)
- `GET /branch` - Get all branches (authenticated)
- `GET /branch/:id` - Get branch by ID (authenticated)
- `PUT /branch/:id` - Update branch (admin only)
- `DELETE /branch/:id` - Delete branch (admin only)

## Notes

- CORS is configured to allow requests from `http://localhost:3000`.
- Valid JSON payloads are required on most endpoints.
- Authentication is enforced using JWT in the `Authorization` header.
- Some endpoints require role-specific authorization: `isAdmin`, `isCollegeAdmin`, and `isSuperAdmin`.

## Troubleshooting

- If the server does not start, verify that `PORT` and `MONGO_URL` are present in `.env`.
- If token-protected routes fail, confirm the Bearer token is correctly supplied.
- AWS upload routes require valid S3 credentials and bucket names.

## License

ISC
# Intern_view
Android application for preparing for interview
