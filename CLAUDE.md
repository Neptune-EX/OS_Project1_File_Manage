# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarmonyOS file management application (ArkTS/ETS) implementing:
- File creation and reading in application sandbox
- File deduplication with duplicate detection
- **Worker multi-threading for file scanning** (non-blocking UI)
- Recycle bin with soft delete/restore functionality
- Incremental file scanning

**Bundle**: `com.example.filesmanger`
**Target SDK**: HarmonyOS 6.0.0 (SDK 20)
**Compatible SDK**: HarmonyOS 5.0.5 (SDK 17)
[个人日记_0118.txt](docs/%E4%B8%AA%E4%BA%BA%E6%97%A5%E8%AE%B0_0118.txt)
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

### Worker Multi-threading (`entry/src/main/ets/workers/`)
- `DuplicateWorker.ets` - Background worker thread for file scanning and hash calculation
  - Executes in separate thread to avoid blocking UI
  - Communicates with main thread via message passing (postMessage)
  - Handles: file reading, hash calculation, duplicate grouping
  - No build configuration needed - HarmonyOS auto-detects worker files

### Tab Components (`entry/src/main/ets/view/`)
- `ApplicationFileTab.ets` - Create and save files to sandbox
- `PublicFilesTab.ets` - File list management (view, rename, delete, edit)
- `DeduplicationTab.ets` - Duplicate file detection and cleanup UI with scan mode toggle (Worker/Async)
- `TrashTab.ets` - Recycle bin UI for deleted file recovery

### Utility Classes (`entry/src/main/ets/common/utils/`)
- `FileManager.ets` - Core file operations (list, search, rename, get info)
- `TrashManager.ets` - Soft delete with `.trash` directory and metadata persistence
- `DuplicateScanner.ets` - Content-based hash calculation, incremental scanning, duplicate grouping
  - **Supports two scan modes**: `fullScanWithWorker()` (multi-threaded) and `fullScanAsync()` (main thread)
  - Auto-fallback to async mode if Worker creation fails
- `DeleteFile.ets` - Delete wrapper using TrashManager
- `WriteFile.ets` / `ReadFile.ets` - Basic file I/O
- `Logger.ets` - Logging utility

### Data Flow
Files are stored in app sandbox (`context.filesDir`). TrashManager moves deleted files to `.trash/` subdirectory with metadata in `.trash_metadata.json`. DuplicateScanner persists scan state in `.scan_state.json` for incremental scanning.

**Worker Communication Flow**:
```
Main Thread (UI)          Worker Thread (Background)
     │                           │
     ├─ postMessage(SCAN) ──────>│
     │                           ├─ Read files
     │                           ├─ Calculate hashes
     │<──── postMessage(PROGRESS)┤
     │<──── postMessage(GROUP)───┤
     │<──── postMessage(COMPLETE)┤
     ├─ Update UI                │
     ├─ Terminate worker ────────>│
```

## ArkTS Language Constraints

ArkTS has strict limitations compared to standard TypeScript:

- **No destructuring**: Use `forEach` or explicit property access instead of `for (const [key, value] of map)`
- **No spread operator**: Explicitly list properties instead of `{...obj}`
- **No optional chaining**: Use `if (obj && obj.prop)` instead of `obj?.prop`
- **No Set/Map as @State**: Use `string[]` arrays instead of `Set<string>` for reactive state
- **No Map constructor with iterable**: Build maps manually with loops
- **No declaration merging**: Each interface/type can only be declared once per file

### Worker-Specific Constraints
- **No build configuration needed**: Worker files are auto-detected, do NOT add to `build-profile.json5`
- **Message passing only**: Workers cannot directly access main thread variables
- **Type inference**: Use `const workerPort = worker.workerPort` instead of explicit type annotations
- **Path format**: Worker path in `new worker.ThreadWorker()` must be relative to entry module: `'entry/ets/workers/FileName.ets'`

### UI Layout Notes
- Avoid `height('100%')` on components inside TabContent - use `layoutWeight(1)` for flexible sizing
- List/Scroll components need explicit height constraints or layoutWeight

## Resources

String resources: `entry/src/main/resources/base/element/string.json` (English) and `entry/src/main/resources/zh_CN/element/string.json` (Chinese)

Dimension resources: `entry/src/main/resources/base/element/float.json`
