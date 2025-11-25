# Developer Quick Reference: FindMyStuff MVP

**Project Status**: Phase 1-2 Complete ✅ | Phases 3-8 Ready ⏳  
**Last Updated**: 2025-11-24  
**Branch**: `001-core-inventory`

---

## Quick Start (5 Minutes)

```bash
# 1. Clone & setup
git clone <repo-url> FindMyStuff
cd FindMyStuff
npm install
cd ios && pod install && cd ..

# 2. Verify everything works
npm run type-check      # TypeScript check
npm run lint            # Code quality
npm run test            # Run tests

# 3. Start development
npm run ios             # iOS simulator
npm run android         # Android simulator
```

---

## Project Structure at a Glance

```
src/
├── types/              # TypeScript interfaces (3 files)
├── services/           # Business logic (5 files)
│   ├── database.ts     # SQLite with schema
│   ├── itemService.ts  # Item CRUD (7 operations)
│   ├── locationService.ts
│   ├── imageService.ts (Phase 3)
│   └── ...
├── store/              # Redux state (4 files)
│   ├── itemSlice.ts    # Items + async thunks
│   ├── locationSlice.ts
│   ├── uiSlice.ts      # Modals, messages
│   └── index.ts        # Store config
├── navigation/         # React Navigation (2 files)
│   ├── RootNavigator.tsx
│   └── types.ts
├── screens/            # Feature screens (Phase 3+)
├── components/         # Reusable components (Phase 3+)
├── utils/              # Helpers (3 files)
└── App.tsx             # Root component

tests/
├── unit/               # Service, Redux, utility tests
├── integration/        # Feature workflow tests
└── e2e/                # Detox E2E tests (Phase 7)
```

---

## Current Implementation Status

### ✅ Complete (Phase 1-2)

| Component | Status | Files | Tests |
|-----------|--------|-------|-------|
| **Types** | ✅ | Item.ts, Location.ts, index.ts | - |
| **Database** | ✅ | database.ts | database.test.ts (8) |
| **Item Service** | ✅ | itemService.ts | itemService.test.ts (33) |
| **Location Service** | ✅ | locationService.ts | locationService.test.ts (20) |
| **Redux Store** | ✅ | itemSlice.ts, locationSlice.ts, uiSlice.ts, index.ts | itemSlice.test.ts, locationSlice.test.ts |
| **Navigation** | ✅ | RootNavigator.tsx, types.ts | - |
| **Utilities** | ✅ | validators.ts, formatters.ts, errors.ts | validators.test.ts (17), formatters.test.ts, errors.test.ts |

### ⏳ Ready for Development (Phases 3-8)

| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| **Phase 3** | Add Item feature | T015-T022 | ⏳ Ready |
| **Phase 4** | View list + search | T023-T030 | ⏳ Ready |
| **Phase 5** | Location assignment | T031-T036 | ⏳ Ready |
| **Phase 6** | Location filtering | T037-T038 | ⏳ Ready |
| **Phase 7** | Polish + QA | T039-T048 | ⏳ Ready |
| **Phase 8** | Release v0.1.0 | T049-T052 | ⏳ Ready |

---

## Key Services & APIs

### Database Service
```typescript
// Initialize database
await initDatabase();

// Execute queries
const result = await executeQuery(sql, params);
const rowCount = await executeCommand(sql, params);
```

### Item Service
```typescript
// 7 operations available
createItem(request)              // Create new item
getItem(id)                      // Get by ID
getAllItems(page, pageSize)      // Paginated list
searchItems(query, page, pageSize) // Search name+description
getItemsByLocation(locationId, page, pageSize) // Filter by location
updateItem(id, updates)          // Update fields
deleteItem(id)                   // Delete item
```

### Location Service
```typescript
// 5 operations available
createLocation(request)          // Create location
getLocation(id)                  // Get by ID
getAllLocations()                // Get all (sorted by created_at DESC)
updateLocation(id, updates)      // Update location
deleteLocation(id)               // Delete location
```

### Redux Store
```typescript
// Dispatch async thunks
dispatch(loadItemsAsync(page))
dispatch(searchItemsAsync(query, page))
dispatch(createItemAsync(request))
dispatch(deleteItemAsync(id))

// Select state (memoized)
selectItemList              // Current page items
selectTotalItems            // Total count
selectSearchQuery            // Search filter
selectLoading               // Loading state
selectError                 // Error message
```

---

## Development Workflow

### Adding a New Feature (e.g., Phase 3: Add Item)

#### 1. Create Feature Branch
```bash
git checkout -b 001-add-item-feature
```

#### 2. Write Tests First (TDD ✅)
```bash
# Create test file
touch tests/unit/screens/AddItemScreen.test.ts

# Run tests (will fail - that's expected)
npm run test -- tests/unit/screens/AddItemScreen.test.ts --watch
```

#### 3. Implement Feature
```typescript
// src/screens/AddItemScreen/index.tsx
export const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  // Component implementation
  // Uses Redux dispatch, validators, error handling
  // Props typed with React Navigation
};
```

#### 4. Verify Tests Pass
```bash
npm run test -- --coverage
```

#### 5. Check Code Quality
```bash
npm run lint -- --fix
npm run format
npm run type-check
```

