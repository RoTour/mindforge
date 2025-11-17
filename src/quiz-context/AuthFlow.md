Reviewing the auth flow for Mindforge.

Currently, teacher are creating promotion first with the student list they are given by schools.
A new student entity is created for each student in the list, with an optional generated email.

Problem arises when a second teacher create a promotion with the same student, as a new student entity is created again, leading to duplicates/conflict on emails.

Students have accounts that might use different emails than the ones provided by the school.

We then have two options:
- Define emails as unique ID for students.
- When joining a promotion, we ask students to enter their email, and we link the promotion to the student entity with that email.
- If not found, show a message "is this email correct ? wait for teacher" with a qr code that, when scanned by the teacher, will prompt the teacher to link email to student entity. (from list of unlinked students in the promotion)
- If found, send a confirmation email to the student to confirm they are the owner of that email before linking.
- This way, we avoid duplicates and ensure that students are correctly linked to their accounts.
