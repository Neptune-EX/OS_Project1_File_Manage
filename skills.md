# 文件去重系统 - 功能实现文档

本文档详细介绍文件去重系统各功能的实现原理及核心方法。

---

## 1. 目录扫描范围

### 实现原理

系统扫描应用沙箱目录 `/data/storage/el2/base/haps/entry/files/` 下的所有 `.txt` 文件。通过 HarmonyOS 的 `UIAbilityContext.filesDir` 获取沙箱路径。

### 核心代码

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`

```typescript
// 构造函数中获取沙箱目录
constructor(context: Context) {
  this.context = context;
  const uiAbilityContext = context as common.UIAbilityContext;
  this.filesDir = uiAbilityContext.filesDir;  // 获取沙箱文件目录
  this.stateFilePath = this.filesDir + '/.scan_state.json';
}

// 获取所有待扫描文件（只获取.txt文件）
private getAllFiles(): string[] {
  try {
    const files = fileIo.listFileSync(this.filesDir);
    // 过滤条件：排除隐藏文件(.开头)、系统文件(_开头)，只保留.txt文件
    return files.filter(f => !f.startsWith('.') && !f.startsWith('_') && f.endsWith('.txt'));
  } catch (error) {
    console.error(`获取文件列表失败: ${error}`);
    return [];
  }
}
```

### 关键点

- 使用 `fileIo.listFileSync()` 同步获取目录下所有文件
- 过滤规则：排除 `.` 开头的隐藏文件（如 `.trash`、`.scan_state.json`）
- 只处理 `.txt` 扩展名的文件

---

## 2. 重复文件检测与分组

### 实现原理

通过计算文件内容的 Hash 值来判断文件是否重复。相同 Hash 值的文件被归为同一"重复组"。

### Hash 计算算法

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`

```typescript
private calculateHash(filePath: string): string {
  try {
    const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
    const stat = fileIo.statSync(filePath);

    // 对于大文件，只读取前1MB来计算hash（性能优化）
    const maxReadSize = 1024 * 1024;
    const readSize = Math.min(stat.size, maxReadSize);
    const buffer = new ArrayBuffer(readSize);
    fileIo.readSync(file.fd, buffer);
    fileIo.closeSync(file);

    // 使用三重hash算法，减少碰撞概率
    const uint8Array = new Uint8Array(buffer);
    let hash1 = 0;  // 简单累加
    let hash2 = 0;  // 带位置权重的累加
    let hash3 = 0;  // 异或运算

    for (let i = 0; i < uint8Array.length; i++) {
      hash1 = (hash1 + uint8Array[i]) >>> 0;
      hash2 = (hash2 + uint8Array[i] * (i + 1)) >>> 0;
      hash3 = (hash3 ^ (uint8Array[i] << (i % 24))) >>> 0;
    }

    // 组合hash值和文件大小，确保唯一性
    return `${stat.size}_${hash1.toString(16)}_${hash2.toString(16)}_${hash3.toString(16)}`;
  } catch (error) {
    return '';
  }
}
```

### 分组逻辑

```typescript
fullScan(): ScanResult {
  const files = this.getAllFiles();
  const hashMap: Map<string, DuplicateFileInfo[]> = new Map();

  // 遍历所有文件，按hash分组
  for (const filename of files) {
    const filePath = `${this.filesDir}/${filename}`;
    const stat = fileIo.statSync(filePath);
    const hash = this.calculateHash(filePath);

    const fileInfo: DuplicateFileInfo = {
      filename: filename,
      size: stat.size,
      sizeReadable: this.formatFileSize(stat.size),
      mtime: stat.mtime,
      mtimeFormatted: this.formatDate(stat.mtime),
      path: filePath
    };

    // 相同hash的文件归入同一组
    if (hashMap.has(hash)) {
      hashMap.get(hash)!.push(fileInfo);
    } else {
      hashMap.set(hash, [fileInfo]);
    }
  }

  // 构建重复组（只包含2个及以上文件的组）
  const duplicateGroups: DuplicateGroup[] = [];
  hashMap.forEach((files, hash) => {
    if (files.length > 1) {
      duplicateGroups.push({
        hash: hash,
        files: files.sort((a, b) => a.mtime - b.mtime),  // 按创建时间排序
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        wasteSize: totalSize - files[0].size  // 浪费空间 = 总大小 - 保留一份的大小
      });
    }
  });

  return { duplicateGroups, ... };
}
```

