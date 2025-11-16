# Metadata Editor Test Suite

Comprehensive test coverage for the Image Metadata Editor feature including PNG and JPEG EXIF metadata handling.

## Test Structure

```
tests/
├── unit/
│   └── utils/
│       ├── pngMetadataEditor.spec.js      # PNG metadata utilities (27 tests)
│       ├── metadataEditor.spec.js         # JPEG EXIF utilities (10 tests)
│       └── metadataManager.spec.js        # Format abstraction layer (51 tests)
├── e2e/
│   ├── metadata-editor.spec.js            # End-to-end workflow tests
│   └── fixtures/
│       ├── test-png.png                   # Test PNG with metadata
│       ├── test-jpeg.jpg                  # Test JPEG with EXIF
│       └── generate-test-images.js        # Script to regenerate test images
└── METADATA-TESTS-README.md              # This file
```

## Unit Tests

### PNG Metadata Tests (`pngMetadataEditor.spec.js`)

**27 tests** covering PNG tEXt/iTXt chunk manipulation:

#### Load Metadata (7 tests)
- ✅ Load metadata from PNG with text chunks
- ✅ Handle PNG without metadata
- ✅ Organize metadata by sections
- ✅ Mark populated fields correctly
- ✅ Throw error for invalid PNG data
- ✅ Handle data URI prefix
- ✅ Include field metadata (icons, descriptions, editability)

#### Statistics (3 tests)
- ✅ Calculate statistics for metadata
- ✅ Handle empty metadata
- ✅ Count sections correctly

#### Edit Fields (5 tests)
- ✅ Edit existing metadata field
- ✅ Add new metadata field if not present
- ✅ Handle empty string as value
- ✅ Preserve other metadata fields
- ✅ Handle special characters in values

#### Remove Fields (3 tests)
- ✅ Remove existing metadata field
- ✅ Preserve other metadata fields
- ✅ Handle removing non-existent field gracefully

#### Remove All Metadata (3 tests)
- ✅ Remove all text metadata chunks
- ✅ Preserve image data
- ✅ Handle PNG without metadata

#### Custom Fields (3 tests)
- ✅ Add custom field to PNG
- ✅ Preserve existing metadata
- ✅ Handle special characters in custom values

#### Edge Cases (3 tests)
- ✅ Handle very long field values (10,000 characters)
- ✅ Handle multiple edit operations in sequence
- ✅ Handle rapid add/remove operations

### JPEG EXIF Tests (`metadataEditor.spec.js`)

**10 tests** focusing on API contracts and error handling:

#### Load EXIF Data (4 tests)
- ✅ Throw error for invalid JPEG data
- ✅ Throw error for non-JPEG data
- ✅ Handle data URI prefix
- ✅ Return organized metadata structure

#### Statistics (3 tests)
- ✅ Handle null metadata
- ✅ Calculate stats for valid metadata structure
- ✅ Handle empty sections

#### API Contracts (3 tests)
- ✅ Export required functions
- ✅ loadExifData returns Promise
- ✅ getMetadataStats returns stats object

> **Note**: Full JPEG EXIF integration tests with real binary manipulation are covered in E2E tests due to the complexity of programmatically generating valid JPEG+EXIF files.

### Metadata Manager Tests (`metadataManager.spec.js`)

**51 tests** covering the format abstraction layer:

#### Image Format Detection (19 tests)
- ✅ Detect PNG from file extension
- ✅ Detect JPEG from .jpg/.jpeg extensions
- ✅ Detect formats from MIME types
- ✅ Detect formats from magic bytes
- ✅ Handle edge cases (empty filenames, multiple dots, etc.)
- ✅ Return UNKNOWN for unsupported formats

#### File Extensions (4 tests)
- ✅ Return correct extensions for each format
- ✅ Handle unknown formats

#### MIME Types (4 tests)
- ✅ Return correct MIME types for each format
- ✅ Handle unknown formats

#### Format-Specific Operations (12 tests)
- ✅ Throw errors for unsupported formats in all operations
- ✅ Validate custom field structures for PNG/JPEG

#### Statistics (4 tests)
- ✅ Return zero stats for unknown formats
- ✅ Handle null metadata
- ✅ Calculate stats for valid metadata structures

#### Integration Scenarios (4 tests)
- ✅ Handle complete workflow: detect > load > edit > save
- ✅ Maintain format consistency

#### Constants (4 tests)
- ✅ Define all format constants correctly
- ✅ Have exactly three format types

## E2E Tests

### Metadata Editor Workflow (`metadata-editor.spec.js`)

Comprehensive end-to-end tests covering:

#### Initial Page Load
- Page title and description display
- Upload instructions
- File input configuration

#### File Upload and Detection
- Accept JPEG files
- Accept PNG files
- Show file preview
- Display file information
- Clear metadata when file is cleared

#### Metadata Display
- Display categories list
- Allow category selection
- Show metadata fields
- Display field counts
- Distinguish populated vs empty fields
- Show statistics

#### Metadata Editing
- Open edit dialog
- Edit field values
- Cancel edits
- Track edit count
- Show warnings for sensitive fields

#### Metadata Removal
- Remove all metadata button
- Confirmation dialogs
- Remove individual fields

#### Custom Fields
- Add custom field button (PNG)
- Custom field dialog

