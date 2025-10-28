# MindForge

An interactive platform for modern educators to engage with every student individually.

## Overview

MindForge is a web application designed for teachers and instructors to move beyond traditional lectures. It allows for the quick creation of student groups ("Promotions") and is built to support real-time, individual participation through quizzes and open-ended questions. The platform leverages AI to streamline administrative tasks, such as creating student lists from images, allowing educators to focus on teaching and student engagement.

The project is built with a focus on a clean, scalable architecture, using principles from Domain-Driven Design (DDD) to separate business logic from infrastructure concerns.

## Key Features

- **AI-Powered Roster Creation**: Upload an image of a class roster, and MindForge's AI will parse it into an editable student list.
- **Promotion Management**: Easily create and manage student groups (Promotions) with specific academic years.
- **Editable Student Data**: Review and edit parsed student information in a clean, table-based interface.
- **Dynamic Email Generation**: Auto-generate student emails from customizable templates.

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma as the ORM.
- **API**: tRPC
- **UI**: shadcn-svelte, Tailwind CSS
- **Testing**: Vitest (Unit & Integration), Playwright (E2E), Testcontainers
- **AI**: OpenRouter AI SDK
- **Package Manager**: Bun

## Project Architecture

The core business logic is organized using Domain-Driven Design (DDD) and Clean Architecture principles, located in the `src/quiz-context` directory.

- `src/quiz-context/domain`: Contains the core business models (Aggregates, Entities, Value Objects) and interfaces. This layer is completely independent.
- `src/quiz-context/application`: Contains the use cases that orchestrate the domain models to perform application-specific tasks.
- `src/quiz-context/infra`: Contains the concrete implementations of the domain interfaces, such as repositories (`PrismaPromotionRepository`) and external service clients (`ImageStudentListParser`).
- `src/quiz-context/adapters`: Connects the outer world (like the tRPC router) to the application use cases.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- [Docker](https://www.docker.com/) running (for integration tests).
- Access to an AI provider (like OpenRouter) and a PostgreSQL database.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mindforge
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the necessary environment variables. At a minimum, you will need:

    ```env
    # Example .env file

    # For Prisma to connect to your database
    DATABASE_URL="postgresql://user:password@host:port/database"

    # For the AI image parsing feature
    OPENROUTER_API_KEY="your-openrouter-api-key"
    OPENROUTER_MODEL_NAME="google/gemini-pro-vision"
    ```

4.  **Run database migrations:**

    This will sync your Prisma schema with your database.
    ```bash
    bun prisma db push
    ```

## Development

To start the development server, run:

```bash
bun run dev
```

This will start the SvelteKit application, typically available at `http://localhost:5173`.

## Testing

To run the entire test suite (unit and integration tests), run:

```bash
bun test:all
```

The integration tests will automatically spin up a PostgreSQL database in a Docker container using Testcontainers, run the tests against it, and tear it down afterward.
