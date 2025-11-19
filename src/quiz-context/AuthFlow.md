### **Preamble: The Goal**

The flow begins when a **`User`** (who is already authenticated via "Better-Auth") lands on the enrollment page (`/students/enroll/[promotionId]`). The system's goal is to securely link this `User` to their corresponding **`Student`** record within that specific promotion and mark them as "enrolled."

---

### **Step 1: The Entry Point & Login Check**

When a user first visits the enrollment URL `/students/enroll/promotionId`:

- **Case A: User is NOT Logged In**
  1.  The system identifies the user is not authenticated.
  2.  It redirects them to your `/auth` service ("Better-Auth").
  3.  A `next url` parameter is included, telling the auth service to send the user back to `/students/enroll/promotionId` after they successfully log in.
  4.  The user logs in (or signs up) via Better-Auth and is redirected back.

- **Case B: User IS Logged In**
  1.  The system identifies the logged-in `User` (and has access to their `User.email` and `User.authId`).
  2.  The main enrollment logic begins.

---

### **Step 2: The "Switch" (The Core Enrollment Logic)**

The system now checks how to link the `User` to a `Student` in the promotion list.

#### 🌍 Scenario 1: The User's email _matches_ a Student.email

> This is the "happy path" for students who have a pre-registered email.

1.  **Path:** `User Email is same as a student in promotion`.
2.  **Action:** The system finds the matching `Student` record.
3.  **Check:** It checks if this `Student.authId` field is `NULL`.
    - **If `NULL`:** The system links the `User` by setting `Student.authId = User.authId`.
    - **If NOT `NULL`:** The `User` is already linked. No action needed.
4.  **Result:** The user is immediately `considered enrolled in promotion` and is redirected to their dashboard.

#### 🗺️ Scenario 2: The User's email does _NOT_ match any Student.email

> This path handles students with no email on file (the `Student.email == NULL` case) or a different email.

1.  **Path:** `No Students exist with User.email`.
2.  **Action:** The system prompts the user to enter their "school email" as a second way to be found.
3.  **Search:** The user submits a school email, and the system performs a search: `Look for students with the provided school email`.
    - **Case A: Student IS Found (via School Email)**
      1.  **Action:** The system sends a one-time password (OTP) to that "school email" to verify the user has access to it.
      2.  **Verify:** The user enters the OTP, and the system `Validate(s) OTP`.
      3.  **Link:** Once validated, the system links the `User` by setting `Student.authId = User.authId`.
      4.  **Result:** The user is `considered enrolled in promotion` and is redirected to their dashboard.

    - **Case B: Student is NOT Found (via School Email)**
      1.  **Action:** The system cannot automatically verify the user. It now initiates an **in-person teacher verification** flow.
      2.  **Collect Info:** The system asks the user for their `firstName` and `lastName`.
      3.  **Generate QR:** The system generates a `Join link QR code`. This QR code contains a secure payload with the `User.authId`, `firstName`, and `lastName`.
      4.  **Teacher Action:** The user must show this QR code to their teacher. The teacher scans it.
      5.  **Teacher Redirect:** The teacher's device is redirected to a URL like `/teacher/promotions/[promotionId]/invite?payload=[b64json]`.
      6.  **The "Find and Link" UI (Your Fix):** The teacher's screen now shows:
          - The `User`'s details from the payload (e.g., "User 'Rotour' wants to enroll").
          - A list of all **un-linked students** (those with no `authId` or `email`) from that promotion.
          - **Option 1:** The teacher can click on the correct student from the list to link them.
          - **Option 2:** If the student is genuinely missing, the teacher can click an "Add New Student" button, which uses the payload data (`firstName`, `lastName`, `authId`) to `Create Single Student` and link them.
      7.  **Result:** The link is established (either to an existing or new student), and the user is `considered enrolled in promotion`.
