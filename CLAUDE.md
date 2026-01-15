# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarmonyOS file management application (ArkTS/ETS) implementing:
- File creation and reading in application sandbox
- File deduplication with duplicate detection
- Recycle bin with soft delete/restore functionality
- Incremental file scanning

**Bundle**: `com.example.filesmanger`
**Target SDK**: HarmonyOS 6.0.0 (SDK 20)
**Compatible SDK**: HarmonyOS 5.0.5 (SDK 17)

## Build and Development

This is a HarmonyOS project using DevEco Studio. Build and run through DevEco Studio IDE:
- Open project in DevEco Studio 6.0.0+
- Connect HarmonyOS device or use emulator
- Build: Build > Build Hap(s)/APP(s) > Build Hap(s)
- Run: Run > Run 'entry'

No command-line build tools are configured.

## Architecture

### Entry Point
- `entry/src/main/ets/entryability/EntryAbility.ets` - Application entry ability
- `entry/src/main/ets/pages/HomePage.ets` - Main page with tab navigation (4 tabs)

### Tab Components (`entry/src/main/ets/view/`)
- `ApplicationFileTab.ets` - Create and save files to sandbox
- `PublicFilesTab.ets` - File list management (view, rename, delete, edit)
- `DeduplicationTab.ets` - Duplicate file detection and cleanup UI
- `TrashTab.ets` - Recycle bin UI for deleted file recovery

### Utility Classes (`entry/src/main/ets/common/utils/`)
- `FileManager.ets` - Core file operations (list, search, rename, get info)
- `TrashManager.ets` - Soft delete with `.trash` directory and metadata persistence
- `DuplicateScanner.ets` - Content-based hash calculation, incremental scanning, duplicate grouping
- `DeleteFile.ets` - Delete wrapper using TrashManager
- `WriteFile.ets` / `ReadFile.ets` - Basic file I/O
- `Logger.ets` - Logging utility

### Data Flow
Files are stored in app sandbox (`context.filesDir`). TrashManager moves deleted files to `.trash/` subdirectory with metadata in `.trash_metadata.json`. DuplicateScanner persists scan state in `.scan_state.json` for incremental scanning.

## ArkTS Language Constraints

ArkTS has strict limitations compared to standard TypeScript:

- **No destructuring**: Use `forEach` or explicit property access instead of `for (const [key, value] of map)`
- **No spread operator**: Explicitly list properties instead of `{...obj}`
- **No optional chaining**: Use `if (obj && obj.prop)` instead of `obj?.prop`
- **No Set/Map as @State**: Use `string[]` arrays instead of `Set<string>` for reactive state
- **No Map constructor with iterable**: Build maps manually with loops

### UI Layout Notes
- Avoid `height('100%')` on components inside TabContent - use `layoutWeight(1)` for flexible sizing
- List/Scroll components need explicit height constraints or layoutWeight

## Resources

String resources: `entry/src/main/resources/base/element/string.json` (English) and `entry/src/main/resources/zh_CN/element/string.json` (Chinese)

Dimension resources: `entry/src/main/resources/base/element/float.json`
