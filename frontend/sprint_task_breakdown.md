# Online Examination App — Task Breakdown

---

## Sprint 1 — "A teacher can create and manage tests"

---

### Story 1 — Teacher Registration & Login

**BE-1.1 · Teacher Registration API**

- **Table:** `users` (id, name, email, password_hash, role ENUM('TEACHER','STUDENT'), created_at)
- **Endpoint:** `POST /api/auth/register`
- **Request:**
  ```json
  { "name": "string", "email": "string", "password": "string" }
  ```
- **Response (201):**
  ```json
  { "id": 1, "name": "string", "email": "string", "role": "TEACHER" }
  ```
- **Response (400):** `{ "error": "Email already exists" }`
- **Notes:** Hash password with BCrypt before storing. Validate email format and password length (min 8 chars).

**BE-1.2 · Teacher Login API**

- **Table:** `users`
- **Endpoint:** `POST /api/auth/login`
- **Request:**
  ```json
  { "email": "string", "password": "string" }
  ```
- **Response (200):**
  ```json
  { "token": "jwt-string", "user": { "id": 1, "name": "string", "email": "string", "role": "TEACHER" } }
  ```
- **Response (401):** `{ "error": "Invalid credentials" }`
- **Notes:** JWT contains userId, email, role. Token expiry: 24h. Configure Spring Security filter chain to validate JWT on all `/api/teacher/**` routes.

**FE-1.1 · Registration Screen**

- **Screen:** `/register`
- **Calls:** `POST /api/auth/register`
- **UI renders:** Form with name, email, password, confirm password fields. "Register" button. Link to login page. Inline validation errors per field. On success → redirect to `/login`.

**FE-1.2 · Login Screen**

- **Screen:** `/login`
- **Calls:** `POST /api/auth/login`
- **UI renders:** Form with email, password fields. "Login" button. Link to register page. Error message on invalid credentials. On success → store JWT in memory/context → redirect to `/dashboard`.

**FE-1.3 · Change Password**

- **Calls:** `POST /api/auth/change-password` with `Authorization: Bearer <JWT>` (teacher only)
- **Request:** `{ "currentPassword": "string", "newPassword": "string" }`
- **Response (200):** `{ "message": "Password updated successfully" }`
- **Response (401):** `{ "error": "Current password is incorrect" }` (or generic unauthorized if token missing/invalid)
- **UI renders:** Form with current password, new password, and confirm new password. “Update password” button. Client-side validation: new password min 8 characters, confirm must match new password; inline errors per field. On API validation errors (400), show first field error from `{ "error": "…" }`. On success, show a success message or toast; optionally sign the user out and redirect to `/login` so they log in with the new password.

---

### Story 2 — Create a Test

**BE-2.1 · Create Test API**

- **Table:** `tests` (id, title, description, passcode, teacher_id FK→users, created_at, updated_at)
- **Endpoint:** `POST /api/teacher/tests`
- **Auth:** Bearer token required, role = TEACHER
- **Request:**
  ```json
  {
    "title": "string",
    "description": "string",
    "passcode": "string"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "passcode": "string",
    "teacherId": 1,
    "createdAt": "2026-04-11T00:00:00Z"
  }
  ```
- **Response (400):** `{ "error": "Passcode already in use" }`
- **Response (400):** `{ "error": "Title is required" }`
- **Notes:** Validate title and passcode are not empty. Check passcode uniqueness with `existsByPasscode()`. Set teacher_id from JWT.

**FE-2.1 · Create Test Form**

- **Screen:** `/dashboard/tests/new`
- **Calls:** `POST /api/teacher/tests`
- **UI renders:** Form with title, description (optional), and passcode fields. "Create Test" button. Validation: title and passcode required, show error if passcode taken. On success → redirect to `/dashboard/tests/{id}/edit` (to add questions).

---

### Story 3 — Add Questions & Answers

**BE-3.1 · Add Questions API**

- **Tables:**
  - `questions` (id, test_id FK→tests, question_text, points, display_order, created_at)
  - `answer_options` (id, question_id FK→questions, option_text, is_correct, display_order)
