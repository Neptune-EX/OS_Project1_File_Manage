/*
 * 文件去重Tab页面 - 实现重复文件扫描、展示和去重功能
 *
 * 支持两种扫描模式：
 * 1. Worker多线程扫描（默认）- 在独立线程中执行，不阻塞UI
 * 2. 主线程异步扫描 - 在主线程中分批执行
 */

import { DuplicateScanner, DuplicateGroup, DuplicateFileInfo, ScanResult, ScanCallbacks } from '../common/utils/DuplicateScanner';
import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

// 动态统计数据接口
interface DynamicStats {
  scannedFiles: number;
  duplicateGroups: number;
  totalDuplicates: number;
  totalWasteSize: number;
  totalWasteSizeReadable: string;
}

@Component
export struct DeduplicationTab {
  @State scanResult: ScanResult | null = null;
  @State isScanning: boolean = false;
  @State expandedGroups: string[] = [];
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: string = 'success'; // 'success' | 'error' | 'info'
  @State lastScanTime: string = '';
  @State showConfirmDialog: boolean = false;
  @State confirmAction: string = ''; // 'dedup_all' | 'dedup_group'
  @State selectedGroupHash: string = '';
  @State selectedKeepFile: string = '';

  // 可视化相关状态
  @State scanProgress: number = 0;  // 扫描进度 0-100
  @State scanProgressText: string = '';  // 进度文本 "当前/总数"
  @State isRealTimeScanning: boolean = false;  // 是否正在实时扫描
  @State dynamicGroups: DuplicateGroup[] = [];  // 动态更新的重复组列表
  @State dynamicStats: DynamicStats = {
    scannedFiles: 0,
    duplicateGroups: 0,
    totalDuplicates: 0,
    totalWasteSize: 0,
    totalWasteSizeReadable: '0 B'
  };
  @State displayGroups: DuplicateGroup[] = [];  // 当前显示的重复组列表

  // Worker多线程扫描开关
  @State useWorkerScan: boolean = true;  // 默认使用Worker多线程扫描
  @State scanModeText: string = 'Worker多线程';  // 当前扫描模式文本

  // 查看文件内容相关状态
  @State showFileContentDialog: boolean = false;
  @State viewingFileName: string = '';
  @State viewingFileContent: string = '';

  private scanner: DuplicateScanner | null = null;
  private filesDir: string = '';

  aboutToAppear() {
    const context = this.getUIContext().getHostContext() as Context;
    this.scanner = DuplicateScanner.getInstance(context);
    this.lastScanTime = this.scanner.getLastScanTimeFormatted();

    // 获取文件目录路径
    const uiAbilityContext = context as common.UIAbilityContext;
    this.filesDir = uiAbilityContext.filesDir;
  }

  // 查看文件内容
  private viewFileContent(filename: string) {
    try {
      const filePath = `${this.filesDir}/${filename}`;
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      const stat = fileIo.statSync(filePath);

      // 限制读取大小，避免内存问题
      const maxReadSize = 10 * 1024; // 最多读取10KB
      const readSize = Math.min(stat.size, maxReadSize);
      const buffer = new ArrayBuffer(readSize);
      fileIo.readSync(file.fd, buffer);
      fileIo.closeSync(file);

      // 转换为字符串
      const uint8Array = new Uint8Array(buffer);
      let content = '';
      for (let i = 0; i < uint8Array.length; i++) {
        content += String.fromCharCode(uint8Array[i]);
      }

      // 如果文件被截断，添加提示
      if (stat.size > maxReadSize) {
        content += `\n\n... (文件过大，仅显示前 ${maxReadSize} 字节)`;
      }

      this.viewingFileName = filename;
      this.viewingFileContent = content;
      this.showFileContentDialog = true;
    } catch (error) {
      this.showToast(`读取文件失败: ${error}`, 'error');
    }
  }

