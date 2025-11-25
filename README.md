# FindMyStuff React Native Project - Setup Guide

> 🚀 **STATUS**: ✅ **MVP v0.1.0 READY FOR RELEASE** | 4/4 User Stories Complete | 100+ Tests | Phase 8 Release Ready
> 
> See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current release status | [PHASE_8_READY.md](./PHASE_8_READY.md) for release checklist

## Project Overview

**FindMyStuff** is an AI-powered inventory and location tracking mobile app built with React Native. The core MVP helps users:
1. Add items to inventory with photos
2. View all items in a searchable list
3. Assign items to storage locations
4. Find items by searching or browsing locations

**Target Platforms**: iOS 14+ and Android API 21+

## Technology Stack

### Core Framework
- **React Native 0.73+**: Cross-platform mobile framework
- **TypeScript 5.0+**: Strict type safety throughout
- **React Navigation 6.x**: Navigation between screens

### UI Components
- **React Native Paper 5.x**: Material Design 3 components ensuring consistent UX across iOS/Android
- **React Native Vector Icons**: Icon support

### State Management
- **Redux Toolkit**: Global state management (inventory, locations, filters)
- **Redux Thunk**: Async operations (database queries)

### Database
- **react-native-sqlite-storage**: Local SQLite for offline-first data persistence
- **sqlite3**: SQL query engine

### Testing
- **Jest 29+**: Unit and integration tests
- **Detox 20+**: E2E testing for React Native
- **@testing-library/react-native**: Component testing utilities

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Babel**: JavaScript transpilation

## Prerequisites

Before starting development, ensure you have:

1. **Node.js 18+** and npm/yarn
2. **React Native CLI**: `npm install -g react-native`
3. **Xcode 14+** (for iOS development on Mac)
4. **Android Studio 2022+** (for Android development)
5. **Git** for version control

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url> FindMyStuff
cd FindMyStuff
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Native Dependencies

```bash
# For iOS
cd ios
pod install
cd ..

# For Android - handled automatically by gradle
```

### 4. Setup Environment

Create `.env` file in project root:

```env
# Database configuration
DB_NAME=findmystuff
DB_LOCATION=default

# App configuration
LOG_LEVEL=info
ENABLE_REDUX_DEVTOOLS=true
```

### 5. Run on iOS

```bash
npm run ios
# or with specific device
npm run ios -- --simulator="iPhone 15"
```

### 6. Run on Android

```bash
npm run android
# or specify device
npm run android -- --deviceId=emulator-5554
```

## Project Structure Overview

```
src/
├── components/      # Reusable UI components (Material Design)
├── screens/         # Feature screens (Add Item, Home, Locations, etc.)
├── services/        # Business logic (Item/Location CRUD, Database, Image processing)
├── store/           # Redux state slices and selectors
├── types/           # TypeScript interfaces
├── navigation/      # React Navigation setup
└── utils/           # Validators, formatters, error handling

tests/
├── unit/            # Component and function tests
├── integration/     # Multi-component workflow tests
└── e2e/             # Full user journey tests
```

## Development Workflow

### Code Quality Standards (Per Constitution Principle II)

All code MUST follow these standards:

1. **TypeScript**: Strict mode enabled (`strict: true` in tsconfig.json)
   - No implicit `any` types
   - All function parameters must be typed
   - All Redux store items must be properly typed

2. **Formatting**: Prettier automatically formats on save
   - Max line length: 100 characters
   - Use semicolons
   - Single quotes for strings

3. **Linting**: ESLint enforces code quality
   - Run before commit: `npm run lint`
   - Fix issues: `npm run lint -- --fix`

4. **Testing** (Per Constitution Principle I - Test-First)
   - Minimum 80% code coverage required
   - Write tests FIRST, then implementation
   - Run tests: `npm run test`
   - Run tests with coverage: `npm run test -- --coverage`

### Commit Workflow

```bash
# 1. Create feature branch
git checkout -b 001-core-inventory

# 2. Make changes following code quality standards
npm run lint -- --fix  # Fix formatting/linting

# 3. Write and run tests (BEFORE implementation code!)
npm run test -- src/services/itemService.test.ts

# 4. Add changes
git add .

# 5. Commit with descriptive message
git commit -m "feat(itemService): implement add/delete item operations with tests"

# 6. Run full test suite before push
npm run test

# 7. Push to remote
git push origin 001-core-inventory
```

## Testing Standards (Constitutional Requirement)

### Unit Tests
- Test individual functions/services in isolation
- Location: `tests/unit/[feature]/[fileName].test.ts`
- Example: `tests/unit/services/itemService.test.ts`

### Integration Tests
- Test multiple components working together
- Location: `tests/integration/[featureName].test.ts`
- Example: `tests/integration/itemWorkflow.test.ts`

### E2E Tests
- Test complete user journeys with Detox
- Location: `tests/e2e/[featureName].e2e.ts`
- Example: `tests/e2e/addItemFlow.e2e.ts`

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode (rerun on changes)
npm run test -- --watch

# Run specific test file
npm run test -- tests/unit/services/itemService.test.ts

# Run E2E tests
npm run e2e
```

## Common Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Lint and fix code
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check
npm run type-check

# Build for production (iOS)
npm run build:ios

# Build for production (Android)
npm run build:android
```

## Performance Targets (Constitutional Requirement)

The app MUST meet these performance standards:

| Metric | Target | Testing Method |
|--------|--------|-----------------|
| App initialization | < 3 seconds | Measure time from app launch to home screen render |
| Screen navigation | < 300ms | React Native DevTools: Navigators tab |
| List rendering (20 items) | < 300ms | FlatList render time measurement |
| Search response | < 500ms | From keystroke to filtered results display |
| Memory footprint | < 150MB | Device Performance monitor, typical usage with 1,000 items |

## Accessibility Standards (Constitutional Requirement)

All UI components MUST meet WCAG 2.1 Level AA minimum:

- [ ] All buttons have accessible labels (`accessibilityLabel`)
- [ ] All images have alt text (`accessibilityLabel` on Image components)
- [ ] Touch targets are at least 48x48 points
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] No functionality depends on color alone
- [ ] Screen readers work with all interactive elements

## Git Branching Strategy

```
master (stable release)
├── develop (integration branch)
│   ├── 001-core-inventory (feature branch)
│   ├── 002-ai-search (feature branch)
│   └── ...
└── hotfix/xyz (urgent fixes)
```

Branch naming: `[ISSUE_NUMBER]-[kebab-case-description]`
- Example: `001-core-inventory`, `002-ai-image-recognition`

## Troubleshooting

### iOS Build Issues

```bash
# Clear Xcode build cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reinstall pods
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install && cd ..

# Clean and rebuild
npm run ios -- --clean
```

### Android Build Issues

```bash
# Clear gradle cache
rm -rf android/.gradle

# Clean and rebuild
cd android && ./gradlew clean && cd ..
npm run android -- --clean
```

### TypeScript/ESLint Errors

```bash
# Update TypeScript definitions
npm install --save-dev @types/react-native@latest

# Fix ESLint issues automatically
npm run lint -- --fix
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Understand the architecture**: Read the codebase in `src/` directory
3. **Run the app**: `npm run ios` or `npm run android`
4. **Write your first test**: Create a simple unit test and watch it fail/pass
5. **Start feature development**: Pick a user story from tasks.md and implement it

---

**Questions?** Check the specific feature guide in `specs/001-core-inventory/` or the architecture documentation in `README.md`.