- **Endpoint:** `POST /api/teacher/tests/{testId}/questions`
- **Auth:** Bearer token required, must own the test
- **Request:**
  ```json
  {
    "questionText": "string",
    "points": 10,
    "displayOrder": 1,
    "options": [
      { "optionText": "string", "isCorrect": true, "displayOrder": 1 },
      { "optionText": "string", "isCorrect": false, "displayOrder": 2 }
    ]
  }
  ```
- **Response (201):**
  ```json
  {
    "id": 1,
    "questionText": "string",
    "points": 10,
    "displayOrder": 1,
    "options": [
      { "id": 1, "optionText": "string", "isCorrect": true, "displayOrder": 1 },
      { "id": 2, "optionText": "string", "isCorrect": false, "displayOrder": 2 }
    ]
  }
  ```
- **Response (400):** `{ "error": "At least 2 options required" }` or `{ "error": "Exactly one correct answer required" }`
- **Notes:** Validate min 2 options, exactly 1 marked correct. Save question and options in a single transaction.

**BE-3.2 · Get Questions for a Test API**

- **Tables:** `questions`, `answer_options`
- **Endpoint:** `GET /api/teacher/tests/{testId}/questions`
- **Auth:** Bearer token required, must own the test
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "questionText": "string",
      "points": 10,
      "displayOrder": 1,
      "options": [
        { "id": 1, "optionText": "string", "isCorrect": true, "displayOrder": 1 },
        { "id": 2, "optionText": "string", "isCorrect": false, "displayOrder": 2 }
      ]
    }
  ]
  ```
- **Notes:** Return questions ordered by display_order. Include `isCorrect` flag (teacher view only).

**BE-3.3 · Update Question API**

- **Tables:** `questions`, `answer_options`
- **Endpoint:** `PUT /api/teacher/tests/{testId}/questions/{questionId}`
- **Auth:** Bearer token required, must own the test
- **Request:** Same structure as BE-3.1 request
- **Response (200):** Updated question object (same as BE-3.1 response)
- **Notes:** Replace all options (delete old, insert new) in a single transaction.

**BE-3.4 · Delete Question API**

- **Tables:** `questions`, `answer_options`
- **Endpoint:** `DELETE /api/teacher/tests/{testId}/questions/{questionId}`
- **Auth:** Bearer token required, must own the test
- **Response (204):** No content
- **Notes:** Cascade delete answer_options.

**BE-3.5 · Reorder Questions API**

- **Table:** `questions`
- **Endpoint:** `PUT /api/teacher/tests/{testId}/questions/reorder`
- **Auth:** Bearer token required, must own the test
- **Request:**
  ```json
  { "questionIds": [3, 1, 2] }
  ```
- **Response (200):**
  ```json
  { "message": "Questions reordered" }
  ```
- **Notes:** Update display_order for each question based on array position.

**FE-3.1 · Question Builder Screen**

- **Screen:** `/dashboard/tests/{testId}/edit`
- **Calls:** `GET /api/teacher/tests/{testId}/questions`, `POST /api/teacher/tests/{testId}/questions`, `PUT /api/teacher/tests/{testId}/questions/{questionId}`, `DELETE /api/teacher/tests/{testId}/questions/{questionId}`, `PUT /api/teacher/tests/{testId}/questions/reorder`
- **UI renders:**
  - List of existing questions with question text, point value, and option count
  - "Add Question" button that opens an inline form
  - Each question form: question text input, point value input, dynamic list of option inputs with "Add Option" button, radio button to mark correct answer
  - Edit and Delete buttons per question (delete with confirmation)
  - Drag-and-drop or up/down arrows to reorder questions
  - Save button per question

---

### Story 4 — Edit & Delete Tests

**BE-4.1 · Update Test API**

- **Table:** `tests`
- **Endpoint:** `PUT /api/teacher/tests/{testId}`
- **Auth:** Bearer token required, must own the test
- **Request:**
  ```json
  { "title": "string", "description": "string", "passcode": "string" }
  ```
- **Response (200):**
  ```json
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "passcode": "string",
    "teacherId": 1,
    "updatedAt": "2026-04-11T00:00:00Z"
  }
  ```
- **Response (403):** `{ "error": "Not authorized to edit this test" }`
- **Notes:** Check passcode uniqueness if changed. Verify teacher owns the test.

**BE-4.2 · Delete Test API**

- **Tables:** `tests`, `questions`, `answer_options`, `test_attempts`, `student_answers`
- **Endpoint:** `DELETE /api/teacher/tests/{testId}`
- **Auth:** Bearer token required, must own the test
- **Response (204):** No content
- **Response (403):** `{ "error": "Not authorized to delete this test" }`
- **Notes:** Cascade delete all related questions, options, attempts, and answers.

**FE-4.1 · Edit Test Details**

- **Screen:** `/dashboard/tests/{testId}/edit` (same screen as question builder, top section)
- **Calls:** `PUT /api/teacher/tests/{testId}`
- **UI renders:** Editable title, description, and passcode fields at the top of the test edit screen. "Save Changes" button. Validation: same as create form.

**FE-4.2 · Delete Test**

- **Screen:** `/dashboard` (action on each test card)
- **Calls:** `DELETE /api/teacher/tests/{testId}`
- **UI renders:** Delete icon/button on each test card. Confirmation modal: "Are you sure? This will delete all questions and student results." On confirm → call API → remove from list.

---

### Story 5 — Teacher Dashboard

**BE-5.1 · List Teacher's Tests API**

- **Table:** `tests`, `questions` (for count)
- **Endpoint:** `GET /api/teacher/tests`
- **Auth:** Bearer token required, role = TEACHER
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "title": "string",
      "passcode": "string",
      "questionCount": 10,
      "createdAt": "2026-04-11T00:00:00Z"
    }
  ]
  ```
