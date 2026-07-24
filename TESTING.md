# FEO Music Player - Testing Guide

## Frontend Tests (Vitest)

Frontend tests are located in `apps/web/tests/` and use **Vitest** with React Testing Library.

### Running Tests

```bash
cd apps/web

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test playerStore.test.ts
```

### Test Coverage

- **playerStore.test.ts** - Player state management
  - Play/Pause controls
  - Next/Previous track navigation
  - Repeat modes (off, one, all)
  - Shuffle functionality
  - Queue management
  - Volume control
  - Progress tracking

- **api.test.ts** - API client methods
  - Recommendations API
  - AI suggestions endpoint
  - Skip tracking

## Backend Tests (Mocha + Chai)

Backend tests are located in `apps/backend/tests/` and use **Mocha** with **Chai** assertions.

### Running Tests

```bash
cd apps/backend

# Install dependencies first
npm install

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/llmService.test.ts
```

### Test Coverage

- **llmService.test.ts** - LLM API integration
  - Recommendation generation
  - AI suggestion generation
  - API error handling
  - Missing credentials handling

- **recommendationService.test.ts** - Recommendation logic
  - Cache management
  - Track deduplication
  - Recommendation prioritization
  - Fallback strategies

- **recommendationController.test.ts** - API endpoint validation
  - Parameter validation
  - Query parsing
  - Response formatting
  - Fallback suggestions

## Player Controls Implementation

All player controls are now fully implemented:

### Controls
- **Play/Pause** - Toggle playback (status: ✓)
- **Next** - Skip to next track (status: ✓)
- **Previous** - Go to previous track (status: ✓)
- **Repeat** - Cycle through repeat modes: off → one → all (status: ✓)
- **Shuffle** - Random queue order (status: ✓)
- **Auto-play** - AI suggestions for next track (status: ✓)

### Next Track Features
- Shows upcoming track from manual queue
- Displays AI-generated next track when auto-play enabled
- Shows track metadata (title, artist)
- Indicates if suggestion is AI-generated
- Updates in real-time as queue changes

## Auto-play Implementation

When a track finishes:
1. `onEnded` event triggers `next()` action
2. If queue has more tracks → play next track
3. If queue empty and auto-play ON:
   - Fetch AI recommendations via LLM
   - Add to queue automatically
   - Start playing immediately
4. If repeat mode is:
   - `off` - Stop playback after last track
   - `one` - Replay current track
   - `all` - Loop back to first track

## Test Structure

All tests follow this pattern:

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Adding New Tests

When adding new features:

1. **Frontend** - Add test in `apps/web/tests/`
2. **Backend** - Add test in `apps/backend/tests/`
3. Follow existing patterns
4. Ensure tests are isolated and don't depend on external services
5. Use mocking for API calls

## CI/CD Integration

To add tests to CI/CD pipeline:

```yaml
# In your workflow file
- name: Run Backend Tests
  run: cd apps/backend && npm install && npm test

- name: Run Frontend Tests
  run: cd apps/web && npm install && npm test
```

## Debugging Tests

### Frontend
```bash
# Run with debugging info
DEBUG=* npm test

# Run single test file with watch
npm test playerStore.test.ts -- --watch
```

### Backend
```bash
# Run with debugging
DEBUG=* npm test

# Run with verbose output
npm test -- --reporter spec
```
