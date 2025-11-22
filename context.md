## Technical context
We are building this application following Domain-Driven Design principles, Clean Architecture and light CQRS.

You can find instructions on specific tasks in ./vibe-prompts/
- CreateEntity.md
- QueriesWithPrismaImplementation.md
- RepositoryImplementation.md

If you have a doubt about DDD concepts, you can review the ./docs/ folder

## DDD
ATM we have 3 bounded contexts:
- quiz-context
- auth
- better-auth

Auth is a supportive domain on top of better-auth implementation.

You can find more on this app and definitions in
- [UbiquitousLanguage](src/quiz-context/UbiquitousLanguage.md)
- [AuthFlow](src/quiz-context/AuthFlow.md)

## Tests
Every usecase should be tested, at least with unit tests, on both success and failure scenarios.

A test description should be focused on the behavior of the usecase, not on the implementation details.

Good examples of tests:
- "Auth flow: When logged user is different from student email, and provided school email is not the one the student has been created with, and student exists in list, should link to student"
- "Auth flow: When logged user is different from student email, and provided school email is not the one the student has been created with, and student does not exist in list, should create a new student in promotion"

**By default, vitest starts in watch mode. To run tests once, use `bun vitest run ...` instead of `bun vitest ...`**

## Validations
Always validate your work by running `bun run check`