- **Notes:** Filter by teacher_id from JWT. Order by created_at DESC. Use a projection or JPQL to include question count.

**BE-5.2 · Get Test Detail API**

- **Tables:** `tests`, `questions` (count), `test_attempts` (submission count and average score %)
- **Endpoint:** `GET /api/teacher/tests/{testId}`
- **Auth:** Bearer token required, must own the test (same ownership check as update/delete)
- **Response (200):**
  ```json
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "passcode": "string",
    "teacherId": 1,
    "createdAt": "2026-04-11T00:00:00Z",
    "updatedAt": "2026-04-11T00:00:00Z",
    "questionCount": 10,
    "submissionCount": 24,
    "averageScorePercentage": 78.5
  }
  ```
- **Response (404):** `{ "error": "Test not found" }`
- **Response (403):** `{ "error": "Not authorized to access this test" }`
- **Notes:** `averageScorePercentage` is the mean of `(score / maxScore) * 100` over all attempts for this test; omit or set `null` when `submissionCount` is 0. Verify `teacher_id` on the test matches the JWT user.

**FE-5.1 · Teacher Dashboard Screen**

- **Screen:** `/dashboard`
- **Calls:** `GET /api/teacher/tests`
- **UI renders:**
  - Page title "My Tests"
  - "Create New Test" button → navigates to `/dashboard/tests/new`
  - List/grid of test cards, each showing: title, passcode, question count, created date
  - Each card is clickable → navigates to `/dashboard/tests/{testId}/edit`
  - Delete button per card (triggers FE-4.2 confirmation modal)
  - Empty state: "No tests yet. Create your first test!" if list is empty
  - Tests sorted by most recently created

**FE-5.2 · Test Detail (metadata & stats)**

- **Screen:** `/dashboard/tests/{testId}` (overview) and/or top section of `/dashboard/tests/{testId}/edit` — wherever the teacher first lands to see full test context
- **Calls:** `GET /api/teacher/tests/{testId}` (Bearer JWT)
- **UI renders:** Title, description, passcode (with optional “copy passcode”), created/updated timestamps, **question count**, **submission count** (completed attempts), and **average score %** (hide or show “—” when null / no submissions). Loading and error states (404/403). Link or button to open question editor and to results/statistics screens if those routes exist.

---

## Sprint 2 — "A student can take a test and see their score"

---

### Story 6 — Passcode-Based Test Access

**BE-6.1 · Student Access via Passcode API**

- **Tables:** `users`, `tests`
- **Endpoint:** `POST /api/student/access`
- **Auth:** Public (no token required)
- **Request:**
  ```json
  { "passcode": "string", "studentName": "string" }
  ```
