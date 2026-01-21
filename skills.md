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

## 7. 文件去重过程可视化（实验三）

### 实现原理

通过**异步批量扫描**和**回调机制**实现扫描过程的实时可视化，包括进度条更新和动态重复组排行榜。

### 7.1 异步批量扫描

**文件路径**: `entry/src/main/ets/common/utils/DuplicateScanner.ets`

```typescript
fullScanAsync(callbacks?: ScanCallbacks, onComplete?: (result: ScanResult) => void): void {
  const files = this.getAllFiles();
  const hashMap: Map<string, DuplicateFileInfo[]> = new Map();
  const batchSize = 5;  // 每批处理5个文件
  let currentIndex = 0;
  const reportedGroups: string[] = [];  // 记录已报告的重复组

  // 批量处理函数
  const processBatch = () => {
    const endIndex = Math.min(currentIndex + batchSize, files.length);

    // 处理当前批次的文件
    for (let i = currentIndex; i < endIndex; i++) {
      const filename = files[i];
      const hash = this.calculateHash(filePath);

      // 添加到hash映射
      if (hashMap.has(hash)) {
        hashMap.get(hash)!.push(fileInfo);
      } else {
        hashMap.set(hash, [fileInfo]);
      }

      // 检查是否形成新的重复组
      const filesWithSameHash = hashMap.get(hash)!;
      if (filesWithSameHash.length === 2 && reportedGroups.indexOf(hash) === -1) {
        // 刚好形成重复组（第2个文件），立即报告
        const group: DuplicateGroup = {
          hash: hash,
          files: filesWithSameHash.sort((a, b) => a.mtime - b.mtime),
          totalSize: totalSize,
          wasteSize: wasteSize
        };

        reportedGroups.push(hash);
        if (callbacks && callbacks.onGroupFound) {
          callbacks.onGroupFound(group);  // 实时通知UI
        }
      } else if (filesWithSameHash.length > 2 && reportedGroups.indexOf(hash) >= 0) {
        // 重复组增加了新文件，更新报告
        if (callbacks && callbacks.onGroupFound) {
          callbacks.onGroupFound(group);
        }
      }
    }

    // 报告进度
    currentIndex = endIndex;
    if (callbacks && callbacks.onProgress) {
      callbacks.onProgress(currentIndex, totalFiles);
    }

    // 继续处理下一批或完成
    if (currentIndex < files.length) {
      setTimeout(processBatch, 50);  // 50ms后处理下一批，让UI有时间刷新
    } else {
      // 所有文件处理完成，调用完成回调
      if (onComplete) {
        onComplete(result);
      }
    }
  };

  // 启动批量处理
  processBatch();
}
```

### 7.2 回调接口

```typescript
// 扫描回调接口
export interface ScanCallbacks {
  onProgress?: (current: number, total: number) => void;  // 进度回调
  onGroupFound?: (group: DuplicateGroup) => void;         // 发现重复组回调
}
```

### 7.3 UI实时更新

**文件路径**: `entry/src/main/ets/view/DeduplicationTab.ets`

```typescript
private async performFullScan() {
  this.isScanning = true;
  this.isRealTimeScanning = true;
  this.scanProgress = 0;
  this.dynamicGroups = [];
  this.displayGroups = [];

  // 创建回调对象
  const callbacks: ScanCallbacks = {
    // 进度回调 - 更新进度条
    onProgress: (current: number, total: number) => {
      this.scanProgress = Math.floor((current / total) * 100);
      this.scanProgressText = `${current}/${total}`;
    },

    // 发现重复组回调 - 插入排行榜
    onGroupFound: (group: DuplicateGroup) => {
      // 插入新组并按 wasteSize 降序排序
      this.dynamicGroups = [...this.dynamicGroups, group]
        .sort((a, b) => b.wasteSize - a.wasteSize);

      // 更新显示列表
      this.displayGroups = this.dynamicGroups;

      // 更新动态统计
      this.dynamicStats = {
        scannedFiles: parseInt(this.scanProgressText.split('/')[0]),
        duplicateGroups: this.dynamicGroups.length,
        totalDuplicates: this.dynamicGroups.reduce((sum, g) => sum + g.files.length, 0),
        totalWasteSize: this.dynamicGroups.reduce((sum, g) => sum + g.wasteSize, 0),
        totalWasteSizeReadable: this.formatFileSize(...)
      };
    }
  };

  // 完成回调
  const onComplete = (result: ScanResult) => {
    this.scanResult = result;
    this.isScanning = false;
    this.isRealTimeScanning = false;
    this.displayGroups = result.duplicateGroups;
  };

  // 执行异步扫描
  this.scanner.fullScanAsync(callbacks, onComplete);
}
```