#### 6. Commit & Push
```bash
git add .
git commit -m "feat(items): implement add item feature with tests

- Create AddItemScreen component
- Add image compression service
- Create Redux integration
- Achieve 85% test coverage"

git push origin 001-add-item-feature
```

---

## Code Patterns & Standards

### ✅ Service Pattern
```typescript
// 1. Validate input
const validation = validateItemName(name);
if (!validation.valid) throw new ValidationError(validation.error);

// 2. Prepare data
const item: Item = {
  id: uuidv4(),
  name: name.trim(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// 3. Persist
await executeCommand(SQL, [item.id, item.name, ...]);
return item;
```

### ✅ Redux Async Thunk Pattern
```typescript
const loadItemsAsync = createAsyncThunk(
  'items/loadItems',
  async (page: number) => {
    const result = await itemService.getAllItems(page);
    return result;
  }
);

// Reducer handling
builder
  .addCase(loadItemsAsync.pending, (state) => {
    state.loading = true;
  })
  .addCase(loadItemsAsync.fulfilled, (state, action) => {
    state.items = action.payload.items;
    state.total = action.payload.total;
    state.loading = false;
  });
```

### ✅ Component Pattern with Redux
```typescript
const HomeScreen: React.FC = ({ navigation }) => {
  const dispatch = useDispatch();
  const items = useSelector(selectItemList);
  const loading = useSelector(selectLoading);
  
  useEffect(() => {
    dispatch(loadItemsAsync(1));
  }, [dispatch]);
  
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <ItemCard item={item} />}
      refreshing={loading}
      onRefresh={() => dispatch(loadItemsAsync(1))}
    />
  );
};
```

### ✅ Type Safety
```typescript
// ✅ Good - explicit types
const item: Item = {
  id: uuidv4(),
  name: 'Camera',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// ❌ Bad - implicit any
const item = { name: 'Camera' };
```

---

## Testing Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test -- --coverage

# Run specific test file
npm run test -- tests/unit/services/itemService.test.ts

# Run E2E tests (Phase 7+)
npm run e2e
```

---

## Code Quality Commands

```bash
# Type checking
npm run type-check

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint -- --fix

# Format code with Prettier
npm run format

# Check all (type + lint + format)
npm run check-all
```

---

## Running the App

```bash
# iOS simulator
npm run ios

# Android simulator (requires Android SDK)
npm run android

# Start dev server
npm start

# Production build (iOS)
npm run build:ios

# Production build (Android)
npm run build:android
```

---

## Database Access

### SQLite Direct Access
```bash
# Open SQLite shell
sqlite3 findmystuff.db

# List items
SELECT * FROM items LIMIT 10;

# List locations
SELECT * FROM locations;

# Check indexes
PRAGMA index_list(items);

# Query performance analysis
EXPLAIN QUERY PLAN SELECT * FROM items WHERE LOWER(name) LIKE '%camera%';
```

---

## Debugging Tips

### Redux State
```bash
# Redux DevTools auto-opens in dev mode
# Or manually open browser:
open "http://localhost:8081/?debugger-ui"
```

### React DevTools Profiler
```bash
npm run ios
# In app, open React DevTools Profiler
# Check component render times (target: < 300ms)
```

### Console Logging
```typescript
// Use console for debugging
console.log('Item:', item);
console.time('search');
const results = await searchItems(query);
console.timeEnd('search'); // Logs duration
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module @services" | Check tsconfig.json paths alias |
| "Database not initialized" | Ensure `initDatabase()` called in App.tsx useEffect |
| "Type error: no implicit any" | Add explicit type annotation |
| "Tests fail with module error" | Run `npm install` first |
| "List rendering slow" | Check FlatList keyExtractor, use React.memo |
| "Search takes > 500ms" | Verify database indexes exist |

---

## Performance Targets

| Metric | Target | Check |
|--------|--------|-------|
| **App Init** | < 3s on 4G | `npm run ios` startup time |
| **List Render** | < 300ms | React DevTools Profiler |
| **Search** | < 500ms | Console.time in searchItems |
| **Memory** | < 150MB | iOS/Android memory profiler |
| **Database** | < 50MB for 10k items | SQLite file size |

---

## Next Steps

### Immediate (Today)
1. ✅ Run `npm install`
2. ✅ Run `npm run test -- --coverage`
3. ✅ Verify Phase 2 tests pass
4. ⏳ Review IMPLEMENTATION_SUMMARY.md

### This Sprint (Phase 3-4)
1. ⏳ Pick Phase 3 or 4 task from tasks.md
2. ⏳ Write failing tests first (TDD)
3. ⏳ Implement feature to make tests pass
4. ⏳ Verify coverage ≥80%
5. ⏳ Create PR with clear description

### Documentation
- See `/specs/001-core-inventory/spec.md` for user stories
- See `/specs/001-core-inventory/plan.md` for technical architecture
- See `/specs/001-core-inventory/quickstart.md` for development workflow
- See `IMPLEMENTATION_SUMMARY.md` for current status

---

**Questions?** Check the quickstart.md or reach out to the team!

**Ready to start?** Pick a task from Phase 3 and follow the TDD workflow above. 🚀
