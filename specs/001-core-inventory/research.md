# Research: Core Inventory Management - Technology Validation

**Phase**: Phase 0 Research  
**Date**: 2025-11-24  
**Input**: plan.md technical context  

## Executive Summary

This research validates technology choices for the FindMyStuff React Native MVP. All recommended technologies have been selected for:
- **Offline-first capability** (core requirement)
- **Cross-platform compatibility** (iOS + Android parity)
- **Performance targets** (< 3s init, < 300ms list rendering)
- **Type safety** (TypeScript strict mode)
- **Test coverage** (Jest + Detox support)

## Database Technology Analysis

### Candidate: SQLite (RECOMMENDED ✅)

**Rationale**:
- ✅ Native offline support (completely local)
- ✅ Zero-dependency local storage (built-in to React Native)
- ✅ Proven at scale (supports 50MB+ databases)
- ✅ Excellent performance for < 50,000 items
- ✅ SQL queries enable complex search/filtering
- ✅ react-native-sqlite-storage is mature and well-maintained

**Decision**: Use `react-native-sqlite-storage` for all data persistence

**Alternatives Considered**:
- Realm: Overkill for MVP scope, adds build complexity
- AsyncStorage: Not suitable for relational data (items + locations)
- WatermelonDB: Better for 100k+ items, unnecessary complexity for MVP

## State Management: Redux vs Zustand

### Candidate: Redux Toolkit (RECOMMENDED ✅)

**Rationale**:
- ✅ Redux DevTools for excellent debugging
- ✅ Mature ecosystem with many utilities
- ✅ Time-travel debugging crucial for complex inventory workflows
- ✅ Thunk middleware handles async database operations
- ✅ TypeScript support is excellent

**Decision**: Use Redux Toolkit for global state management

**Structure**:
```typescript
store/
├── itemSlice.ts        // Items list, search filters
├── locationSlice.ts    // Locations, current location
├── uiSlice.ts          // Loading states, errors
└── selectors.ts        // Memoized selectors for performance
```

**Alternatives Considered**:
- Zustand: Simpler but lacks DevTools, debugging harder for complex flows
- MobX: Overkill for mobile app, adds runtime overhead
- Context API: Fine for small apps, but performance issues with large lists

## UI Component Library

### Candidate: React Native Paper (RECOMMENDED ✅)

**Rationale**:
- ✅ Material Design 3 ensures iOS/Android consistency
- ✅ Pre-built accessible components (WCAG 2.1 AA compliance)
- ✅ Dark mode support built-in
- ✅ Excellent TypeScript support
- ✅ Active maintenance and community

**Decision**: Use React Native Paper for all UI components

**Theme Configuration**:
- Light/Dark themes pre-defined
- Custom color scheme for branding
- Consistent spacing and typography across platforms

**Alternatives Considered**:
- Native Base: Similar but heavier bundle
- UI Kitten: Good but less Material Design focused
- Custom components: Too time-consuming for MVP

## Image Handling Strategy

### Image Compression (RECOMMENDED ✅)

**Requirements**:
- Max 2MB per image (after compression)
- 80% JPEG quality
- Auto-compress on select

**Technology**: `react-native-image-resizer`

**Flow**:
```
User selects image → Get dimensions → Compress to 2MB max → Convert to base64 → Store in DB
```

**Performance Target**: Image compression < 2 seconds

**Rationale**:
- Prevents database bloat
- Ensures fast image loading
- Maintains acceptable visual quality

## Testing Strategy

### Unit Tests: Jest (RECOMMENDED ✅)

**Coverage Target**: ≥ 80% for services and utilities

**Tools**:
- `jest` - Test framework
- `@testing-library/react-native` - Component testing
- `@testing-library/jest-native` - Additional matchers

**Structure**:
```typescript
tests/unit/
├── services/
│   ├── itemService.test.ts      // Item CRUD operations
│   ├── locationService.test.ts
│   └── imageService.test.ts
├── store/
│   ├── itemSlice.test.ts
│   └── locationSlice.test.ts
└── utils/
    ├── validators.test.ts
    └── formatters.test.ts
```

### Integration Tests: Jest (RECOMMENDED ✅)

**Coverage**: End-to-end workflows within single feature