### 7.4 可视化组件

#### 进度条组件

```typescript
// 扫描进度条
if (this.isRealTimeScanning) {
  Column() {
    Row() {
      Text('扫描进度')
      Text(`${this.scanProgress}%`)  // 实时更新百分比
    }

    Progress({ value: this.scanProgress, total: 100, type: ProgressType.Linear })
      .color('#007AFF')
      .height(8)

    Text(`已扫描文件: ${this.scanProgressText}`)  // 显示 "5/200"
  }
  .backgroundColor('#F8F8F8')
}
```

#### 动态统计卡片

```typescript
// 实时统计信息
Row() {
  Column() {
    Text(`${this.isRealTimeScanning ? this.dynamicStats.scannedFiles : this.scanResult.scannedFiles}`)
    Text(this.isRealTimeScanning ? '已扫描' : '扫描文件')
  }

  Column() {
    Text(`${this.isRealTimeScanning ? this.dynamicStats.duplicateGroups : this.scanResult.duplicateGroups.length}`)
    Text('重复组')
  }

  Column() {
    Text(`${this.isRealTimeScanning ? this.dynamicStats.totalDuplicates : this.scanResult.totalDuplicates}`)
    Text('重复文件')
  }

  Column() {
    Text(this.isRealTimeScanning ? this.dynamicStats.totalWasteSizeReadable : this.scanResult.totalWasteSizeReadable)
    Text('可节省')
  }
}
.backgroundColor(this.isRealTimeScanning ? '#FFF8E1' : '#F8F8F8')  // 扫描中黄色，完成后灰色
```

#### 动态排行榜

```typescript
// 动态排行榜提示
if (this.isRealTimeScanning && this.dynamicGroups.length > 0) {
  Text(`🏆 动态排行榜 - 按可释放空间降序排列`)
}

// 重复组列表（实时更新）
List({ space: 8 }) {
  ForEach(this.displayGroups, (group: DuplicateGroup, index: number) => {
    ListItem() {
      Column() {
        Text(`重复组 ${index + 1}`)
        Text(`${group.files.length} 个重复文件 · 可节省 ${formatFileSize(group.wasteSize)}`)
      }
    }
    .transition({
      type: TransitionType.Insert,
      opacity: 0,
      translate: { x: 0, y: 50 }  // 从下方50px淡入
    })
  })
}
```

### 7.5 执行流程

```
用户点击"全量扫描"
    ↓
初始化状态（进度0%，清空列表）
    ↓
启动异步批量扫描
    ↓
┌─────────────────────────────────────┐
│ 批次1: 处理文件0-4                    │
│   - 计算hash                         │
│   - 发现重复组A → 立即回调onGroupFound │
│   - 回调onProgress(5, 200)           │
│   - UI更新: 进度5%, 插入重复组A       │
├─────────────────────────────────────┤
│ 延迟50ms（让UI线程刷新）              │
├─────────────────────────────────────┤
│ 批次2: 处理文件5-9                    │
│   - 发现重复组B → 立即回调            │
│   - 回调onProgress(10, 200)          │
│   - UI更新: 进度10%, 插入重复组B并重排│
├─────────────────────────────────────┤
│ 延迟50ms                             │
├─────────────────────────────────────┤
│ ...                                  │
├─────────────────────────────────────┤
│ 批次40: 处理文件195-199               │
│   - 回调onProgress(200, 200)         │
│   - UI更新: 进度100%                 │
└─────────────────────────────────────┘
    ↓
调用onComplete回调
    ↓
显示最终结果，隐藏进度条
```