### 数据结构

```typescript
// 重复组接口
interface DuplicateGroup {
  hash: string;              // 文件内容hash（唯一标识）
  files: DuplicateFileInfo[]; // 该组中的文件列表
  totalSize: number;         // 该组总大小
  wasteSize: number;         // 浪费的空间
  changeStatus?: string;     // 变更状态（增量扫描用）
  changeCount?: number;      // 变更数量
}

// 重复文件信息接口
interface DuplicateFileInfo {
  filename: string;
  size: number;
  sizeReadable: string;
  mtime: number;
  mtimeFormatted: string;
  path: string;
  isNew?: boolean;           // 是否为新增文件（增量扫描用）
}
```

---

## 3. 手动处理与一键去重

### 实现原理

- **手动处理**: 用户选择某个重复组中要保留的文件，系统删除该组中其他所有文件
- **一键去重**: 遍历所有重复组，每组自动保留最早创建的文件（mtime最小），删除其他文件

### 核心方法

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`

```typescript
// 一键去重 - 每组保留最早创建的文件
deduplicateAll(): number {
  const trashManager = TrashManager.getInstance(this.context);
  const scanResult = this.fullScan();
  let deletedCount = 0;

  for (const group of scanResult.duplicateGroups) {
    // files已按mtime排序，第一个是最早的
    // 从索引1开始，删除其他所有文件
    for (let i = 1; i < group.files.length; i++) {
      const success = trashManager.moveToTrash(group.files[i].filename, 'dedup');
      if (success) {
        deletedCount++;
      }
    }
  }

  this.fullScan();  // 重新扫描更新状态
  return deletedCount;
}

// 手动处理单个重复组 - 保留指定文件
deduplicateGroup(hash: string, keepFilename: string): number {
  const trashManager = TrashManager.getInstance(this.context);
  const scanResult = this.fullScan();
  const group = scanResult.duplicateGroups.find(g => g.hash === hash);

  if (!group) return 0;

  let deletedCount = 0;
  for (const file of group.files) {
    // 除了要保留的文件，其他都删除
    if (file.filename !== keepFilename) {
      const success = trashManager.moveToTrash(file.filename, 'dedup');
      if (success) {
        deletedCount++;
      }
    }
  }

  this.fullScan();
  return deletedCount;
}
```

### UI交互流程

**文件路径**: `entry/src/main/ets/view/DeduplicationTab.ets`

1. 用户点击重复组展开查看文件列表
2. 每个文件行显示"查看"按钮（查看内容）和"保留此文件"按钮
3. 点击"保留此文件"弹出确认对话框
4. 确认后调用 `deduplicateGroup(hash, keepFilename)` 执行删除
5. 底部"保留第一个，删除其他"按钮快速处理整组
6. 顶部"一键去重"按钮处理所有重复组

---

## 4. 误操作回滚（回收站功能）

### 实现原理

删除文件时不直接删除，而是移动到隐藏的 `.trash` 目录。同时在 `.trash_metadata.json` 中记录元数据，支持恢复操作。

### 目录结构

```
/data/storage/el2/base/haps/entry/files/
├── .trash/                      # 回收站目录（隐藏）
│   ├── .trash_metadata.json     # 元数据文件
│   ├── 1234567890_file1.txt     # 删除的文件（带时间戳前缀避免冲突）
│   └── 1234567891_file2.txt
├── normal_file.txt              # 正常文件
└── ...
```

### 核心方法

**文件路径**: `entry/src/main/ets/common/utils/TrashManager.ets`

```typescript
// 移动文件到回收站（软删除）
moveToTrash(filename: string, source: string = 'manual'): boolean {
  try {
    const originalPath = `${this.filesDir}/${filename}`;

    // 检查文件是否存在
    if (!fileIo.accessSync(originalPath)) {
      return false;
    }

    const stat = fileIo.statSync(originalPath);

    // 生成回收站文件名（时间戳_原文件名，避免重名冲突）
    const timestamp = Date.now();
    const trashName = `${timestamp}_${filename}`;
    const trashPath = `${this.trashDir}/${trashName}`;

    // 移动文件到回收站
    fileIo.renameSync(originalPath, trashPath);

    // 更新元数据
    const metadata = this.readMetadata();
    metadata.files.push({
      originalName: filename,      // 原文件名
      trashName: trashName,        // 回收站中的文件名
      originalPath: originalPath,  // 原路径
      deleteTime: timestamp,       // 删除时间
      deleteTimeFormatted: this.formatDate(timestamp),
      size: stat.size,
      sizeReadable: this.formatFileSize(stat.size),
      source: source               // 删除来源：'manual'手动 或 'dedup'去重
    });
    this.writeMetadata(metadata);

    return true;
  } catch (error) {
    return false;
  }
}

