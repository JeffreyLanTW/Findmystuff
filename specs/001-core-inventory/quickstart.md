# Quick Start Guide: Core Inventory Development

**Phase**: Phase 1 Design  
**Date**: 2025-11-24  
**Audience**: React Native developers starting on FindMyStuff

## 5-Minute Setup

### 1. Clone & Install

```bash
# Clone repository (if needed)
git clone <repo-url> FindMyStuff
cd FindMyStuff

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### 2. Verify Setup

```bash
# Type checking
npm run type-check

# Lint check
npm run lint

# Run tests
npm run test
```

### 3. Run on Simulator

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure Quick Reference

```
src/
├── types/              # TypeScript interfaces (Item, Location)
├── services/           # Business logic
│   ├── database.ts     # SQLite setup
│   ├── itemService.ts  # Item CRUD
│   └── locationService.ts
├── store/              # Redux state
│   ├── itemSlice.ts
│   └── locationSlice.ts
├── screens/            # Feature screens
│   ├── HomeScreen/     # Inventory list
│   ├── AddItemScreen/  # Add/edit item form
│   └── LocationsScreen/
├── components/         # Reusable UI components
├── utils/              # Helpers (validators, formatters)
└── App.tsx             # Root component
```

## Development Workflow

### Starting a New Feature (e.g., User Story 1 - Add Item)

#### 1. Create Feature Branch

```bash
git checkout -b 001-add-item-feature
```

#### 2. Write Tests First (TDD)

Create `tests/unit/services/itemService.test.ts`:

```typescript
describe('itemService', () => {
  describe('createItem', () => {
    it('should create an item with name and optional photo', async () => {
      const item = await createItem({
        name: 'Camera',
        description: 'Canon EOS',
        photo: 'base64data...',
      });

      expect(item.id).toBeDefined();
      expect(item.name).toBe('Camera');
      expect(item.createdAt).toBeDefined();
    });

    it('should throw ValidationError if name is empty', async () => {
      await expect(createItem({ name: '' })).rejects.toThrow(ValidationError);
    });
  });
});
```

Run and verify test fails:

```bash
npm run test -- tests/unit/services/itemService.test.ts
```

#### 3. Implement Feature

Now implement `itemService.ts` to make test pass (already provided).

#### 4. Write Integration Test

Create `tests/integration/itemWorkflow.test.ts`:

```typescript
describe('Item Add to List Workflow', () => {
  it('should add item and appear in inventory list', async () => {
    // 1. Add item
    const item = await createItem({ name: 'Laptop' });

    // 2. Get all items
    const { items } = await getAllItems();

    // 3. Verify item in list
    expect(items).toContainEqual(expect.objectContaining({ name: 'Laptop' }));
  });
});
```

#### 5. Build UI Component

Create `src/screens/AddItemScreen/index.tsx`:

```typescript
export const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    try {
      const validation = validateItemName(name);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      await itemService.createItem({ name });
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Item name"
        value={name}
        onChangeText={setName}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={handleSave} title="Save" />
    </View>
  );
};
```

#### 6. Run All Tests

```bash
npm run test -- --coverage

# Should see:
# ✓ Unit tests pass
# ✓ Integration tests pass
# ✓ Coverage ≥ 80%
```

#### 7. Commit

```bash
git add .
git commit -m "feat(items): implement add item functionality with tests