#### Download Functionality
- Download button visibility
- Download modified images
- Proper filenames

#### Image Preview
- Expand preview on click
- Close expanded preview
- Show modified badge

#### Accessibility
- ARIA labels on buttons
- Keyboard navigation

#### Error Handling
- Handle corrupted images
- Handle network errors gracefully

## Test Fixtures

### Generated Test Images

Test images are programmatically generated to ensure consistency:

```bash
cd tests/e2e/fixtures
node generate-test-images.js
```

#### test-png.png (144 bytes)
- Minimal valid 16x16 PNG
- Includes tEXt chunks: "Title" and "Author"
- Used for PNG metadata manipulation tests

#### test-jpeg.jpg (258 bytes)
- Minimal valid 1x1 JPEG
- Includes EXIF data: Make, Model, DateTimeOriginal
- Used for JPEG EXIF manipulation tests

### Regenerating Fixtures

If test images need to be regenerated:

```bash
npm run test:fixtures  # or
cd tests/e2e/fixtures && node generate-test-images.js
```

## Running Tests

### All Metadata Tests
```bash
npm test -- tests/unit/utils/metadata --run
npm test -- tests/e2e/metadata-editor.spec.js
```

### Individual Test Files
```bash
# PNG unit tests
npm test -- tests/unit/utils/pngMetadataEditor.spec.js --run

# JPEG unit tests
npm test -- tests/unit/utils/metadataEditor.spec.js --run

# Manager unit tests
npm test -- tests/unit/utils/metadataManager.spec.js --run

# E2E tests
npm run test:e2e -- metadata-editor.spec.js
```

### Watch Mode
```bash
npm test -- tests/unit/utils/metadata
```

### Coverage
```bash
npm run test:coverage -- tests/unit/utils/metadata
```

## Coverage Summary

- **Total Unit Tests**: 88
- **PNG Metadata**: 27 tests
- **JPEG EXIF**: 10 tests
- **Format Manager**: 51 tests
- **E2E Tests**: Comprehensive workflow coverage

### Coverage Areas

✅ **Format Detection**: File extensions, MIME types, magic bytes
✅ **PNG Metadata**: Read, edit, remove text chunks (tEXt/iTXt)
✅ **JPEG EXIF**: API contracts, error handling
✅ **Statistics**: Field counting, population tracking
✅ **Custom Fields**: Add/remove custom metadata
✅ **Edge Cases**: Long values, rapid operations, special characters
✅ **Error Handling**: Invalid data, corrupt files, unsupported formats
✅ **User Workflows**: Upload, view, edit, download

## Test Patterns Used

### Unit Test Patterns
1. **Minimal Test Data**: Create smallest valid images for fast tests
2. **API Contracts**: Test function signatures and return types
3. **Error Cases First**: Validate error handling before happy paths
4. **Edge Case Coverage**: Long values, rapid operations, special characters

### E2E Test Patterns
1. **Page Object Pattern**: Locators for reusable selectors
2. **Helper Functions**: Centralized common operations
3. **Wait Strategies**: Explicit waits for async operations
4. **Flexible Assertions**: Handle various UI states gracefully

## Coding Standards

Tests follow the project's coding standards:

- **Naming**: Descriptive test names using "should" pattern
- **Organization**: Group by feature/functionality
- **Comments**: Explain why, not what
- **Error Messages**: Clear, actionable messages
- **DRY**: Helper functions for common operations

## Integration with CI/CD

These tests are designed to run in CI/CD pipelines:

- **Fast Execution**: Unit tests < 1 second
- **Isolated**: No external dependencies
- **Deterministic**: Consistent results
- **Generated Fixtures**: No binary files in git (except minimal test images)

## Future Enhancements

Potential test improvements:

- [ ] Visual regression testing for metadata display
- [ ] Performance benchmarks for large files
- [ ] Accessibility audit integration
- [ ] Cross-browser E2E tests
- [ ] Property-based testing for metadata values
- [ ] Snapshot testing for UI components

## Troubleshooting

### Tests Fail After Codebase Changes

1. **Check imports**: Ensure exported functions match
2. **Review error messages**: Tests are designed to fail clearly
3. **Regenerate fixtures**: `node tests/e2e/fixtures/generate-test-images.js`
4. **Check dependencies**: Verify exifr, piexifjs, png-metadata versions

### E2E Tests Flaky

1. **Increase wait times**: Network/processing delays
2. **Check selectors**: UI changes may break selectors
3. **Run in headed mode**: `npm run test:e2e:debug`
4. **Check fixtures**: Ensure test images are valid

### PNG Tests Fail

- Verify `exifr` can parse PNG tEXt chunks
- Check CRC32 calculation in test helpers
- Ensure PNG structure follows specification

### JPEG Tests Fail

- JPEG tests focus on API contracts, not full binary manipulation
- For detailed JPEG testing, see E2E tests with real images
- Verify `piexifjs` compatibility

## Contributing

When adding new metadata features:

1. **Add unit tests first** (TDD approach)
2. **Create minimal test data** (don't use large real images)
3. **Test error cases** (invalid input, edge cases)
4. **Add E2E tests** for user-facing workflows
5. **Update this README** with new test coverage

---

**Last Updated**: 2025-11-16
**Test Suite Version**: 1.0.0
**Total Tests**: 88 unit + comprehensive E2E
