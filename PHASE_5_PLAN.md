# Phase 5 Implementation Plan: User Story 3 - Assign Item to Location

**Status**: Ready to Start  
**Duration**: 2 days  
**End Goal**: Users can create locations and assign items to them  
**Coverage Target**: ≥80% test coverage

---

## Phase 5 Overview

### User Story 3: "As a user, I want to organize my items by location"

**What This Phase Adds**:
- Location management (create, delete, view)
- Assign items to locations
- LocationPicker component for AddItemScreen
- LocationsScreen for managing locations
- Filter items by location (prepared for Phase 6)

### Phase 4 → Phase 5 Handoff

**Existing from Phase 4**:
- ✅ ItemDetailScreen (edit/delete functionality ready)
- ✅ HomeScreen (search working)
- ✅ Redux thunks, selectors (pattern established)
- ✅ Navigation structure in place

**New in Phase 5**:
- LocationPicker component (new)
- LocationsScreen (new)
- AddLocationScreen (new)
- locationSlice.ts with thunks (new)
- Location assignment workflow (new)

---

## Phase 5 Task Breakdown

### T031: Location Flow Integration Tests (1 hour)
**File**: `tests/integration/locationFlow.test.ts`

**Test Cases**:
1. Create location "Garage" → verify created
2. Create item and assign to location "Garage" → verify locationId set
3. Query items by location → verify only items for that location returned

**Technology**: Jest, itemService, locationService

**Dependencies**: locationService (T010), Item types

---

### T032: LocationPicker Component (2 hours)
**File**: `src/components/LocationPicker.tsx`

**Features**:
- Modal/Bottom Sheet displaying list of locations
- Each location shows: name + item count
- "Create New Location" button at bottom
- Tap to select location (closes modal, calls onSelect)
- Selected state indication
- Search/filter locations (optional enhancement)

**Props**:
```typescript
interface LocationPickerProps {
  onSelect: (locationId: string) => void;
  onCreateNew?: () => void;
  selected?: string; // locationId
  visible: boolean;
  onClose: () => void;
}
```

**UI Stack**:
- react-native-paper Modal or BottomSheet
- FlatList for locations
- Button for "Create New Location"

**Integration**:
- Dispatch loadLocationsAsync on mount
- Select from Redux: selectAllLocations, selectLoading
- Show loading spinner while locations loading

---

### T033: Integrate LocationPicker into AddItemScreen (1 hour)
**File**: `src/screens/AddItemScreen/index.tsx` (modify existing)

**Changes**:
- Add state: `selectedLocationId` (initially undefined)
- Add state: `showLocationPicker` (boolean)
- Add field in form: Location selector button
- Display selected location name if chosen
- In handleSave: pass `locationId: selectedLocationId` to createItem
- Handle onSelect from LocationPicker

**UI**:
- After description field, add Button that says "Select Location" or shows location name
- Tap opens LocationPicker modal
- Selected location displays with name

**Dependencies**: T032 (LocationPicker), locationSlice Redux

---

### T034: LocationsScreen (2 hours)
**File**: `src/screens/LocationsScreen/index.tsx`

**Features**:
- FlatList of all locations
- Each location card shows: name, item count, tap-to-filter indicator
- FAB button for "Add Location"
- Delete button with Alert.alert confirmation
- Long-press option (delete) on cards
- Pull-to-refresh support
- Empty state when no locations

**UI Stack**:
- FlatList rendering location cards
- Paper Card component for each location
- FAB button (+ icon)
- Alert.alert for delete confirmation

**Redux Integration**:
- Dispatch loadLocationsAsync on mount
- Select: selectAllLocations, selectLoading
- Dispatch deleteLocationAsync on delete
- Delete triggers refresh of locations list

**Navigation**:
- FAB tap → navigate to AddLocationScreen
- Card tap → (prepared for Phase 6) filter HomeScreen by location

---

### T035: AddLocationScreen (1 hour)
**File**: `src/screens/AddLocationScreen/index.tsx`

**Features**:
- TextInput for location name
- Optional photo picker (button "Add Photo")
- Save button
- Validation:
  - Location name required
  - Check for duplicate names (warn user)
- Success handling: navigate back to LocationsScreen

**UI**:
- TextInput (placeholder: "e.g., Garage, Bedroom")
- Button: "Add Photo" (optional, can skip)
- Preview of selected photo if added
- Save button
- Cancel button

**Redux Integration**:
- Dispatch createLocationAsync({ name, photo? })
- On success: navigate back
- On error: show Alert

**Dependencies**: locationService, imageService

---

### T036: Redux Location Management (1 hour)
**File**: `src/store/locationSlice.ts` (new)

**State Structure**:
```typescript
interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  selectedLocationId: string | null; // for filtering
}
```

**Thunks**:
1. `loadLocationsAsync(page: number)` - GET /locations?page=page
   - Returns: { locations: Location[], total: number }

