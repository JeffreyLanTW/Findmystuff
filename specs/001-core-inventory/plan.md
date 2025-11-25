# Implementation Plan: Core Inventory Management

**Branch**: `001-core-inventory` | **Date**: 2025-11-24 | **Spec**: [specs/001-core-inventory/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-core-inventory/spec.md`

## Summary

The FindMyStuff app helps users track what they own and where it's stored. This implementation plan covers the core MVP: adding items to inventory, viewing them in a list, assigning items to locations, and filtering by location. Built with React Native for cross-platform iOS/Android support.

## Technical Context

**Language/Version**: TypeScript 5.0+ with React Native 0.73+  
**Primary Dependencies**: React Native, React Navigation, Redux Toolkit, React Native Paper (Material Design UI)  
**Storage**: SQLite (via react-native-sqlite-storage) for offline-first local database  
**Testing**: Jest (unit/integration tests), Detox (E2E tests for React Native)  
**Target Platform**: iOS 14+ and Android API 21+  
**Project Type**: Mobile (React Native) - unified codebase for iOS and Android  
**Performance Goals**: 
- App initialization: < 3 seconds on 4G
- Screen navigation: < 300ms transitions
- List rendering: < 300ms for 20 items
- Search: < 500ms response time with 10,000+ items

**Constraints**: 
- < 150MB memory footprint during typical usage
- < 50MB local database for 10,000 items
- Offline-capable (no network dependency for core features)
- Image compression: max 2MB per image, 80% JPEG quality

**Scale/Scope**: 
- MVP target: 10,000 items per user
- Initial release: iOS and Android parity
- Scalable to larger datasets with pagination
- Foundation for future AI features (image recognition, smart search)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I - Test-First**: Specification includes independent test scenarios (4 user stories with acceptance criteria)
- [x] **Principle II - Code Quality**: TypeScript strict mode, ESLint/Prettier, typed Redux store
- [x] **Principle III - UX Consistency**: React Native Paper ensures Material Design consistency across iOS/Android
- [x] **Principle IV - Performance**: Success criteria include measurable targets (300ms list render, 500ms search, < 150MB memory)
- [x] **Principle V - React Native Mobile-First**: Feature-based architecture, platform-agnostic components, no platform-specific code needed for MVP

## Project Structure

### Documentation (this feature)

```text
specs/001-core-inventory/
├── spec.md                  # Feature specification (THIS FILE)
├── plan.md                  # Implementation plan (THIS FILE)
├── research.md              # Phase 0 output (Technology research)
├── data-model.md            # Phase 1 output (Schema design)
├── contracts/               # Phase 1 output (API contracts for integration)
│   ├── item-service.md
│   ├── location-service.md
│   └── database-schema.sql
├── quickstart.md            # Phase 1 output (Developer setup guide)
└── tasks.md                 # Phase 2 output (Task breakdown)
```

### Source Code (repository root)

```text
FindMyStuff/
├── src/
│   ├── components/          # Reusable UI components (platform-agnostic)
│   │   ├── ItemCard.tsx     # Item display with thumbnail and info
│   │   ├── LocationPicker.tsx # Location selection component
│   │   ├── SearchBar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── screens/             # Feature-based screens
│   │   ├── HomeScreen/
│   │   │   ├── index.tsx    # Main inventory list
│   │   │   ├── useHomeLogic.ts
│   │   │   └── styles.ts
│   │   ├── AddItemScreen/
│   │   │   ├── index.tsx    # Add/edit item form
│   │   │   ├── useAddItemLogic.ts
│   │   │   └── styles.ts
│   │   ├── ItemDetailScreen/
│   │   │   ├── index.tsx
│   │   │   └── useItemDetailLogic.ts
│   │   └── LocationsScreen/
│   │       ├── index.tsx
│   │       └── useLocationsLogic.ts
│   ├── services/            # Business logic layer
│   │   ├── itemService.ts   # Item CRUD operations
│   │   ├── locationService.ts
│   │   ├── imageService.ts  # Image compression/optimization
│   │   └── database.ts      # SQLite initialization
│   ├── store/               # Redux state management
│   │   ├── index.ts
│   │   ├── itemSlice.ts
│   │   ├── locationSlice.ts
│   │   └── selectors.ts
│   ├── types/               # TypeScript interfaces
│   │   ├── Item.ts
│   │   ├── Location.ts
│   │   └── index.ts
│   ├── navigation/          # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── utils/               # Utility functions
│   │   ├── validators.ts    # Input validation
│   │   ├── formatters.ts    # Date/string formatting
│   │   └── errors.ts        # Error handling
│   └── App.tsx              # Root component
├── tests/
│   ├── unit/                # Unit tests
│   │   ├── services/
│   │   │   ├── itemService.test.ts
│   │   │   ├── locationService.test.ts
│   │   │   └── imageService.test.ts
│   │   ├── store/
│   │   │   ├── itemSlice.test.ts
│   │   │   └── locationSlice.test.ts
│   │   └── utils/
│   │       ├── validators.test.ts
│   │       └── formatters.test.ts
│   ├── integration/         # Integration tests
│   │   ├── itemWorkflow.test.ts      # Add item, view, search flow
│   │   ├── locationWorkflow.test.ts  # Location creation and filtering
│   │   └── database.test.ts          # SQLite persistence
│   └── e2e/                 # End-to-end tests (Detox)
│       ├── addItemFlow.e2e.ts
│       ├── searchFlow.e2e.ts
│       └── locationFlow.e2e.ts
├── app.json                 # React Native config
├── package.json
├── tsconfig.json            # TypeScript config (strict mode)
├── jest.config.js
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

**Structure Decision**: This is a standard React Native mobile project with:
- **Feature-based folder structure** under `src/screens/` (one folder per user story/feature)
- **Shared components** layer for reusable Material Design UI elements
- **Services layer** for all business logic and database operations (separation of concerns)
- **Redux store** for app-wide state management (inventory list, search filters, current location)
- **Mirrored test structure** matching source code organization (tests co-located by type)
- **SQLite database** for offline-first, persistent local storage

## Complexity Tracking

> No Constitution violations requiring justification. Architecture adheres to all 5 principles.

## Next Steps

1. **Phase 0 - Research**: Technology validation (SQLite vs Realm, Redux vs Zustand, image compression libraries)
2. **Phase 1 - Design**: Complete data model, API contracts, and developer quickstart
3. **Phase 2 - Tasks**: Break down into granular development tasks with clear dependencies
4. **Phase 3 - Implementation**: Build features in priority order (P1 stories first)

---

**Ready for Phase 0 Research?** ✅ Constitution check complete. Proceed with technology validation and design phase.