  // 显示消息提示
  private showToast(message: string, type: string = 'success') {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  // 执行全量扫描
  private async performFullScan() {
    if (!this.scanner || this.isScanning) return;

    this.isScanning = true;
    this.isRealTimeScanning = true;
    this.scanProgress = 0;
    this.scanProgressText = '';
    this.dynamicGroups = [];
    this.displayGroups = [];  // 清空显示列表

    // 根据扫描模式显示不同提示
    const modeHint = this.useWorkerScan ? '（Worker多线程模式）' : '（主线程异步模式）';
    this.showToast(`正在扫描文件...${modeHint}`, 'info');

    try {
      if (this.scanner) {
        // 创建回调对象
        const callbacks: ScanCallbacks = {
          onProgress: (current: number, total: number) => {
            this.scanProgress = Math.floor((current / total) * 100);
            this.scanProgressText = `${current}/${total}`;
          },
          onGroupFound: (group: DuplicateGroup) => {
            // 检查是否已存在该组（更新）
            const existingIndex = this.dynamicGroups.findIndex((g: DuplicateGroup) => g.hash === group.hash);
            if (existingIndex >= 0) {
              // 更新已存在的组
              this.dynamicGroups[existingIndex] = group;
              this.dynamicGroups = this.dynamicGroups.slice().sort((a, b) => b.wasteSize - a.wasteSize);
            } else {
              // 插入新组并按 wasteSize 降序排序
              this.dynamicGroups = [...this.dynamicGroups, group]
                .sort((a, b) => b.wasteSize - a.wasteSize);
            }

            // 更新显示列表
            this.displayGroups = this.dynamicGroups;

            // 更新动态统计
            this.dynamicStats = {
              scannedFiles: this.scanProgressText.split('/')[0] ? parseInt(this.scanProgressText.split('/')[0]) : 0,
              duplicateGroups: this.dynamicGroups.length,
              totalDuplicates: this.dynamicGroups.reduce((sum, g) => sum + g.files.length, 0),
              totalWasteSize: this.dynamicGroups.reduce((sum, g) => sum + g.wasteSize, 0),
              totalWasteSizeReadable: this.formatFileSize(this.dynamicGroups.reduce((sum, g) => sum + g.wasteSize, 0))
            };
          }
        };

        // 完成回调
        const onComplete = (result: ScanResult) => {
          this.scanResult = result;
          this.lastScanTime = this.scanner!.getLastScanTimeFormatted();
          this.isScanning = false;
          this.isRealTimeScanning = false;

          // 更新显示列表为最终结果
          if (this.scanResult) {
            this.displayGroups = this.scanResult.duplicateGroups;
          }

          if (this.scanResult.duplicateGroups.length === 0) {
            this.showToast('扫描完成，未发现重复文件', 'info');
          } else {
            const modeInfo = this.useWorkerScan ? '[Worker]' : '[主线程]';
            this.showToast(
              `${modeInfo} 扫描完成！发现 ${this.scanResult.duplicateGroups.length} 组重复文件，` +
              `可节省 ${this.scanResult.totalWasteSizeReadable} 空间`,
              'success'
            );
          }
        };

        // 根据开关选择扫描方式
        if (this.useWorkerScan) {
          // 使用 Worker 多线程扫描
          this.scanner.fullScanWithWorker(callbacks, onComplete);
        } else {
          // 使用主线程异步扫描
          this.scanner.fullScanAsync(callbacks, onComplete);
        }
      }
    } catch (error) {
      this.isScanning = false;
      this.isRealTimeScanning = false;
      this.showToast(`扫描失败: ${error}`, 'error');
    }
  }

  // 执行增量扫描
  private async performIncrementalScan() {
    if (!this.scanner || this.isScanning) return;

    this.isScanning = true;
    this.showToast('正在执行增量扫描...', 'info');

    try {
      setTimeout(() => {
        if (this.scanner) {
          this.scanResult = this.scanner.incrementalScan();
          this.lastScanTime = this.scanner.getLastScanTimeFormatted();
          this.isScanning = false;

          // 更新显示列表
          if (this.scanResult) {
            this.displayGroups = this.scanResult.duplicateGroups;
          }

          if (this.scanResult.changedFiles === 0) {
            this.showToast('增量扫描完成，文件无变化', 'info');
          } else {
            this.showToast(
              `增量扫描完成！检测到 ${this.scanResult.changedFiles} 个文件变更`,
              'success'
            );
          }
        }
      }, 100);
    } catch (error) {
      this.isScanning = false;
      this.showToast(`扫描失败: ${error}`, 'error');
    }
  }

  // 一键去重
  private performDeduplicateAll() {
    if (!this.scanner) return;

    const deletedCount = this.scanner.deduplicateAll();
    this.scanResult = this.scanner.fullScan();

    // 更新显示列表
    if (this.scanResult) {
      this.displayGroups = this.scanResult.duplicateGroups;
    }

    this.showToast(`一键去重完成！已删除 ${deletedCount} 个重复文件`, 'success');
    this.showConfirmDialog = false;
  }

  // 处理单个重复组
  private performDeduplicateGroup() {
    if (!this.scanner || !this.selectedGroupHash || !this.selectedKeepFile) return;

    const deletedCount = this.scanner.deduplicateGroup(this.selectedGroupHash, this.selectedKeepFile);
    this.scanResult = this.scanner.fullScan();

    // 更新显示列表
    if (this.scanResult) {
      this.displayGroups = this.scanResult.duplicateGroups;
    }

    this.showToast(`已删除 ${deletedCount} 个重复文件，保留 "${this.selectedKeepFile}"`, 'success');
    this.showConfirmDialog = false;
    this.expandedGroups = this.expandedGroups.filter(h => h !== this.selectedGroupHash);
  }

  // 切换组展开状态
  private toggleGroup(hash: string) {
    const index = this.expandedGroups.indexOf(hash);
    if (index >= 0) {
      this.expandedGroups = this.expandedGroups.filter(h => h !== hash);
    } else {
      this.expandedGroups = this.expandedGroups.concat([hash]);
    }
  }

  // 检查组是否展开
  private isGroupExpanded(hash: string): boolean {
    return this.expandedGroups.indexOf(hash) >= 0;
  }

  // 获取变更状态文字
  private getChangeStatusText(group: DuplicateGroup): string {
    if (!group.changeStatus) return '';

    switch (group.changeStatus) {
      case 'new':
        return `新增重复组 (+${group.changeCount})`;
      case 'increased':
        return `重复数增加 (+${group.changeCount})`;
      case 'decreased':
        return `重复数减少 (-${group.changeCount})`;
      default:
        return '';
    }
  }

  // 获取变更状态颜色
  private getChangeStatusColor(group: DuplicateGroup): string {
    switch (group.changeStatus) {
      case 'new':
        return '#FF9500';
      case 'increased':
        return '#FF3B30';
      case 'decreased':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  }

  //新增index命名方式，按照组重复的字符命名
  private getGroupNameByHash(group: DuplicateGroup): string {
    // 取hash的前6-8个字符（通常足够唯一标识）
    const hashPrefix = group.hash.substring(0, 8);
    console.log("命名名称",hashPrefix)
    console.log("hash类型",typeof group.hash)
    return `重复组 [${hashPrefix}]`;
  }

  private getSimpleHashName(group: DuplicateGroup,index:number): string {
    // 从复合hash中提取内容hash部分
    const parts = group.hash.split('_');

    if (parts.length >= 2) {
      // parts[1] 是内容的第一个hash值
      const contentHash = parts[1];

      if (contentHash && contentHash.length >= 4) {
        // 使用内容hash的前4个字符
        return `[${contentHash.substring(0, 4).toUpperCase()}]`;
      }
    }
    // 回退方案：使用文件数量
    return `${index+1}`;
  }


  build() {
    Column() {
      // === 顶部标题和扫描信息 ===
      Column() {
        Text('文件去重')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 8 })

        Row() {
          Text(`上次扫描: ${this.lastScanTime}`)
            .fontSize(12)
            .fontColor('#8E8E93')

          Blank()

          // 扫描模式切换
          Row() {
            Text(this.useWorkerScan ? 'Worker多线程' : '主线程异步')
              .fontSize(11)
              .fontColor(this.useWorkerScan ? '#007AFF' : '#8E8E93')
              .margin({ right: 6 })

            Toggle({ type: ToggleType.Switch, isOn: this.useWorkerScan })
              .width(40)
              .height(22)
              .selectedColor('#007AFF')
              .onChange((isOn: boolean) => {
                this.useWorkerScan = isOn;
                this.scanModeText = isOn ? 'Worker多线程' : '主线程异步';
              })
          }
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })
      .alignItems(HorizontalAlign.Start)

      // === 操作按钮区 ===
      Row({ space: 10 }) {
        Button(this.isScanning ? '扫描中...' : '全量扫描')
          .onClick(() => this.performFullScan())
          .enabled(!this.isScanning)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.isScanning ? '#C7C7CC' : '#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('增量扫描')
          .onClick(() => this.performIncrementalScan())
          .enabled(!this.isScanning && this.lastScanTime !== '从未扫描')
          .height(40)
          .fontSize(14)
          .backgroundColor((!this.isScanning && this.lastScanTime !== '从未扫描') ? '#34C759' : '#C7C7CC')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('一键去重')
          .onClick(() => {
            if (this.scanResult && this.scanResult.duplicateGroups.length > 0) {
              this.confirmAction = 'dedup_all';
              this.showConfirmDialog = true;
            } else {
              this.showToast('请先执行扫描', 'info');
            }
          })
          .enabled(!this.isScanning && this.scanResult !== null && this.scanResult.duplicateGroups.length > 0)
          .height(40)
          .fontSize(14)
          .backgroundColor(
            (!this.isScanning && this.scanResult !== null && this.scanResult.duplicateGroups.length > 0)
              ? '#FF3B30' : '#C7C7CC'
          )
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

      // === 扫描进度条 ===
      if (this.isRealTimeScanning) {
        Column() {
          Row() {
            Text('扫描进度')
              .fontSize(14)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
              .layoutWeight(1)

            Text(`${this.scanProgress}%`)
              .fontSize(14)
              .fontColor('#007AFF')
              .fontWeight(FontWeight.Bold)
          }
          .width('100%')
          .margin({ bottom: 8 })

          Progress({ value: this.scanProgress, total: 100, type: ProgressType.Linear })
            .color('#007AFF')
            .backgroundColor('#E0E0E0')
            .height(8)
            .width('100%')
            .borderRadius(4)

          if (this.scanProgressText) {
            Text(`已扫描文件: ${this.scanProgressText}`)
              .fontSize(12)
              .fontColor('#8E8E93')
              .margin({ top: 6 })
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8, bottom: 12 })
        .backgroundColor('#F8F8F8')
        .borderRadius(12)
        .margin({ left: 16, right: 16, bottom: 12 })
      }

      // === 消息提示 ===
      if (this.showMessage) {
        Text(this.messageText)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor(
            this.messageType === 'success' ? '#34C759' :
              (this.messageType === 'error' ? '#FF3B30' : '#007AFF')
          )
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(8)
          .margin({ left: 16, right: 16, bottom: 8 })
      }

      // === 扫描结果统计 ===
      if (this.scanResult || this.isRealTimeScanning) {
        // 根据扫描状态获取要显示的统计数据
        Row() {
          Column() {
            Text(`${this.isRealTimeScanning ? this.dynamicStats.scannedFiles : (this.scanResult?.scannedFiles || 0)}`)
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#007AFF')
            Text(this.isRealTimeScanning ? '已扫描' : '扫描文件')
              .fontSize(11)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)

          Column() {
            Text(`${this.isRealTimeScanning ? this.dynamicStats.duplicateGroups : (this.scanResult?.duplicateGroups.length || 0)}`)
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF9500')
            Text('重复组')
              .fontSize(11)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)

          Column() {
            Text(`${this.isRealTimeScanning ? this.dynamicStats.totalDuplicates : (this.scanResult?.totalDuplicates || 0)}`)
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF3B30')
            Text('重复文件')
              .fontSize(11)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)

          Column() {
            Text(this.isRealTimeScanning ? this.dynamicStats.totalWasteSizeReadable : (this.scanResult?.totalWasteSizeReadable || '0 B'))
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#34C759')
            Text('可节省')
              .fontSize(11)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8, bottom: 12 })
        .backgroundColor(this.isRealTimeScanning ? '#FFF8E1' : '#F8F8F8')
        .borderRadius(12)
        .margin({ left: 16, right: 16, bottom: 12 })
      }

      // === 重复文件列表 ===
      if (!this.scanResult && !this.isRealTimeScanning) {
        Column() {
          Text('🔍')
            .fontSize(48)
            .margin({ bottom: 16 })
          Text('点击"全量扫描"开始检测重复文件')
            .fontSize(14)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .height(200)
        .justifyContent(FlexAlign.Center)
      } else if (!this.isRealTimeScanning && this.scanResult && this.scanResult.duplicateGroups.length === 0) {
        Column() {
          Text('✅')
            .fontSize(48)
            .margin({ bottom: 16 })
          Text('太棒了！没有发现重复文件')
            .fontSize(14)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .height(200)
        .justifyContent(FlexAlign.Center)
      } else {
        // 动态排行榜提示
        if (this.isRealTimeScanning && this.dynamicGroups.length > 0) {
          Row() {
            Text(`🏆 动态排行榜 - 按可释放空间降序排列`)
              .fontSize(13)
              .fontWeight(FontWeight.Medium)
              .fontColor('#FF9500')
          }
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 8 })
        }

        // 增量扫描提示
        if (!this.isRealTimeScanning && this.scanResult && this.scanResult.isIncremental && this.scanResult.changedFiles > 0) {
          Row() {
            Text(`📊 本次仅扫描变更文件，共 ${this.scanResult.changedFiles} 个文件有变化`)
              .fontSize(12)
              .fontColor('#FF9500')
          }
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 8 })
        }

        if (this.displayGroups.length === 0 && this.isRealTimeScanning) {
          // 扫描中但还未发现重复组
          Column() {
            Text('🔄')
              .fontSize(48)
              .margin({ bottom: 16 })
            Text('正在扫描文件，寻找重复组...')
              .fontSize(14)
              .fontColor('#8E8E93')
          }
          .width('100%')
          .height(200)
          .justifyContent(FlexAlign.Center)
        } else if (this.displayGroups.length > 0) {
          List({ space: 8 }) {
            ForEach(this.displayGroups, (group: DuplicateGroup, index: number) => {
            ListItem() {
              Column() {
                // 组标题行
                Row() {
                  Column() {
                    Row() {
                      // Text(`重复组 #${index + 1}`)
                      Text(`加密Hash值${this.getSimpleHashName(group,index)}`)
                        .fontSize(16)
                        .fontWeight(FontWeight.Bold)
                        .fontColor('#333333')

                      if (group.changeStatus) {
                        Text(this.getChangeStatusText(group))
                          .fontSize(11)
                          .fontColor(Color.White)
                          .backgroundColor(this.getChangeStatusColor(group))
                          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                          .borderRadius(4)
                          .margin({ left: 8 })
                      }
                    }

                    Text(`${group.files.length} 个重复文件 · 可节省 ${this.formatFileSize(group.wasteSize)}`)
                      .fontSize(12)
                      .fontColor('#8E8E93')
                      .margin({ top: 4 })
                  }
                  .alignItems(HorizontalAlign.Start)
                  .layoutWeight(1)

                  Text(this.isGroupExpanded(group.hash) ? '▼' : '▶')
                    .fontSize(14)
                    .fontColor('#8E8E93')
                }
                .width('100%')
                .padding(12)
                .onClick(() => this.toggleGroup(group.hash))

                // 展开的文件列表
                if (this.isGroupExpanded(group.hash)) {
                  Column({ space: 6 }) {
                    ForEach(group.files, (file: DuplicateFileInfo, fileIndex: number) => {
                      Row() {
                        Column() {
                          Row() {
                            if (fileIndex === 0) {
                              Text('保留')
                                .fontSize(10)
                                .fontColor(Color.White)
                                .backgroundColor('#34C759')
                                .padding({ left: 4, right: 4, top: 1, bottom: 1 })
                                .borderRadius(4)
                                .margin({ right: 6 })
                            }

                            if (file.isNew) {
                              Text('新增')
                                .fontSize(10)
                                .fontColor(Color.White)
                                .backgroundColor('#FF9500')
                                .padding({ left: 4, right: 4, top: 1, bottom: 1 })
                                .borderRadius(4)
                                .margin({ right: 6 })
                            }

                            Text(file.filename)
                              .fontSize(14)
                              .fontColor('#333333')
                              .maxLines(1)
                              .textOverflow({ overflow: TextOverflow.Ellipsis })
                          }

                          Text(`${file.sizeReadable} · ${file.mtimeFormatted}`)
                            .fontSize(11)
                            .fontColor('#8E8E93')
                            .margin({ top: 2 })
                        }
                        .alignItems(HorizontalAlign.Start)
                        .layoutWeight(1)

                        Row({ space: 4 }) {
                          Button('查看')
                            .onClick(() => {
                              this.viewFileContent(file.filename);
                            })
                            .height(28)
                            .fontSize(11)
                            .backgroundColor('#8E8E93')
                            .fontColor(Color.White)
                            .borderRadius(14)

                          if (fileIndex !== 0) {
                            Button('保留此文件')
                              .onClick(() => {
                                this.selectedGroupHash = group.hash;
                                this.selectedKeepFile = file.filename;
                                this.confirmAction = 'dedup_group';
                                this.showConfirmDialog = true;
                              })
                              .height(28)
                              .fontSize(11)
                              .backgroundColor('#007AFF')
                              .fontColor(Color.White)
                              .borderRadius(14)
                          }
                        }
                      }
                      .width('100%')
                      .padding({ left: 12, right: 12, top: 8, bottom: 8 })
                      .backgroundColor(fileIndex === 0 ? '#E8F5E9' : '#FFF8E1')
                      .borderRadius(8)
                    })

                    // 快速操作按钮
                    Row({ space: 10 }) {
                      Button('保留第一个，删除其他')
                        .onClick(() => {
                          this.selectedGroupHash = group.hash;
                          this.selectedKeepFile = group.files[0].filename;
                          this.confirmAction = 'dedup_group';
                          this.showConfirmDialog = true;
                        })
                        .height(36)
                        .fontSize(13)
                        .backgroundColor('#FF3B30')
                        .fontColor(Color.White)
                        .borderRadius(8)
                        .layoutWeight(1)
                    }
                    .width('100%')
                    .padding({ top: 8 })
                  }
                  .width('100%')
                  .padding({ left: 12, right: 12, bottom: 12 })
                }
              }
              .backgroundColor(Color.White)
              .borderRadius(12)
              .border({ width: 1, color: '#E0E0E0' })
              .transition({
                type: TransitionType.Insert,
                opacity: 0,
                translate: { x: 0, y: 50 }
              })
              .transition({
                type: TransitionType.Delete,
                opacity: 0,
                translate: { x: 0, y: -50 }
              })
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
        }
      }

      // === 确认对话框 ===
      if (this.showConfirmDialog) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.showConfirmDialog = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          Text(this.confirmAction === 'dedup_all' ? '确认一键去重' : '确认删除重复文件')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          Text(
            this.confirmAction === 'dedup_all'
              ? `即将删除所有重复组中的多余文件，每组保留最早创建的文件。\n\n共 ${this.scanResult ? this.scanResult.duplicateGroups.length : 0} 组重复文件将被处理。\n\n删除的文件将移入回收站，可以恢复。`
              : `即将删除该组中除 "${this.selectedKeepFile}" 以外的所有文件。\n\n删除的文件将移入回收站，可以恢复。`
          )
            .fontSize(14)
            .fontColor('#666666')
            .textAlign(TextAlign.Center)
            .margin({ bottom: 24 })

          Row({ space: 16 }) {
            Button('取消')
              .onClick(() => {
                this.showConfirmDialog = false;
              })
              .height(44)
              .fontSize(16)
              .backgroundColor('#E0E0E0')
              .fontColor('#333333')
              .borderRadius(8)
              .layoutWeight(1)

            Button('确认删除')
              .onClick(() => {
                if (this.confirmAction === 'dedup_all') {
                  this.performDeduplicateAll();
                } else {
                  this.performDeduplicateGroup();
                }
              })
              .height(44)
              .fontSize(16)
              .backgroundColor('#FF3B30')
              .fontColor(Color.White)
              .borderRadius(8)
              .layoutWeight(1)
          }
          .width('100%')
        }
        .width('85%')
        .padding(24)
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '7.5%', y: '30%' })
      }

      // === 文件内容查看对话框 ===
      if (this.showFileContentDialog) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.showFileContentDialog = false;
          })
          .position({ x: 0, y: 0 })

        Column() {
          // 标题栏
          Row() {
            Text('文件内容')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .layoutWeight(1)

            Button('×')
              .fontSize(24)
              .fontColor('#666666')
              .backgroundColor(Color.Transparent)
              .onClick(() => {
                this.showFileContentDialog = false;
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 15, bottom: 15 })
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })

          // 文件名
          Row() {
            Text('文件名:')
              .fontSize(14)
              .fontColor('#666666')
              .width('20%')
            Text(this.viewingFileName)
              .fontSize(14)
              .fontColor('#007AFF')
              .fontWeight(FontWeight.Medium)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .width('80%')
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 12 })

          // 文件内容
          Scroll() {
            Text(this.viewingFileContent)
              .fontSize(13)
              .fontColor('#333333')
              .fontFamily('monospace')
              .width('100%')
          }
          .width('100%')
          .height(300)
          .padding(16)
          .margin({ left: 20, right: 20, top: 12, bottom: 12 })
          .backgroundColor('#F8F8F8')
          .borderRadius(8)

          // 关闭按钮
          Button('关闭')
            .onClick(() => {
              this.showFileContentDialog = false;
            })
            .width('90%')
            .height(44)
            .fontSize(16)
            .backgroundColor('#007AFF')
            .fontColor(Color.White)
            .borderRadius(10)
            .margin({ bottom: 20 })
        }
        .width('90%')
        .backgroundColor(Color.White)
        .borderRadius(16)
        .position({ x: '5%', y: '10%' })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }

  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
