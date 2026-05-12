# Architecture Overview

- **Backend**: .NET 10 (Aspire) using Clean Architecture.
  - **AppHost**: Orchestration with .NET Aspire.
  - **Web**: Minimal APIs, Scalar/OpenAPI documentation.
  - **Application**: MediatR CQRS, FluentValidation, AutoMapper.
  - **Infrastructure**: Entity Framework Core (PostgreSQL via Aspire), ASP.NET Core Identity.
  - **Domain**: Entities, Value Objects, Enums, Domain Events.
- **Frontend**: Next.js (Target) / React (Vite - Current) with Tailwind CSS v4.
  - **Styling**: Tailwind v4 (CSS-first approach).
  - **Data Fetching**: TanStack Query (React Query).
  - **Form Management**: React Hook Form + Zod.

# Coding Conventions

### Backend
- **Primary Constructors**: Use primary constructors for dependency injection in classes (e.g., `public class MyService(ILogger logger) { ... }`).
- **CQRS Pattern**: Every feature is split into Commands (Write) or Queries (Read).
- **Consolidated MediatR Handlers**: Place Command/Query, DTOs, and Handlers in a single file for better discoverability.
- **Endpoint Registration**: Use `IEndpointGroup` interface and `MapEndpoints` extension to register Minimal APIs.
- **Guard Clauses**: Use `Ardalis.GuardClauses` for input validation.

### Frontend
- **Component Structure**: Prefer Functional Components with Hooks.
- **Styling**: Use Tailwind v4 utility classes.
- **API Client**: Use a centralized `apiClient` (Axios or Fetch wrapper) for communication.
- **Server Components**: Utilize Next.js App Router and Server Components where appropriate.

# Testing & Workflows

### Adding a New Feature
1. **Domain**: Define/update Entities in `Domain\Entities`.
2. **Database**: Add `DbSet` to `ApplicationDbContext` and run migrations.
3. **Application**: Create Command/Query and Handler in `Application\<Feature>\Commands` or `Queries`.
4. **Endpoint**: Register the new endpoint in `Web\Endpoints\<Feature>.cs`.
5. **Frontend**: 
   - Update `apiClient` or generate types if using NSwag.
   - Implement UI using React components and TanStack Query.

### Testing
- **Unit Tests**: Test logic in `Domain` and `Application`.
- **Functional Tests**: Test API endpoints in `Application.FunctionalTests`.
- **Acceptance Tests**: Use Playwright for E2E testing in `Web.AcceptanceTests`.

# AI Instructions
Specialized instructions are located in `.ai-instructions/`:
- `backend-expert.md`: MediatR, Minimal APIs, and DI.
- `frontend-expert.md`: Next.js, Tailwind v4, and Hooks.
- `database-rules.md`: EF Core and Entity configurations.