### 7.6 关键技术点

#### 1. 批量处理策略

- **批次大小**: 每批处理5个文件
- **延迟时间**: 批次间延迟50ms
- **目的**: 将长时间的同步任务分割成小块，在间隙让UI线程有机会响应和渲染

#### 2. 实时排序插入

```typescript
// 每发现一个重复组，立即插入并排序
this.dynamicGroups = [...this.dynamicGroups, group]
  .sort((a, b) => b.wasteSize - a.wasteSize);  // 按可释放空间降序
```

- 使用扩展运算符创建新数组（触发ArkTS响应式更新）
- 每次插入后立即排序，保证排行榜始终有序
- 浪费空间大的组排在前面

#### 3. 状态管理

```typescript
@State isRealTimeScanning: boolean = false;  // 是否正在实时扫描
@State dynamicGroups: DuplicateGroup[] = [];  // 动态更新的重复组列表
@State displayGroups: DuplicateGroup[] = [];  // 当前显示的列表
@State dynamicStats: DynamicStats = { ... };  // 动态统计数据
```

- `isRealTimeScanning`: 区分扫描中和扫描完成状态
- `dynamicGroups`: 扫描过程中累积的重复组
- `displayGroups`: 统一的显示列表（扫描中显示dynamicGroups，完成后显示最终结果）
- `dynamicStats`: 实时计算的统计数据

#### 4. 列表动画

```typescript
.transition({
  type: TransitionType.Insert,
  opacity: 0,
  translate: { x: 0, y: 50 }  // 插入时从下方50px淡入
})
.transition({
  type: TransitionType.Delete,
  opacity: 0,
  translate: { x: 0, y: -50 }  // 删除时向上50px淡出
})
```

### 7.7 多线程实现（Worker）

**本系统已实现真正的多线程扫描，采用 HarmonyOS Worker 机制。**

#### 什么是多线程？

想象一下你在餐厅工作：

- **单线程（原来的方式）**：只有一个服务员，他必须先给A桌点单、送菜，然后才能服务B桌。如果A桌点菜时间很长，B桌就只能等着。
- **多线程（现在的方式）**：有两个服务员！一个专门在厨房准备菜（Worker线程），另一个专门接待客人（UI主线程）。厨房忙着做菜时，接待员还能继续服务其他客人。

在我们的应用中：
- **主线程（UI线程）**：负责显示界面、响应用户点击、更新进度条等
- **Worker线程**：负责读取文件、计算哈希值等耗时操作

#### 为什么需要多线程？

当扫描大量文件时，每个文件都需要：
1. 打开文件
2. 读取内容
3. 计算哈希值
4. 关闭文件

这些操作非常耗时。如果在主线程执行，界面会"卡住"，用户无法操作。使用多线程后：

```
┌────────────────────────────────────────────────────────────┐
│                        之前（单线程）                        │
├────────────────────────────────────────────────────────────┤
│ 主线程: [扫描文件1][扫描文件2][扫描文件3]...[更新UI]          │
│         ↑_________界面卡住，无法响应_________↑               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                        现在（多线程）                        │
├────────────────────────────────────────────────────────────┤
│ 主线程:   [响应点击][更新进度][显示结果][响应点击]...         │
│                ↑        ↑        ↑                         │
│ Worker线程: [扫描文件1][扫描文件2][扫描文件3]...              │
│              └──发送进度──┴──发送结果──┘                    │
└────────────────────────────────────────────────────────────┘
```

#### HarmonyOS Worker 机制

##### 1. Worker 是什么？

Worker 是 HarmonyOS 提供的多线程解决方案。它可以：
- 创建独立的线程执行任务
- 与主线程通过消息传递通信
- 不阻塞主线程的运行

##### 2. 通信方式：消息传递

主线程和 Worker 线程不能直接共享变量，必须通过"发消息"来通信：

```typescript
// 主线程发送消息给 Worker
worker.postMessage({
  type: 'SCAN',
  filesDir: '/data/storage/...'
});

// Worker 发送消息给主线程
workerPort.postMessage({
  type: 'PROGRESS',
  current: 50,
  total: 100
});
```