- **Response (200):**
  ```json
  {
    "token": "jwt-string",
    "testId": 1,
    "testTitle": "string",
    "studentId": 1
  }
  ```
- **Response (404):** `{ "error": "Invalid passcode" }`
- **Notes:** Look up test by passcode. Create or find a student user record (by name + test combination). Generate a scoped JWT with studentId, testId, role STUDENT. This token only grants access to the specific test's endpoints.

**FE-6.1 · Student Landing Screen**

- **Screen:** `/` (homepage)
- **Calls:** `POST /api/student/access`
- **UI renders:**
  - App title/logo
  - Passcode input field
  - Student name input field
  - "Start Test" button
  - Error message if passcode is invalid
  - On success → store JWT → redirect to `/test/{testId}`

---

### Story 7 — Take a Test

**BE-7.1 · Get Test Questions for Student API**

- **Tables:** `tests`, `questions`, `answer_options`
- **Endpoint:** `GET /api/student/tests/{testId}/questions`
- **Auth:** Bearer token required, role = STUDENT, token testId must match
- **Response (200):**
  ```json
  {
    "testTitle": "string",
    "testDescription": "string",
    "totalQuestions": 10,
    "questions": [
      {
        "id": 1,
        "questionText": "string",
        "points": 10,
        "displayOrder": 1,
        "options": [
          { "id": 1, "optionText": "string", "displayOrder": 1 },
          { "id": 2, "optionText": "string", "displayOrder": 2 }
        ]
      }
    ]
  }
  ```
- **Notes:** **Do NOT include `isCorrect` field** in student response. Order questions and options by display_order.

**FE-7.1 · Test-Taking Screen**

- **Screen:** `/test/{testId}`
- **Calls:** `GET /api/student/tests/{testId}/questions`
- **UI renders:**
  - Test title and description at the top
  - All questions rendered in order, each with:
    - Question number and text
    - Point value
    - Radio buttons for each answer option
  - Progress indicator: "5 of 20 answered" — updates as student selects answers
  - Local state: maintains a map of `{ questionId: selectedOptionId }`
  - Answers preserved when scrolling back and forth
  - "Submit Test" button at the bottom (triggers confirmation from Story 8)

---

### Story 8 — Submit Confirmation

**FE-8.1 · Submit Confirmation Modal**

- **Screen:** `/test/{testId}` (modal overlay)
- **Calls:** None (local UI only, triggers submission from Story 9)
- **UI renders:**
  - Modal dialog that appears when "Submit Test" is clicked
  - Text: "You have answered X of Y questions. Z questions are unanswered."
  - "Go Back" button → closes modal, returns to test
  - "Confirm Submit" button → calls the submit API (FE-9.1)

---

### Story 9 — Auto-Grading

**BE-9.1 · Submit Test & Grade API**

- **Tables:**
  - `test_attempts` (id, test_id FK→tests, student_id FK→users, score, max_score, submitted_at)
  - `student_answers` (id, attempt_id FK→test_attempts, question_id FK→questions, selected_option_id FK→answer_options)
- **Endpoint:** `POST /api/student/tests/{testId}/submit`
- **Auth:** Bearer token required, role = STUDENT, token testId must match
- **Request:**
  ```json
  {
    "answers": [
      { "questionId": 1, "selectedOptionId": 3 },
      { "questionId": 2, "selectedOptionId": 7 }
    ]
  }
  ```
- **Response (201):**
  ```json
  {
    "attemptId": 1,
    "score": 80,
    "maxScore": 100,
    "percentage": 80.0,
    "submittedAt": "2026-04-11T10:30:00Z"
  }
  ```
- **Response (409):** `{ "error": "Test already submitted" }`
- **Notes:** In a single @Transactional: save all student_answers, compare each selected option's `isCorrect`, sum points for correct answers, save test_attempt with score and max_score. Add unique constraint on (test_id, student_id) to prevent double submission.

**FE-9.1 · Submit Test Action**

- **Screen:** `/test/{testId}` (triggered from confirmation modal)
- **Calls:** `POST /api/student/tests/{testId}/submit`
- **UI renders:**
  - Loading spinner while grading
  - On success → redirect to `/results/{attemptId}`
  - On error (already submitted) → show error message

---

### Story 10 — View My Result