- Create itemService with createItem operation
- Add unit tests for validation
- Add integration test for add-to-list flow
- Build AddItemScreen UI component
- Achieve 85% test coverage"
```

#### 8. Create Pull Request

```bash
git push origin 001-add-item-feature
# Then create PR on GitHub for review
```

## Key Code Patterns

### Service Pattern (Business Logic)

```typescript
// src/services/itemService.ts
export const createItem = async (request: CreateItemRequest): Promise<Item> => {
  // 1. Validate
  const validation = validateItemName(request.name);
  if (!validation.valid) throw new ValidationError(validation.error);

  // 2. Prepare data
  const item: Item = {
    id: uuidv4(),
    name: request.name.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 3. Persist to database
  await executeCommand(INSERT_SQL, [item.id, item.name, ...]);

  return item;
};
```

### React Component Pattern

```typescript
// src/screens/HomeScreen/index.tsx
const HomeScreen: React.FC = ({ navigation }) => {
  const dispatch = useDispatch();
  const items = useSelector(selectItemList);
  const loading = useSelector(selectLoading);

  React.useEffect(() => {
    // Load items on mount
    dispatch(loadItemsAsync(1));
  }, [dispatch]);

  return (
    <View>
      {loading && <LoadingSpinner />}
      {items.length === 0 && <EmptyState />}
      <FlatList
        data={items}
        renderItem={({ item }) => <ItemCard item={item} />}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => dispatch(loadItemsAsync(1))}
      />
    </View>
  );
};
```

### Redux Pattern

```typescript
// src/store/itemSlice.ts
const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadItemsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadItemsAsync.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.loading = false;
      });
  },
});

export const loadItemsAsync = createAsyncThunk(
  'items/loadItems',
  async (page: number) => {
    return itemService.getAllItems(page);
  }
);
```

## Testing Checklist

- [ ] Unit tests written FIRST, then implementation (TDD)
- [ ] All tests pass locally: `npm run test`
- [ ] Test coverage ≥ 80%: `npm run test -- --coverage`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Manual testing on iOS simulator
- [ ] Manual testing on Android simulator

## Performance Testing

### Measure List Rendering Time

```bash
# Use React DevTools Profiler
npm run ios

# In app, open React DevTools Profiler
# Perform action (scroll, add item)
# Check render time should be < 300ms
```

### Measure Search Performance

```typescript
// In search handler
const start = performance.now();
const results = await searchItems(query);
const duration = performance.now() - start;
console.log(`Search took ${duration}ms`); // Should be < 500ms
```

## Debugging Tips

### Redux DevTools

```bash
# Redux DevTools will open automatically
# You can see all state changes and time-travel debug

# Open in browser
open "http://localhost:8081/?debugger-ui"
```

### Database Query Debugging

```bash
# Access SQLite database directly
sqlite3 findmystuff.db

# List all items
SELECT * FROM items LIMIT 10;

# Check indexes
PRAGMA index_list(items);

# Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM items WHERE LOWER(name) LIKE '%camera%';
```

### React Native Debugger

```bash
# Start debugger
npm start

# Press 'd' in terminal to open debugger
# You'll see console logs, network requests, Redux state
```

## Common Issues & Solutions

### Issue: "Database not initialized"

**Solution**:
```typescript
// Make sure database is initialized in App.tsx
useEffect(() => {
  initDatabase().catch(console.error);
}, []);
```

### Issue: TypeScript error "no implicit any"

**Solution**: Add explicit types
```typescript
// ❌ Bad
const item = { name: 'Camera' };

// ✅ Good
const item: Item = { name: 'Camera', id: uuidv4(), createdAt: Date.now(), updatedAt: Date.now() };
```

### Issue: Tests fail with "Cannot find module"

**Solution**: Check tsconfig paths
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@types/*": ["types/*"],
      "@services/*": ["services/*"]
    }
  }
}
```

### Issue: Image upload very slow

**Solution**: Check image compression
```typescript
// Measure compression time
const start = Date.now();
const compressed = await compressImage(imagePath);
console.log(`Compression took ${Date.now() - start}ms`); // Should be < 2000ms
```

## Next Steps

1. **Pick a user story** from `specs/001-core-inventory/spec.md`
2. **Write failing tests** for that story
3. **Implement feature** to make tests pass
4. **Test locally** on both iOS and Android
5. **Create PR** with clear description
6. **Get code review** (must pass 80%+ coverage check)
7. **Merge** to develop branch

## Useful Commands

```bash
npm run ios               # Run on iOS simulator
npm run android           # Run on Android simulator
npm start                 # Start dev server
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run lint             # Check code quality
npm run lint -- --fix    # Auto-fix issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript check
npm run e2e              # Run E2E tests
```

---

**Ready to start coding?** Pick a task from tasks.md and follow the TDD workflow above!