// 从回收站恢复文件
restoreFile(trashName: string): boolean {
  try {
    const metadata = this.readMetadata();
    const fileInfo = metadata.files.find(f => f.trashName === trashName);

    if (!fileInfo) return false;

    const trashPath = `${this.trashDir}/${trashName}`;
    let restorePath = `${this.filesDir}/${fileInfo.originalName}`;

    // 如果原位置已有同名文件，添加后缀
    let counter = 1;
    while (fileIo.accessSync(restorePath)) {
      const nameParts = fileInfo.originalName.split('.');
      if (nameParts.length > 1) {
        const ext = nameParts.pop();
        restorePath = `${this.filesDir}/${nameParts.join('.')}_restored_${counter}.${ext}`;
      } else {
        restorePath = `${this.filesDir}/${fileInfo.originalName}_restored_${counter}`;
      }
      counter++;
    }

    // 移动文件回原位置
    fileIo.renameSync(trashPath, restorePath);

    // 更新元数据（移除该记录）
    metadata.files = metadata.files.filter(f => f.trashName !== trashName);
    this.writeMetadata(metadata);

    return true;
  } catch (error) {
    return false;
  }
}

// 永久删除（从回收站彻底删除）
permanentDelete(trashName: string): boolean {
  try {
    const trashPath = `${this.trashDir}/${trashName}`;

    if (fileIo.accessSync(trashPath)) {
      fileIo.unlinkSync(trashPath);  // 真正删除文件
    }

    // 更新元数据
    const metadata = this.readMetadata();
    metadata.files = metadata.files.filter(f => f.trashName !== trashName);
    this.writeMetadata(metadata);

    return true;
  } catch (error) {
    return false;
  }
}

// 清空回收站
emptyTrash(): boolean {
  try {
    const metadata = this.readMetadata();

    for (const fileInfo of metadata.files) {
      const trashPath = `${this.trashDir}/${fileInfo.trashName}`;
      if (fileIo.accessSync(trashPath)) {
        fileIo.unlinkSync(trashPath);
      }
    }

    // 清空元数据
    this.writeMetadata({ files: [], lastCleanTime: Date.now() });
    return true;
  } catch (error) {
    return false;
  }
}
```

### 元数据结构

```typescript
interface TrashMetadata {
  files: TrashFileInfo[];
  lastCleanTime: number;
}