**BE-10.1 · Get Attempt Result API**

- **Tables:** `test_attempts`, `student_answers`, `questions`, `answer_options`
- **Endpoint:** `GET /api/student/attempts/{attemptId}`
- **Auth:** Bearer token required, must be the attempt's student
- **Response (200):**
  ```json
  {
    "attemptId": 1,
    "testTitle": "string",
    "score": 80,
    "maxScore": 100,
    "percentage": 80.0,
    "submittedAt": "2026-04-11T10:30:00Z",
    "questions": [
      {
        "questionId": 1,
        "questionText": "string",
        "points": 10,
        "selectedOptionId": 3,
        "selectedOptionText": "string",
        "correctOptionId": 2,
        "correctOptionText": "string",
        "isCorrect": false
      }
    ]
  }
  ```
- **Notes:** Join test_attempts → student_answers → questions → answer_options. Include both selected and correct option details.

**FE-10.1 · Result Screen**

- **Screen:** `/results/{attemptId}`
- **Calls:** `GET /api/student/attempts/{attemptId}`
- **UI renders:**
  - Score summary: "80 / 100 (80%)"
  - Question-by-question breakdown:
    - Question text
    - Student's answer — green highlight if correct, red if wrong
    - Correct answer shown if student was wrong
    - Points earned per question
  - "Back to Home" button

---

### Story 11 — View Past Results

**BE-11.1 · List Student's Past Attempts API**

- **Tables:** `test_attempts`, `tests`
- **Endpoint:** `GET /api/student/my-results`
- **Auth:** Bearer token required, role = STUDENT
- **Response (200):**
  ```json
  [
    {
      "attemptId": 1,
      "testTitle": "string",
      "score": 80,
      "maxScore": 100,
      "percentage": 80.0,
      "submittedAt": "2026-04-11T10:30:00Z"
    }
  ]
  ```
- **Notes:** Filter by student_id from JWT. Order by submitted_at DESC.

**FE-11.1 · Past Results Screen**

- **Screen:** `/my-results`
- **Calls:** `GET /api/student/my-results`
- **UI renders:**
  - Page title "My Past Results"
  - List of past attempts, each showing: test title, score, percentage, date
  - Each item clickable → navigates to `/results/{attemptId}` (reuses FE-10.1)
  - Empty state: "No results yet."

---

## Sprint 3 — "A teacher can analyze results and the app is production-ready"

---

### Story 12 — View Class Results

**BE-12.1 · Get Class Results API**

- **Tables:** `test_attempts`, `users`
- **Endpoint:** `GET /api/teacher/tests/{testId}/results`
- **Auth:** Bearer token required, must own the test
- **Query Params:** `?sort=score&order=desc&search=john&page=0&size=20`
- **Response (200):**
  ```json
  {
    "totalStudents": 30,
    "page": 0,
    "size": 20,
    "results": [
      {
        "attemptId": 1,
        "studentName": "string",
        "score": 80,
        "maxScore": 100,
        "percentage": 80.0,
        "submittedAt": "2026-04-11T10:30:00Z"
      }
    ]
  }
  ```
- **Notes:** Support sorting by studentName, score, percentage, submittedAt. Support search by student name (LIKE query). Use Spring `Pageable`. Verify teacher owns the test.

**FE-12.1 · Class Results Screen**

- **Screen:** `/dashboard/tests/{testId}/results`
- **Calls:** `GET /api/teacher/tests/{testId}/results`
- **UI renders:**
  - Page title with test name
  - Search bar to filter by student name
  - Sortable table with columns: Student Name, Score, Percentage, Submitted Date
  - Clickable column headers to sort ascending/descending
  - Pagination controls at the bottom
  - Total student count displayed

---

### Story 13 — Class Statistics

**BE-13.1 · Get Class Statistics API**