**Test Scenarios**:
- Add item → View in list → Search → Find item
- Create location → Assign item → Filter by location
- Image selection → Compression → Storage

**Tools**: Same as unit tests

### E2E Tests: Detox (RECOMMENDED ✅)

**Critical User Journeys**:
1. Add Item with photo - from home screen to inventory list
2. Search and find item - from search input to item details
3. Create location and assign - location workflow

**Tools**: `detox` - React Native E2E testing framework

**Run Environment**: iOS simulator (Android to be added)

## Navigation Architecture

### React Navigation 6.x (RECOMMENDED ✅)

**Structure**:
```typescript
navigation/
├── RootNavigator.tsx      // Main navigation structure
├── types.ts               // Navigation param types
└── linking.ts             // Deep linking configuration (future)
```

**Navigation Tabs** (MVP):
- Home (Inventory list)
- Locations (Browse locations)
- Add Item (Quick add button)

**Type Safety**: All navigation params fully typed in TypeScript

## Performance Optimization Strategy

### List Rendering

**Target**: < 300ms render time for 20 items

**Strategy**:
- Use `FlatList` with `windowSize={10}` (only render visible items)
- Memoize item components with `React.memo`
- Redux selectors are memoized (prevent unnecessary re-renders)

**Testing**: React Profiler, Hermes debugger

### Database Queries

**Target**: < 500ms for search with 10,000 items

**Optimization**:
- Database indexes on `name`, `location_id`, `created_at`
- Pagination (20 items per page)
- Lazy loading for list scroll

**Testing**: Query profiling with sqlite3 CLI

### Memory Management

**Target**: < 150MB for 1,000 items

**Strategy**:
- Image compression to 2MB max
- Local cache cleanup (delete images older than 30 days)
- Redux DevTools disabled in production

**Testing**: Android Profiler, Xcode Memory graph

## Dependency Decisions

### Production Dependencies

```json
{
  "react": "18.2.0",           // Latest stable
  "react-native": "^0.73.0",   // Latest with good TypeScript support
  "@react-navigation/native": "^6.1.9",
  "react-native-paper": "^5.11.0",
  "@reduxjs/toolkit": "^1.9.7",
  "react-native-sqlite-storage": "^6.0.0",
  "react-native-image-resizer": "^1.4.4",
  "uuid": "^9.0.1"
}
```

### Dev Dependencies

```json
{
  "typescript": "5.2.2",         // Strict mode required
  "jest": "^29.7.0",
  "@testing-library/react-native": "^12.4.0",
  "detox": "^20.13.0",
  "eslint": "^8.52.0",
  "prettier": "^3.1.0"
}
```

## Build & Deployment

### iOS Build

**Requirements**:
- Xcode 14+
- CocoaPods
- iOS 14+ deployment target

**Build Command**: `npm run build:ios`

### Android Build

**Requirements**:
- Android Studio 2022+
- Gradle
- Android API 21+ target

**Build Command**: `npm run build:android`

## Security Considerations

### Local Data

- No encryption required for MVP (local device storage only)
- User controls all data
- No cloud sync in MVP

### Future Enhancements

- Cloud backup option (encrypted)
- User authentication (when backend added)
- Data export functionality

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| SQLite locks during concurrent access | Low | Medium | Use WAL mode (Write-Ahead Logging) |
| Image compression takes > 2s | Low | High | Use native compression libs (already included) |
| Redux store gets too large (10k+ items) | Low | Medium | Pagination + normalization in store |
| Navigation performance degrades | Very Low | High | Use lazy loading + memoization |

## Recommendations

### Phase 1 - Setup (Week 1)
- ✅ Set up React Native project with TypeScript
- ✅ Configure Redux store structure
- ✅ Initialize SQLite database
- ✅ Setup React Navigation

### Phase 2 - MVP Implementation (Weeks 2-3)
- Implement item and location services
- Build UI screens with React Native Paper
- Write unit and integration tests
- Implement search and filtering

### Phase 3 - Polish & Testing (Week 4)
- E2E testing with Detox
- Performance optimization
- Accessibility audit
- Release build testing

---

**All technology choices approved.** Ready for Phase 1 design and data modeling.

