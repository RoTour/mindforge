# Learning Rules

## Domain Events
- QuestionAnswered
- QuestionCreated

## Entities
**🧠 Concept (Aggregate Root)**
Represents a piece of knowledge the user wants to learn.

id (UUID)
title (string) – The concept’s name
description (string) – Optional additional details
questions (List of Question entities)
currentInterval (integer) – Spaced repetition interval
nextReviewDate (datetime) – When the next question will be asked

**❓ Question**
A question related to a concept.

id (UUID)
conceptId (UUID) – Links to the parent Concept
prompt (string) – The question text
answer (string) – The correct answer
lastAttemptDate (datetime)
successStreak (integer) – Tracks consecutive correct answers
intervalModifier (float) – Adjusts spacing based on performance
options (list of strings) – Optional list of answer options
questionType (string) – Indicates the type of question ('TRUE_FALSE', 'MULTIPLE_CHOICES', 'SIMPLE')

## Scenarios
****1. **Answering a Question Correctly**
Given I have a pool of questions for different concepts
When I am asked a question from the pool
And I provide the correct answer
Then the application should acknowledge my correct answer
And increase the interval before that specific question is asked again**

2. **Answering a Question Incorrectly**
Given I have a pool of questions for different concepts
When I am asked a question from the pool
And I provide the incorrect answer
Then the application should notify me of the incorrect answer
And reset the interval for that specific question

3. **Answering Multiple Questions**
Given I have multiple concepts with questions in the pool
When I am asked questions throughout the day
Then I should be able to answer multiple questions
And each question should follow its own interval for review