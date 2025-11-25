# Testing Guide - FindMyStuff

This guide covers the testing strategy and approach used in FindMyStuff.

## Testing Overview

FindMyStuff follows a **Test-Driven Development (TDD)** approach:
1. Write failing tests first
2. Implement feature to make tests pass
3. Refactor while keeping tests green

## Test Coverage Target

- **Overall Coverage**: ≥ 80%
- **Services**: ≥ 90%
- **Components**: ≥ 85%
- **Utilities**: ≥ 90%

## Test Types

### 1. Unit Tests

Unit tests verify individual functions and components in isolation.

**Location**: `tests/unit/`

**Example**: Testing itemService.createItem()

```typescript
describe('itemService.createItem', () => {
  it('should create item with required name', async () => {
    const item = await createItem({ name: 'Camera' });
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Camera');
  });

  it('should throw ValidationError if name is empty', async () => {
    await expect(createItem({ name: '' })).rejects.toThrow(ValidationError);
  });
});
```

**Coverage**:
- Item service: 8+ tests
- Location service: 10+ tests
- Image service: 5+ tests
- Validators: 17+ tests
- Formatters: 10+ tests
- Error handling: 8+ tests

### 2. Integration Tests

Integration tests verify workflows combining multiple components.

**Location**: `tests/integration/`

**Example**: Add item → View in list → Search → Find item

```typescript
describe('Add Item Workflow', () => {
  it('should add item and appear in list', async () => {
    // 1. Create item
    const newItem = await createItem({ name: 'Camera' });

    // 2. Get list
    const { items } = await getAllItems();

    // 3. Verify in list
    expect(items).toContainEqual(expect.objectContaining({ 
      id: newItem.id, 
      name: 'Camera' 
    }));
  });
});
```

**Scenarios**:
- Add item to inventory flow (6 tests)
- Search and find items (6 tests)
- Location assignment workflow (6 tests)

### 3. Component Tests

Component tests verify React components render correctly and handle user interactions.

**Location**: `tests/unit/screens/` and `tests/unit/components/`

**Example**: Testing AddItemScreen form

```typescript
describe('AddItemScreen', () => {
  it('should render form with name and description fields', () => {
    render(
      <Provider store={store}>
        <AddItemScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(screen.getByText(/Item Name/i)).toBeTruthy();
    expect(screen.getByText(/Description/i)).toBeTruthy();
  });

  it('should show error when name is empty', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AddItemScreen navigation={mockNavigation} />
      </Provider>
    );

    fireEvent.press(getByText(/Save Item/i));

    await waitFor(() => {
      expect(getByText(/Invalid/i)).toBeTruthy();
    });
  });
});
```

### 4. End-to-End (E2E) Tests

E2E tests verify complete user journeys in a real app environment.

**Location**: `tests/e2e/`

**Tool**: Detox (iOS simulator)

**Example**: Complete add item workflow

```typescript
describe('Add Item E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should add item with photo', async () => {
    // Tap FAB button
    await element(by.id('fab-add-item')).multiTap();

    // Enter item name
    await element(by.id('input-item-name')).typeText('Camera');

    // Select photo
    await element(by.id('btn-select-photo')).multiTap();

    // Save item
    await element(by.id('btn-save-item')).multiTap();

    // Verify item in list
    await expect(element(by.text('Camera'))).toBeVisible();
  });
});
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- tests/unit/services/itemService.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Build E2E framework (first time only)
npm run e2e:build

# Run E2E tests on iOS
npm run e2e
```

## Test Data & Mocks

### Mock Database

Tests use an in-memory SQLite database:

```typescript
beforeEach(async () => {
  // Initialize test database
  await initTestDatabase();
});

afterEach(async () => {
  // Clean up after each test
  await cleanupTestDatabase();
});
```

### Mock Redux Store

```typescript
import { store } from '@store/index';

render(
  <Provider store={store}>
    <YourComponent />
  </Provider>
);
```

### Mock Navigation

```typescript
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

render(<HomeScreen navigation={mockNavigation} />);
```

## Coverage Report

Generate coverage report:

```bash
npm run test:coverage
```

Coverage output shows:
- Lines covered (%)
- Branches covered (%)
- Functions covered (%)
- Statements covered (%)

## Debugging Tests

### Debug Single Test

```bash
npm run test -- --testNamePattern="should add item"
```

### Debug with Debugger

```bash
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/services/itemService.test.ts
```

Then open `chrome://inspect` in Chrome.

### Verbose Output

```bash
npm run test -- --verbose
```

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should create item', async () => {
  // Arrange
  const data = { name: 'Camera' };

  // Act
  const result = await createItem(data);

  // Assert
  expect(result.name).toBe('Camera');
});
```

### 2. Test One Thing

Each test should verify one behavior:

```typescript
// ❌ Bad: Tests multiple things
it('should create, update, and delete items', async () => {
  // ...
});

// ✅ Good: Tests one behavior
it('should create item with valid name', async () => {
  // ...
});
```

### 3. Use Descriptive Names

```typescript
// ❌ Bad
it('test 1', () => { /* ... */ });

// ✅ Good
it('should throw ValidationError if name exceeds 100 characters', () => {
  // ...
});
```

### 4. Mock External Dependencies

```typescript
jest.mock('@services/imageService');

(imageService.compressImage as jest.Mock).mockResolvedValue(
  'compressed-base64-string'
);
```

## Test Maintenance

### Keep Tests Updated

When features change:
1. Update existing tests
2. Add new tests for new behavior
3. Remove tests for removed features

### Avoid Flaky Tests

Flaky tests fail intermittently. To avoid:
- Don't rely on timing (`setTimeout`)
- Use `waitFor` for async operations
- Mock time-dependent functions
- Use `act()` for state updates

### Common Issues

**Issue**: Test timeout  
**Solution**: Increase timeout or fix async operations

```typescript
it('should load items', async () => {
  // ...
}, 10000); // 10 second timeout
```

**Issue**: Mock not working  
**Solution**: Ensure mock is set up before import

```typescript
jest.mock('@services/itemService'); // Before import
import * as itemService from '@services/itemService';
```

**Issue**: Redux state not updating  
**Solution**: Use `store.dispatch()` directly

```typescript
store.dispatch(createItemAsync({ name: 'Camera' }));
```

## Continuous Integration

Tests run automatically on:
- Every commit (git pre-commit hook)
- Every pull request (CI pipeline)
- Before release builds

Minimum requirements:
- ✅ All tests pass
- ✅ Coverage ≥ 80%
- ✅ No type errors
- ✅ No lint errors

## Performance Testing

### Measure Query Performance

```typescript
it('should search 10,000 items in < 500ms', async () => {
  // Setup: Create 10,000 items
  const start = performance.now();
  const { items } = await searchItems('test');
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(500);
  expect(items.length).toBeGreaterThan(0);
});
```

### Memory Profiling

Use React Native Profiler:
```
1. Open React Native debugger
2. Go to React Profiler tab
3. Record interaction
4. Check memory usage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react-native)
- [Detox Documentation](https://detoxe2e.com/)
- [Redux Testing](https://redux.js.org/usage/writing-tests)

## Questions?

For testing questions:
- Check existing tests as examples
- Review test output for error details
- Check Jest documentation
- Ask in team discussions