interface TrashFileInfo {
  originalName: string;      // 原文件名
  trashName: string;         // 回收站中的文件名（带时间戳）
  originalPath: string;      // 原文件完整路径
  deleteTime: number;        // 删除时间戳
  deleteTimeFormatted: string;
  size: number;
  sizeReadable: string;
  source: string;            // 'manual' | 'dedup'
}
```

---

## 5. 增量扫描

### 实现原理

通过保存上次扫描时的文件"指纹"（文件名、大小、修改时间、hash），与当前状态对比，只重新计算变更文件的hash，并标记出新增、删除、修改的文件。

### 状态持久化

扫描状态保存在 `.scan_state.json` 文件中：

```typescript
interface ScanState {
  lastScanTime: number;           // 上次扫描时间
  fingerprints: FileFingerprint[]; // 所有文件的指纹
  duplicateGroups: DuplicateGroup[]; // 上次的重复组结果
}

interface FileFingerprint {
  filename: string;
  size: number;
  mtime: number;
  hash: string;
}
```

### 核心方法

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`

```typescript
incrementalScan(): ScanResult {
  const previousState = this.readScanState();

  // 如果没有历史记录，执行全量扫描
  if (!previousState) {
    return this.fullScan();
  }

  const currentFiles = this.getAllFiles();

  // 构建上次扫描的指纹Map
  const previousFingerprints: Map<string, FileFingerprint> = new Map();
  for (const f of previousState.fingerprints) {
    previousFingerprints.set(f.filename, f);
  }

  // 构建上次的重复组Map
  const previousGroups: Map<string, DuplicateGroup> = new Map();
  for (const g of previousState.duplicateGroups) {
    previousGroups.set(g.hash, g);
  }

  const changedFiles: string[] = [];
  const newFiles: string[] = [];
  const deletedFiles: string[] = [];

  // 检测新增和修改的文件
  for (const filename of currentFiles) {
    const filePath = `${this.filesDir}/${filename}`;
    const stat = fileIo.statSync(filePath);
    const prevFingerprint = previousFingerprints.get(filename);

    if (!prevFingerprint) {
      // 新增文件
      newFiles.push(filename);
      changedFiles.push(filename);
    } else if (stat.size !== prevFingerprint.size || stat.mtime !== prevFingerprint.mtime) {
      // 文件已修改（大小或修改时间变化）
      changedFiles.push(filename);
    }
  }

  // 检测删除的文件
  previousFingerprints.forEach((value, filename) => {
    if (!currentFiles.includes(filename)) {
      deletedFiles.push(filename);
      changedFiles.push(filename);
    }
  });

  // 如果没有变更，返回之前的结果
  if (changedFiles.length === 0) {
    return {
      duplicateGroups: previousState.duplicateGroups,
      isIncremental: true,
      changedFiles: 0,
      ...
    };
  }

  // 有变更，执行全量扫描并标记变更
  const fullResult = this.fullScan();

  // 标记变更状态
  for (const group of fullResult.duplicateGroups) {
    const prevGroup = previousGroups.get(group.hash);

    // 标记新增的文件
    for (const file of group.files) {
      if (newFiles.includes(file.filename)) {
        file.isNew = true;  // UI上显示"新增"标签
      }
    }

    // 标记组的变更状态
    if (!prevGroup) {
      group.changeStatus = 'new';           // 新的重复组
      group.changeCount = group.files.length;
    } else if (group.files.length > prevGroup.files.length) {
      group.changeStatus = 'increased';     // 重复数增加
      group.changeCount = group.files.length - prevGroup.files.length;
    } else if (group.files.length < prevGroup.files.length) {
      group.changeStatus = 'decreased';     // 重复数减少
      group.changeCount = prevGroup.files.length - group.files.length;
    }
  }

  return {
    duplicateGroups: fullResult.duplicateGroups,
    isIncremental: true,
    changedFiles: changedFiles.length,
    ...
  };
}
```

### UI展示

**文件路径**: `entry/src/main/ets/view/DeduplicationTab.ets`

```typescript
// 增量扫描提示
if (this.scanResult.isIncremental && this.scanResult.changedFiles > 0) {
  Text(`📊 本次仅扫描变更文件，共 ${this.scanResult.changedFiles} 个文件有变化`)
}

// 重复组变更状态标签
if (group.changeStatus) {
  Text(this.getChangeStatusText(group))  // 如："新增重复组 (+3)"
    .backgroundColor(this.getChangeStatusColor(group))  // 不同颜色
}

// 文件新增标签
if (file.isNew) {
  Text('新增')
    .backgroundColor('#FF9500')
}
```

