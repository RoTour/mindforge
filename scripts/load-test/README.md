# Load Test Scripts

This directory contains scripts for generating test data and simulating load on the application.

## Environment

These scripts run in an **isolated environment** to prevent accidental modification of the development or production databases.

-   **Configuration**: `env.loadtest` (in the project root).
-   **Target Database**: `mindforge_loadtest` (PostgreSQL).
-   **Dedicated Redis instance**: `redies_loadtest` (Redis).

## Setup

Before running any scripts, you must initialize the load test database:

```bash
bun run loadtest:setup
```

This command pushes the Prisma schema to the `mindforge_loadtest` database.
We then start a dedicated Redis instance for load testing using docker compose.

## Available Scripts

### 1. Create Users

Creates a specified number of students and enrolls them in a promotion.

**Usage:**

```bash
bun run loadtest:users <numberOfUsers> [promotionId]
```

-   `numberOfUsers`: The number of student accounts to create.
-   `promotionId` (Optional): The ID of an existing promotion to join. If omitted, a new promotion (and teacher) will be created.

**Example:**

```bash
# Create 50 users and a new promotion
bun run loadtest:users 50

# Create 100 users and join existing promotion
bun run loadtest:users 100 cmiafrfr10002yebj6xg18hnd
```

### 2. Simulate Answers

Simulates students in a promotion answering questions in a specific session.

**Usage:**

```bash
bun run loadtest:answers <promotionId> [questionSessionId]
```

-   `promotionId`: The ID of the promotion containing the students.
-   `questionSessionId` (Optional): The ID of the active question session. If omitted, the script will:
    1.  Find or create a question for the promotion's teacher.
    2.  Create a new active `QuestionSession`.
    3.  Submit answers to this new session.

**Example:**

```bash
# Simulate answers for a promotion, auto-generating a session
bun run loadtest:answers cmiafrfr10002yebj6xg18hnd

# Simulate answers for a specific existing session
bun run loadtest:answers cmiafrfr10002yebj6xg18hnd cmiagzkwz0003yedpx80t5514
```
