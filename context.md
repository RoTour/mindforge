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