就像两个人通过打电话交流，而不是面对面说话。

##### 3. 消息协议设计

我们定义了清晰的消息类型：

| 方向 | 消息类型 | 含义 | 携带数据 |
|------|----------|------|----------|
| 主线程→Worker | `SCAN` | 开始扫描 | filesDir |
| Worker→主线程 | `PROGRESS` | 进度更新 | current, total |
| Worker→主线程 | `GROUP_FOUND` | 发现重复组 | group |
| Worker→主线程 | `COMPLETE` | 扫描完成 | result, fingerprints |
| Worker→主线程 | `ERROR` | 发生错误 | error |

#### Worker 实现详解

##### 文件位置

```
entry/src/main/ets/
├── workers/
│   └── DuplicateWorker.ets    ← Worker 线程代码
└── common/utils/
    └── DuplicateScanner.ets   ← 主线程调用代码
```

##### Worker 线程代码 (DuplicateWorker.ets)

```typescript
import { worker, MessageEvents } from '@kit.ArkTS';
import { fileIo } from '@kit.CoreFileKit';

// 获取 Worker 通信端口
const workerPort: worker.ThreadWorkerGlobalScope = worker.workerPort;

// 监听主线程消息
workerPort.onmessage = (e: MessageEvents): void => {
  const message = e.data;

  if (message.type === 'SCAN') {
    // 执行扫描任务
    performFullScan(message.filesDir);
  }
};

// 扫描函数
function performFullScan(filesDir: string): void {
  const files = getAllFiles(filesDir);

  for (let i = 0; i < files.length; i++) {
    // 计算文件哈希
    const hash = calculateHash(files[i]);

    // 每处理5个文件，发送进度
    if ((i + 1) % 5 === 0) {
      workerPort.postMessage({
        type: 'PROGRESS',
        current: i + 1,
        total: files.length
      });
    }

    // 发现重复组时立即通知
    if (/* 形成重复组 */) {
      workerPort.postMessage({
        type: 'GROUP_FOUND',
        group: duplicateGroup
      });
    }
  }

  // 扫描完成
  workerPort.postMessage({
    type: 'COMPLETE',
    result: scanResult
  });
}
```

##### 主线程调用代码 (DuplicateScanner.ets)

```typescript
import { worker, MessageEvents, ErrorEvent } from '@kit.ArkTS';

class DuplicateScanner {
  private scanWorker: worker.ThreadWorker | null = null;

  // 使用 Worker 扫描
  fullScanWithWorker(callbacks, onComplete): void {
    // 1. 创建 Worker 实例
    this.scanWorker = new worker.ThreadWorker(
      'entry/ets/workers/DuplicateWorker.ets',
      { type: 'classic', name: 'DuplicateScanWorker' }
    );

    // 2. 设置消息处理器
    this.scanWorker.onmessage = (e: MessageEvents): void => {
      const message = e.data;

      switch (message.type) {
        case 'PROGRESS':
          // 更新进度条
          callbacks.onProgress(message.current, message.total);
          break;

        case 'GROUP_FOUND':
          // 更新重复组列表
          callbacks.onGroupFound(message.group);
          break;

        case 'COMPLETE':
          // 扫描完成
          onComplete(message.result);
          this.terminateWorker();
          break;
      }
    };

    // 3. 发送扫描命令
    this.scanWorker.postMessage({
      type: 'SCAN',
      filesDir: this.filesDir
    });
  }

  // 终止 Worker
  terminateWorker(): void {
    if (this.scanWorker) {
      this.scanWorker.terminate();
      this.scanWorker = null;
    }
  }
}
```

#### Worker 配置

要使用 Worker，需要在 `build-profile.json5` 中配置：

```json5
{
  "buildOption": {
    "workers": [
      "./src/main/ets/workers/DuplicateWorker.ets"
    ]
  }
}
```

这告诉编译器将 Worker 文件编译为独立的模块。

#### 扫描模式切换