2. `createLocationAsync({ name, photo? })` - POST /locations
   - Returns: created Location object
   - Updates state.locations with new location

3. `deleteLocationAsync(locationId: string)` - DELETE /locations/:id
   - Removes location from state.locations

4. `selectLocationAsync(locationId: string)` - Sets selectedLocationId
   - Used for filtering in HomeScreen

**Selectors**:
- `selectAllLocations`: All locations from state
- `selectLocationsLoading`: Loading state
- `selectLocationsError`: Error message
- `selectSelectedLocation`: Currently selected location for filtering
- `selectLocationById`: (locationId) => Location | undefined

**Tests**:
- Create location → verify in state
- Load locations → verify list
- Delete location → verify removed
- Select location → verify selectedLocationId set

---

## Implementation Flow (TDD)

**Order of Execution**:
1. **T031** - Write integration tests FIRST (define behavior)
2. **T032** - Create LocationPicker component
3. **T033** - Integrate LocationPicker into AddItemScreen
4. **T034** - Create LocationsScreen
5. **T035** - Create AddLocationScreen
6. **T036** - Add Redux location management + tests
7. **Validation** - Run tests, type-check, lint

**Parallel Tasks** (marked [P]):
- T031, T033, T034, T035 can run in parallel after T032 drafted
- But since this is solo, execute sequentially with verification

---

## Tech Stack for Phase 5

**Components**:
- react-native-paper: Modal, Card, Button, TextInput, FAB, Avatar
- FlatList: For location lists
- react-native-image-crop-picker: Optional photo selection

**Redux**:
- createAsyncThunk: For async operations
- createSlice: For reducers
- useSelector, useDispatch: For component integration

**Navigation**:
- navigation.navigate() to AddLocationScreen
- navigation.goBack() after save

**Services**:
- locationService (T010): createLocation, getAllLocations, deleteLocation, getLocation
- imageService (T019): selectImage, compressImage (for optional photo)

**Testing**:
- Jest with React Native
- @testing-library/react-native for component tests
- Redux mocking with configureStore

---

## File Checklist

**New Files to Create**:
- ✅ `tests/integration/locationFlow.test.ts`
- ✅ `src/components/LocationPicker.tsx`
- ✅ `src/screens/LocationsScreen/index.tsx`
- ✅ `src/screens/AddLocationScreen/index.tsx`
- ✅ `src/store/locationSlice.ts`
- ✅ `tests/unit/store/locationSlice.test.ts`

**Files to Modify**:
- ✅ `src/screens/AddItemScreen/index.tsx` - Add LocationPicker integration
- ✅ `src/navigation/RootNavigator.tsx` - Add LocationsScreen, AddLocationScreen to navigation stack
- ✅ `specs/001-core-inventory/tasks.md` - Update task status

---

## Success Criteria

**Functional**:
- ✅ User can create locations with unique names
- ✅ User can view list of all locations
- ✅ User can assign items to locations
- ✅ User can delete locations
- ✅ Item detail screen shows location if assigned
- ✅ LocationPicker appears in AddItemScreen

**Code Quality**:
- ✅ All new code passes TypeScript strict mode
- ✅ No ESLint warnings
- ✅ ≥80% test coverage for Phase 5
- ✅ Redux patterns match Phase 1-4

**Performance**:
- ✅ LocationsScreen loads < 200ms with 100+ locations
- ✅ LocationPicker renders < 500ms with 50+ locations
- ✅ No memory leaks on component unmount

---

## Known Constraints & Decisions

1. **No circular dependencies**: Locations don't reference items directly
2. **Optional photo**: Location photo is optional (not required for MVP)
3. **Single location per item**: Items can only be assigned to one location (not multiple)
4. **Default location**: No default location created automatically
5. **Deletion behavior**: Deleting location keeps items (just removes locationId)

---

## Debugging Checklist

If tests fail during Phase 5:

- ✅ Verify locationService exists and works (T010 from Phase 2)
- ✅ Check Redux store initialized with locationSlice
- ✅ Verify navigation stack includes new screens
- ✅ Check imageService for optional photo handling
- ✅ Verify localStorage/database persistence for locations
- ✅ Check TypeScript types match Location interface

---

## Estimated Timeline

- T031 (tests): 1 hour
- T032 (LocationPicker): 2 hours
- T033 (AddItemScreen integration): 1 hour
- T034 (LocationsScreen): 2 hours
- T035 (AddLocationScreen): 1 hour
- T036 (Redux): 1 hour
- **Total**: 8 hours ≈ 1 day focused work

**With debugging/validation**: +1-2 hours
**Total realistic**: 2 days

---

## Next Phase Preview (Phase 6)

**Goal**: Search items by location  
**Tasks**:
- T037: Add location filter button to HomeScreen
- T038: Implement getItemsByLocation service integration

After Phase 5 complete, Phase 6 should take ~1 day.

---

**Ready to Start?** Yes ✅ All prerequisites met (Phase 4 complete, types ready, services ready)
