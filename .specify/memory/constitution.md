# FindMyStuff Constitution
<!-- AI-powered inventory and location tracking app for React Native -->

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)
<!-- TDD mandatory for all features -->
Every feature MUST follow Test-Driven Development (TDD) discipline: tests are written first, approved by specification, fail initially, then implementation follows. All code changes MUST have corresponding test coverage. Unit tests MUST achieve minimum 80% line coverage per feature. Integration tests MUST cover all critical user journeys. Code that lacks tests MUST NOT be merged.

### II. Code Quality Standards
<!-- Type safety and consistency across codebase -->
All code MUST adhere to language-specific linting and formatting standards. React Native code MUST follow ESLint + Prettier configuration. TypeScript files MUST maintain strict type safety (no implicit `any`). All functions MUST have clear documentation comments explaining parameters, return values, and exceptions. Code reviews MUST verify: type safety, naming clarity, no code duplication, and adherence to established patterns.

### III. User Experience Consistency
<!-- Intuitive navigation and accessible design -->
User interface MUST maintain consistent component patterns across all screens. Navigation flow MUST be intuitive and predictable. All interactive elements MUST provide immediate visual feedback (loading states, success/error messages). Accessibility standards (WCAG 2.1 Level AA minimum) MUST be followed. User journeys MUST be independently testable and documented in specification.

### IV. Performance Requirements
<!-- Responsive app with measurable performance targets -->
Initial app load time MUST NOT exceed 3 seconds on 4G network. Screen transitions MUST complete within 300ms for user-perceived smoothness. Memory footprint MUST NOT exceed 150MB on typical Android/iOS devices. Image processing and search operations MUST complete within 500ms for responsiveness. Database queries MUST be optimized; N+1 query patterns MUST be eliminated.

### V. React Native Mobile-First Architecture
<!-- Unified codebase for iOS and Android with shared business logic -->
All features MUST be built with mobile-first design: optimized for smaller screens first, then adapted for larger displays. Code MUST be shared between iOS and Android via React Native base components. Platform-specific code (if necessary) MUST be isolated in `.ios.ts` and `.android.ts` files only. Native modules MUST be avoided unless performance-critical; prefer platform-agnostic solutions.

## Performance Standards
<!-- Measurable targets for app responsiveness and efficiency -->

**Response Time Targets**:
- App initialization: < 3 seconds (4G network)
- Screen navigation: < 300ms transition time
- Search queries: < 500ms response time
- Image upload/processing: < 2 seconds
- Database reads: < 100ms (single item), < 500ms (list)

**Memory & Storage**:
- App memory footprint: < 150MB typical usage
- Local database size: < 50MB for 10,000 items
- Cache management: Automatic cleanup of images older than 30 days

**Network Efficiency**:
- Image compression: Default 80% quality JPEG, max 2MB per image
- Pagination: 20 items per page minimum, configurable up to 100
- Offline capability: Core functionality available without network

## Development Workflow & Quality Gates
<!-- Code review, testing, and deployment procedures -->

**Code Review Requirements**:
- EVERY pull request MUST have minimum 1 approval from code reviewer
- Reviews MUST verify: test coverage ≥ 80%, types are correct, no performance regressions
- Failing tests MUST block merging
- Linting/formatting errors MUST block merging

**Testing Gates**:
- Unit tests MUST pass locally before push
- Integration tests MUST pass in CI pipeline
- E2E tests for critical user journeys (add item, search, view location) MUST pass
- Performance regression tests MUST verify no new bottlenecks

**Deployment Gates**:
- All branches MUST build successfully on iOS and Android
- Feature branches MUST merge to `develop` before release
- Release branches follow semantic versioning: MAJOR.MINOR.PATCH

**Specification Requirements**:
- Every feature spec MUST include independent test scenarios
- Every user story MUST be independently testable and valuable
- Edge cases MUST be documented in specifications
- Acceptance criteria MUST be verifiable and measurable

## React Native Specific Guidance
<!-- Technology stack and recommended architecture patterns -->

**Technology Stack**:
- Runtime: React Native 0.73+
- Language: TypeScript (strict mode)
- State Management: Redux Toolkit or Zustand (choose one per feature)
- Database: SQLite (via react-native-sqlite-storage)
- Testing: Jest (unit/integration), Detox (E2E)
- UI Components: React Native Paper (Material Design consistency)

**Architecture Patterns**:
- Feature-based folder structure: `src/features/[feature-name]/`
- Services layer for business logic separation
- Redux store for app-wide state management
- Custom hooks for reusable UI logic
- Strict separation: components (UI only), services (logic), store (state)

**Code Organization**:
- `src/components/`: Reusable UI components
- `src/screens/`: Full-screen features (features as subdirectories)
- `src/services/`: Business logic, API calls, database queries
- `src/store/`: Redux store, slices, selectors
- `src/types/`: TypeScript interfaces and types
- `tests/`: Mirror source structure with `.test.ts` files

## Governance
<!-- Constitution compliance and amendment procedures -->

The FindMyStuff Constitution SUPERSEDES all other development practices and guidelines. All pull requests, code reviews, and specifications MUST comply with these principles. Violations MUST be addressed before code can be merged.

**Amendment Procedure**:
- Amendments require documented justification with specific constraints or learnings
- All team members MUST review proposed amendments
- Version MUST be bumped according to semantic versioning rules
- Migration plans MUST be provided for breaking changes
- Previous constitution version MUST be preserved in version control

**Compliance Verification**:
- All specifications generated MUST include "Constitution Check" section
- All PRs MUST reference relevant principle IDs (e.g., "Ensures compliance with Principle I")
- Build failures or test regressions MUST block deployment
- Performance regressions MUST trigger investigation and fixes

**Version Management**:
- MAJOR: Principle removals or fundamental architectural changes
- MINOR: New principles added or significant scope expansions
- PATCH: Clarifications, corrections, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