系统支持两种扫描模式，用户可以通过开关切换：

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| Worker多线程 | 在独立线程执行扫描 | 默认模式，适合大量文件 |
| 主线程异步 | 在主线程分批执行 | 兼容模式，适合少量文件 |

```typescript
// DeduplicationTab.ets
@State useWorkerScan: boolean = true;  // 默认使用Worker

// 根据开关选择扫描方式
if (this.useWorkerScan) {
  this.scanner.fullScanWithWorker(callbacks, onComplete);
} else {
  this.scanner.fullScanAsync(callbacks, onComplete);
}
```

#### 错误处理与降级

如果 Worker 创建失败（例如设备不支持），系统会自动降级到主线程异步扫描：

```typescript
try {
  this.scanWorker = new worker.ThreadWorker('...');
} catch (error) {
  console.error('Worker创建失败，降级到主线程扫描');
  this.fullScanAsync(callbacks, onComplete);  // 降级方案
}
```

#### 执行流程图

```
用户点击"全量扫描"
        ↓
检查扫描模式开关
        ↓
    ┌───────────────────────────────────┐
    │  useWorkerScan === true?          │
    └───────────────────────────────────┘
        ↓ 是                     ↓ 否
┌───────────────────┐   ┌───────────────────┐
│ 创建Worker线程     │   │ 使用主线程异步     │
│                   │   │ fullScanAsync()   │
│ new ThreadWorker  │   │                   │
└───────────────────┘   └───────────────────┘
        ↓
┌───────────────────┐
│ 发送SCAN消息      │
│                   │
│ worker.postMessage│
└───────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ Worker线程开始工作                          │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 循环处理每个文件:                     │  │
│  │   1. 计算哈希值                      │  │
│  │   2. 检查是否形成重复组               │  │
│  │   3. 发送PROGRESS/GROUP_FOUND消息    │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  完成后发送COMPLETE消息                    │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ 主线程收到消息                             │
│                                           │
│  PROGRESS   → 更新进度条                   │
│  GROUP_FOUND → 插入重复组列表并排序         │
│  COMPLETE   → 显示最终结果，终止Worker      │
└───────────────────────────────────────────┘
```

#### 性能对比

| 指标 | 主线程异步 | Worker多线程 |
|------|-----------|-------------|
| UI响应 | 略有延迟 | 完全流畅 |
| 扫描速度 | 基准 | 相近（通信有开销） |
| CPU利用 | 单核 | 多核并行 |
| 内存占用 | 较低 | 略高（额外线程） |
| 实现复杂度 | 简单 | 中等 |
| 错误处理 | 简单 | 需要消息机制 |

#### 关键概念总结

1. **Worker线程**：独立于主线程的执行环境，有自己的运行时
2. **消息传递**：线程间通信的唯一方式，通过 postMessage 发送
3. **非共享内存**：Worker不能直接访问主线程的变量
4. **生命周期**：需要手动创建和终止Worker
5. **降级方案**：Worker失败时回退到主线程异步执行

---

## 文件结构总览

```
entry/src/main/ets/
├── workers/                          # Worker多线程模块
│   └── DuplicateWorker.ets           # 文件扫描Worker（独立线程）
├── common/utils/
│   ├── DuplicateScanner.ets          # 重复文件扫描器（核心，支持Worker调用）
│   ├── TrashManager.ets              # 回收站管理器
│   ├── TestDataGenerator.ets         # 测试数据生成器
│   ├── FileManager.ets               # 文件管理工具
│   ├── DeleteFile.ets                # 删除文件（调用TrashManager）
│   ├── ReadFile.ets                  # 读取文件
│   └── WriteFile.ets                 # 写入文件
├── view/
│   ├── DeduplicationTab.ets          # 文件去重页面UI（支持切换扫描模式）
│   ├── TrashTab.ets                  # 回收站页面UI
│   ├── TestDataTab.ets               # 测试数据生成页面UI
│   ├── PublicFilesTab.ets            # 文件管理页面UI
│   └── ApplicationFileTab.ets        # 创建文件页面UI
└── pages/
    └── HomePage.ets                  # 主页（Tab导航）
```