- **Tables:** `test_attempts`
- **Endpoint:** `GET /api/teacher/tests/{testId}/statistics`
- **Auth:** Bearer token required, must own the test
- **Response (200):**
  ```json
  {
    "totalAttempts": 30,
    "averageScore": 75.5,
    "highestScore": 98,
    "lowestScore": 32,
    "averagePercentage": 75.5,
    "passRate": 83.3,
    "passThreshold": 50,
    "distribution": [
      { "range": "0-10%", "count": 0 },
      { "range": "10-20%", "count": 1 },
      { "range": "20-30%", "count": 2 },
      { "range": "30-40%", "count": 3 },
      { "range": "40-50%", "count": 2 },
      { "range": "50-60%", "count": 4 },
      { "range": "60-70%", "count": 5 },
      { "range": "70-80%", "count": 5 },
      { "range": "80-90%", "count": 5 },
      { "range": "90-100%", "count": 3 }
    ]
  }
  ```
- **Notes:** Use SQL aggregates (AVG, MIN, MAX, COUNT). Pass rate = count of attempts with percentage >= passThreshold / total. Distribution computed with CASE expressions or in service layer.

**FE-13.1 · Statistics Panel**

- **Screen:** `/dashboard/tests/{testId}/results` (panel above the results table from FE-12.1)
- **Calls:** `GET /api/teacher/tests/{testId}/statistics`
- **UI renders:**
  - Summary cards: Average Score, Highest, Lowest, Pass Rate, Total Students
  - Bar chart (Recharts) showing score distribution with 10 buckets
  - Panel sits above the class results table on the same page

---

### Story 14 — Per-Question Analysis

**BE-14.1 · Get Per-Question Analysis API**

- **Tables:** `questions`, `answer_options`, `student_answers`
- **Endpoint:** `GET /api/teacher/tests/{testId}/question-analysis`
- **Auth:** Bearer token required, must own the test
- **Response (200):**
  ```json
  [
    {
      "questionId": 1,
      "questionText": "string",
      "points": 10,
      "correctRate": 73.3,
      "totalAnswers": 30,
      "optionDistribution": [
        { "optionId": 1, "optionText": "string", "isCorrect": false, "count": 5, "percentage": 16.7 },
        { "optionId": 2, "optionText": "string", "isCorrect": true, "count": 22, "percentage": 73.3 },
        { "optionId": 3, "optionText": "string", "isCorrect": false, "count": 3, "percentage": 10.0 }
      ]
    }
  ]
  ```
- **Notes:** For each question, count how many students selected each option. correctRate = count of students who picked the correct option / total answers. Order by display_order by default, support sorting by correctRate.

**FE-14.1 · Question Analysis Screen**

- **Screen:** `/dashboard/tests/{testId}/question-analysis`
- **Calls:** `GET /api/teacher/tests/{testId}/question-analysis`
- **UI renders:**
  - List of questions, each showing:
    - Question text and point value
    - Correct answer rate as a percentage with a colored bar (green if >70%, yellow 40–70%, red <40%)
    - Expandable section showing answer distribution (how many picked each option)
  - Sort dropdown: by question order, by hardest first, by easiest first
  - Link from the class results page to this screen

---

### Story 15 — Export Results

**BE-15.1 · Export Results as CSV API**

- **Tables:** `test_attempts`, `users`
- **Endpoint:** `GET /api/teacher/tests/{testId}/results/export?format=csv`
- **Auth:** Bearer token required, must own the test
- **Response:** File download
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="TestTitle_results.csv"`
  - CSV columns: Student Name, Score, Max Score, Percentage, Submitted Date
- **Notes:** Use `HttpServletResponse` to write CSV directly. Escape commas and quotes in student names.

**BE-15.2 · Export Results as Excel API**

- **Tables:** `test_attempts`, `users`
- **Endpoint:** `GET /api/teacher/tests/{testId}/results/export?format=xlsx`
- **Auth:** Bearer token required, must own the test
- **Response:** File download
  - Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Content-Disposition: `attachment; filename="TestTitle_results.xlsx"`
- **Notes:** Use Apache POI to generate the Excel file. Same columns as CSV with header row styling.

**FE-15.1 · Export Buttons**

- **Screen:** `/dashboard/tests/{testId}/results` (buttons on the class results page)
- **Calls:** `GET /api/teacher/tests/{testId}/results/export?format=csv` or `?format=xlsx`
- **UI renders:**
  - "Download CSV" button
  - "Download Excel" button
  - Buttons trigger a direct file download (use `window.open()` or anchor tag with download attribute)
  - Buttons placed next to the search bar on the results page