### 变更状态类型

| 状态 | 含义 | 颜色 |
|------|------|------|
| `new` | 新发现的重复组 | 橙色 #FF9500 |
| `increased` | 重复文件数量增加 | 红色 #FF3B30 |
| `decreased` | 重复文件数量减少 | 绿色 #34C759 |

---

## 6. 测试数据生成器

### 实现原理

批量生成指定数量的txt文件，支持配置文件大小范围和重复率，用于测试去重功能。

### 核心方法

**文件路径**: `entry/src/main/ets/common/utils/TestDataGenerator.ets`

```typescript
generateTestFiles(config: GeneratorConfig): GeneratorResult {
  // 1. 计算实际重复率（在配置范围内随机）
  const actualDuplicateRate = this.randomInRange(config.minDuplicateRate, config.maxDuplicateRate) / 100;

  // 2. 计算重复文件数和唯一文件数
  const duplicateFileCount = Math.floor(config.fileCount * actualDuplicateRate);
  const uniqueFileCount = config.fileCount - duplicateFileCount;

  // 3. 生成重复文件内容（每组2-5个相同内容的文件）
  const duplicateGroups: string[] = [];
  let remainingDuplicates = duplicateFileCount;

  while (remainingDuplicates > 0) {
    const groupSize = Math.min(this.randomInRange(2, 5), remainingDuplicates);
    if (groupSize < 2) break;

    // 为这组生成相同的内容
    const content = this.generateRandomContent(this.randomInRange(config.minSize, config.maxSize));
    for (let i = 0; i < groupSize; i++) {
      duplicateGroups.push(content);
    }
    remainingDuplicates -= groupSize;
  }

  // 4. 生成唯一文件内容
  const uniqueContents: string[] = [];
  for (let i = 0; i < uniqueFileCount; i++) {
    uniqueContents.push(this.generateRandomContent(this.randomInRange(config.minSize, config.maxSize)));
  }

  // 5. 合并并打乱顺序（Fisher-Yates洗牌算法）
  const allContents = [...duplicateGroups, ...uniqueContents];
  for (let i = allContents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allContents[i], allContents[j]] = [allContents[j], allContents[i]];
  }

  // 6. 写入文件（随机文件名）
  for (const content of allContents) {
    const filename = `${this.generateRandomFilename(10)}.txt`;
    const stream = fileIo.createStreamSync(`${this.filesDir}/${filename}`, 'w+');
    stream.writeSync(content);
    stream.closeSync();
  }
}
```

### 配置参数

```typescript
interface GeneratorConfig {
  fileCount: number;        // 文件总数 (1-1000)
  minSize: number;          // 最小文件大小(bytes)
  maxSize: number;          // 最大文件大小(bytes)
  minDuplicateRate: number; // 最小重复率(0-100%)
  maxDuplicateRate: number; // 最大重复率(0-100%)
}
```

---

## 文件结构总览

```
entry/src/main/ets/
├── common/utils/
│   ├── DuplicateScanner.ets   # 重复文件扫描器（核心）
│   ├── TrashManager.ets       # 回收站管理器
│   ├── TestDataGenerator.ets  # 测试数据生成器
│   ├── FileManager.ets        # 文件管理工具
│   ├── DeleteFile.ets         # 删除文件（调用TrashManager）
│   ├── ReadFile.ets           # 读取文件
│   └── WriteFile.ets          # 写入文件
├── view/
│   ├── DeduplicationTab.ets   # 文件去重页面UI
│   ├── TrashTab.ets           # 回收站页面UI
│   ├── TestDataTab.ets        # 测试数据生成页面UI
│   ├── PublicFilesTab.ets     # 文件管理页面UI
│   └── ApplicationFileTab.ets # 创建文件页面UI
└── pages/
    └── HomePage.ets           # 主页（Tab导航）
```
