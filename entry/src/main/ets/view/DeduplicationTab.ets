/*
 * 文件去重页面组件 - 完整版（支持回滚和增量扫描）
 */

import { DeduplicationManager, DuplicateGroup, FileItem, ImportDirectoryResult, IncrementalScanResult, TrashItem } from '../common/utils/DeduplicationManager';
import { picker } from '@kit.CoreFileKit';

// 去重统计信息接口
interface DeduplicateStats {
  keep: number;
  deleteCount: number;
  saveSpace: number;
}

@Component
export struct DeduplicationTab {
  // 去重管理器
  @State deduplicationManager: DeduplicationManager | null = null;

  // 扫描状态
  @State isScanning: boolean = false;
  @State hasScanned: boolean = false;
  @State refreshKey: number = 0; // 强制刷新

  // 扫描结果
  @State totalFilesCount: number = 0;
  @State duplicateGroupsCount: number = 0;
  @State savableSpaceText: string = '0 B';
  @State duplicateGroups: DuplicateGroup[] = [];

  // 增量扫描信息
  @State lastScanTimeText: string = '从未扫描';
  @State isIncrementalScan: boolean = false;
  @State scannedFilesCount: number = 0;
  @State newDuplicateGroupsCount: number = 0;

  // 回收站
  @State showTrashPanel: boolean = false;
  @State trashItems: TrashItem[] = [];

  // 文件导入
  @State isImporting: boolean = false;

  // 消息提示
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: 'success' | 'error' | 'info' = 'info';

  // 确认对话框
  @State showConfirmDialog: boolean = false;
  @State confirmAction: 'deduplicate' | 'delete' | 'clearTrash' = 'deduplicate';
  @State pendingDeleteFile: FileItem | null = null;
  @State pendingTrashItem: TrashItem | null = null;

  aboutToAppear() {
    let context = this.getUIContext().getHostContext() as Context;
    this.deduplicationManager = new DeduplicationManager(context);
    this.updateLastScanTime();
    this.loadTrashItems();
  }

  private updateLastScanTime() {
    if (this.deduplicationManager) {
      this.lastScanTimeText = this.deduplicationManager.getLastScanTimeReadable();
    }
  }

  private loadTrashItems() {
    if (this.deduplicationManager) {
      this.trashItems = [...this.deduplicationManager.getTrashItems()];
    }
  }

  // 开始扫描
  private async startScan(incremental: boolean = false) {
    if (!this.deduplicationManager) {
      this.showToast('初始化失败', 'error');
      return;
    }

    this.isScanning = true;
    this.hasScanned = false;

    // 重置状态（仅全量扫描）
    if (!incremental) {
      this.totalFilesCount = 0;
      this.duplicateGroupsCount = 0;
      this.savableSpaceText = '0 B';
      this.duplicateGroups = [];
      this.deduplicationManager.clearResults();
    }

    try {
      const result = await this.deduplicationManager.scanFilesDir(incremental);

      // 更新状态变量
      this.totalFilesCount = result.totalFiles;
      this.duplicateGroupsCount = result.duplicateGroups;
      this.savableSpaceText = result.savableSpaceReadable;
      this.isIncrementalScan = result.isIncremental;
      this.scannedFilesCount = result.scannedFiles;
      this.newDuplicateGroupsCount = result.newDuplicateGroups;

      // 获取重复组数组
      const groups = this.deduplicationManager.getDuplicateGroups();
      this.duplicateGroups = [...groups];

      this.hasScanned = true;
      this.updateLastScanTime();

      if (result.duplicateGroups === 0) {
        this.showToast('未发现重复文件', 'info');
      } else if (incremental && result.scannedFiles === 0) {
        this.showToast('没有变更文件', 'info');
      } else if (incremental) {
        this.showToast(`增量扫描完成，新增 ${result.newDuplicateGroups} 组重复`, 'success');
      } else {
        this.showToast(`发现 ${result.duplicateGroups} 组重复文件`, 'success');
      }
    } catch (error) {
      console.error('扫描失败:', error);
      this.showToast('扫描失败，请重试', 'error');
    } finally {
      this.isScanning = false;
    }
  }

  // 切换组展开状态
  private toggleGroupExpanded(group: DuplicateGroup) {
    group.expanded = !group.expanded;
    this.duplicateGroups = [...this.duplicateGroups];
  }

  // 切换文件选中状态
  private toggleFileSelection(group: DuplicateGroup, file: FileItem) {
    file.selected = !file.selected;
    if (!file.selected) {
      const selectedCount = group.files.filter(item => item.selected).length;
      if (selectedCount === 0) {
        file.selected = true;
        this.showToast('每组至少保留一个文件', 'info');
        return;
      }
    }
    this.duplicateGroups = [...this.duplicateGroups];
  }

  // 一键去重准备
  private prepareAutoDeduplicate() {
    if (!this.deduplicationManager || this.duplicateGroups.length === 0) return;
    this.deduplicationManager.autoSelectForDeduplicate();
    this.duplicateGroups = [...this.deduplicationManager.getDuplicateGroups()];
    this.confirmAction = 'deduplicate';
    this.showConfirmDialog = true;
  }

  // 执行去重
  private async executeDeduplicate() {
    if (!this.deduplicationManager) return;

    const deletedCount = this.deduplicationManager.executeDeduplicate();
    this.showConfirmDialog = false;

    if (deletedCount > 0) {
      this.showToast(`已移动 ${deletedCount} 个文件到回收站`, 'success');
      this.loadTrashItems();
      await this.startScan(false);
    } else {
      this.showToast('没有文件被删除', 'info');
    }
  }

  // 手动删除单个文件
  private deleteOneFile(file: FileItem) {
    this.pendingDeleteFile = file;
    this.confirmAction = 'delete';
    this.showConfirmDialog = true;
  }

  // 确认删除单个文件
  private async confirmDeleteOneFile() {
    if (!this.deduplicationManager || !this.pendingDeleteFile) return;

    const success = this.deduplicationManager.deleteFile(this.pendingDeleteFile.path);
    this.showConfirmDialog = false;

    if (success) {
      this.showToast(`已移动到回收站: ${this.pendingDeleteFile.filename}`, 'success');
      this.loadTrashItems();
      await this.startScan(false);
    } else {
      this.showToast('删除失败', 'error');
    }

    this.pendingDeleteFile = null;
  }

  // 恢复文件
  private async restoreFile(item: TrashItem) {
    if (!this.deduplicationManager) return;

    const success = this.deduplicationManager.restoreFromTrash(item);
    if (success) {
      this.showToast(`已恢复: ${item.filename}`, 'success');
      this.loadTrashItems();
      await this.startScan(false);
    } else {
      this.showToast('恢复失败', 'error');
    }
  }

  // 永久删除单个
  private permanentDeleteOne(item: TrashItem) {
    if (!this.deduplicationManager) return;

    const success = this.deduplicationManager.permanentDelete(item);
    if (success) {
      this.showToast(`已永久删除: ${item.filename}`, 'success');
      this.loadTrashItems();
    } else {
      this.showToast('删除失败', 'error');
    }
  }

  // 清空回收站
  private clearTrash() {
    if (!this.deduplicationManager) return;

    const count = this.deduplicationManager.clearTrash();
    this.showConfirmDialog = false;
    this.loadTrashItems();

    if (count > 0) {
      this.showToast(`已永久删除 ${count} 个文件`, 'success');
    }
  }

  // 导入文件
  private async importFiles() {
    if (!this.deduplicationManager) return;

    this.isImporting = true;

    try {
      const documentPicker = new picker.DocumentViewPicker();
      const selectOptions = new picker.DocumentSelectOptions();
      selectOptions.maxSelectNumber = 100;

      const uris = await documentPicker.select(selectOptions);

      if (uris && uris.length > 0) {
        let successCount = 0;
        for (const uri of uris) {
          const filename = uri.split('/').pop() || `file_${Date.now()}`;
          const success = await this.deduplicationManager.importFileToFilesDir(uri, filename);
          if (success) successCount++;
        }
        this.showToast(`成功导入 ${successCount} 个文件`, 'success');
        // 重新扫描
        this.refreshKey++;
        await this.startScan(false);
      }
    } catch (error) {
      console.error('导入文件失败:', error);
      this.showToast('导入失败', 'error');
    } finally {
      this.isImporting = false;
    }
  }

  // 导入文件夹
  private async importFolder() {
    if (!this.deduplicationManager) return;

    this.isImporting = true;

    try {
      const documentPicker = new picker.DocumentViewPicker();
      const selectOptions = new picker.DocumentSelectOptions();
      selectOptions.maxSelectNumber = 200;

      const uris = await documentPicker.select(selectOptions);
      if (uris && uris.length > 0) {
        let total: ImportDirectoryResult = { totalFiles: 0, importedFiles: 0, skippedFiles: 0 };
        let hasImport = false;

        for (const uri of uris) {
          const dirResult: ImportDirectoryResult | null = await this.deduplicationManager.importDirectoryToFilesDir(uri);
          if (dirResult) {
            total.totalFiles += dirResult.totalFiles;
            total.importedFiles += dirResult.importedFiles;
            total.skippedFiles += dirResult.skippedFiles;
            hasImport = true;
            continue;
          }

          const filename = uri.split('/').pop() || `file_${Date.now()}`;
          const success = await this.deduplicationManager.importFileToFilesDir(uri, filename);
          total.totalFiles += 1;
          if (success) total.importedFiles += 1;
          else total.skippedFiles += 1;
          hasImport = true;
        }

        if (!hasImport) {
          this.showToast('请选择文件夹', 'info');
          return;
        }

        const summary = total.skippedFiles > 0 ? `，失败 ${total.skippedFiles} 个` : '';
        this.showToast(`成功导入 ${total.importedFiles}/${total.totalFiles} 个文件${summary}`, 'success');

        this.refreshKey++;
        await this.startScan(false);
      }
    } catch (error) {
      console.error('导入文件夹失败:', error);
      this.showToast('导入失败', 'error');
    } finally {
      this.isImporting = false;
    }
  }

  // 显示提示消息
  private showToast(message: string, type: 'success' | 'error' | 'info') {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;
    setTimeout(() => { this.showMessage = false; }, 3000);
  }

  private getMessageColor(): string {
    switch (this.messageType) {
      case 'success': return '#34C759';
      case 'error': return '#FF3B30';
      default: return '#007AFF';
    }
  }

  private getDeduplicateStats(): DeduplicateStats {
    let keep = 0, del = 0, saveSpace = 0;
    for (const group of this.duplicateGroups) {
      for (const file of group.files) {
        if (file.selected) keep++;
        else { del++; saveSpace += file.size; }
      }
    }
    return { keep, deleteCount: del, saveSpace };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  build() {
    Stack() {
      Column() {
        // 标题栏
        Row() {
          Text('📁 文件去重')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .layoutWeight(1)

          // 回收站按钮
          Button('🗑️ 回收站' + (this.trashItems.length > 0 ? ` (${this.trashItems.length})` : ''))
            .height(32)
            .fontSize(12)
            .fontColor(this.trashItems.length > 0 ? '#FF9500' : '#666666')
            .backgroundColor('#F0F0F0')
            .borderRadius(16)
            .onClick(() => {
              this.loadTrashItems();
              this.showTrashPanel = true;
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 12, bottom: 8 })

        // 消息提示
        if (this.showMessage) {
          Text(this.messageText)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor(this.getMessageColor())
            .padding({ left: 16, right: 16, top: 8, bottom: 8 })
            .borderRadius(8)
            .margin({ left: 16, right: 16, bottom: 8 })
        }

        Scroll() {
          Column() {
            // 扫描操作区域
            Column() {
              Row() {
                Text('上次扫描: ')
                  .fontSize(13)
                  .fontColor('#999999')
                Text(this.lastScanTimeText)
                  .fontSize(13)
                  .fontColor('#666666')
              }
              .width('100%')
              .margin({ bottom: 12 })

              Row() {
                Button(this.isScanning ? '扫描中...' : '全量扫描')
                  .layoutWeight(1)
                  .height(44)
                  .fontSize(15)
                  .fontColor('#FFFFFF')
                  .backgroundColor(this.isScanning ? '#999999' : '#007AFF')
                  .borderRadius(10)
                  .enabled(!this.isScanning)
                  .onClick(() => { this.startScan(false); })

                Button('增量扫描')
                  .layoutWeight(1)
                  .height(44)
                  .fontSize(15)
                  .fontColor('#FFFFFF')
                  .backgroundColor(this.isScanning ? '#999999' : '#34C759')
                  .borderRadius(10)
                  .enabled(!this.isScanning && this.deduplicationManager?.getLastScanTime() !== 0)
                  .margin({ left: 12 })
                  .onClick(() => { this.startScan(true); })
              }
              .width('100%')

              // 导入文件按钮
              Button(this.isImporting ? '导入中...' : '📥 导入本地文件')
                .width('100%')
                .height(40)
                .fontSize(14)
                .fontColor('#007AFF')
                .backgroundColor('#E8F4FF')
                .borderRadius(10)
                .margin({ top: 12 })
                .enabled(!this.isImporting && !this.isScanning)
                .onClick(() => { this.importFiles(); })

              Button(this.isImporting ? '导入中...' : '📂 导入本地文件夹')
                .width('100%')
                .height(40)
                .fontSize(14)
                .fontColor('#FF9500')
                .backgroundColor('#FFF4E5')
                .borderRadius(10)
                .margin({ top: 8 })
                .enabled(!this.isImporting && !this.isScanning)
                .onClick(() => { this.importFolder(); })

              if (this.isIncrementalScan && this.hasScanned) {
                Text(`📊 本次仅扫描变更文件 (${this.scannedFilesCount} 个)，新增重复 ${this.newDuplicateGroupsCount} 组`)
                  .fontSize(12)
                  .fontColor('#34C759')
                  .margin({ top: 10 })
              }
            }
            .width('100%')
            .padding(16)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .margin({ left: 12, right: 12, top: 8, bottom: 8 })

            // 扫描结果统计
            if (this.hasScanned) {
              Column() {
                Text('扫描结果')
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#333333')
                  .width('100%')
                  .margin({ bottom: 10 })

                Row() {
                  this.StatCard('总文件', `${this.totalFilesCount}`, '#007AFF')
                  this.StatCard('重复组', `${this.duplicateGroupsCount}`, '#FF9500')
                  this.StatCard('可节省', this.savableSpaceText, '#34C759')
                }
                .width('100%')
                .justifyContent(FlexAlign.SpaceBetween)
              }
              .width('100%')
              .padding(16)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .margin({ left: 12, right: 12, bottom: 8 })
            }

            // 重复文件组列表
            if (this.hasScanned && this.duplicateGroups.length > 0) {
              Column() {
                Row() {
                  Text('重复文件组')
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333333')
                    .layoutWeight(1)

                  Button('一键去重')
                    .height(32)
                    .fontSize(13)
                    .fontColor('#FFFFFF')
                    .backgroundColor('#FF3B30')
                    .borderRadius(16)
                    .onClick(() => { this.prepareAutoDeduplicate(); })
                }
                .width('100%')
                .margin({ bottom: 12 })

                ForEach(this.duplicateGroups, (group: DuplicateGroup) => {
                  Column() {
                    Row() {
                      Text(group.expanded ? '▼' : '▶')
                        .fontSize(14)
                        .fontColor('#666666')
                        .margin({ right: 8 })

                      Column() {
                        Row() {
                          Text(`${group.files.length} 个相同文件`)
                            .fontSize(14)
                            .fontWeight(FontWeight.Medium)
                            .fontColor('#333333')
                          Text(`(${group.sizeReadable})`)
                            .fontSize(12)
                            .fontColor('#999999')
                            .margin({ left: 8 })
                        }
                        Text(`哈希: ${group.hash.substring(0, 16)}...`)
                          .fontSize(11)
                          .fontColor('#AAAAAA')
                      }
                      .alignItems(HorizontalAlign.Start)
                      .layoutWeight(1)
                    }
                    .width('100%')
                    .padding(12)
                    .onClick(() => { this.toggleGroupExpanded(group); })

                    if (group.expanded) {
                      Column() {
                        ForEach(group.files, (file: FileItem) => {
                          Row() {
                            Checkbox()
                              .select(file.selected)
                              .onChange(() => { this.toggleFileSelection(group, file); })
                              .margin({ right: 10 })

                            Column() {
                              Text(file.filename)
                                .fontSize(13)
                                .fontWeight(FontWeight.Medium)
                                .fontColor(file.selected ? '#007AFF' : '#333333')
                                .maxLines(1)
                                .textOverflow({ overflow: TextOverflow.Ellipsis })
                              Text(file.path)
                                .fontSize(10)
                                .fontColor('#999999')
                                .maxLines(1)
                                .textOverflow({ overflow: TextOverflow.Ellipsis })
                            }
                            .alignItems(HorizontalAlign.Start)
                            .layoutWeight(1)

                            if (file.selected) {
                              Text('保留')
                                .fontSize(11)
                                .fontColor('#FFFFFF')
                                .backgroundColor('#34C759')
                                .padding({ left: 8, right: 8, top: 3, bottom: 3 })
                                .borderRadius(10)
                            } else {
                              Button('删除')
                                .height(26)
                                .fontSize(11)
                                .fontColor('#FFFFFF')
                                .backgroundColor('#FF3B30')
                                .borderRadius(13)
                                .onClick(() => { this.deleteOneFile(file); })
                            }
                          }
                          .width('100%')
                          .padding({ left: 12, right: 12, top: 8, bottom: 8 })
                          .backgroundColor(file.selected ? '#F0F8FF' : '#FAFAFA')
                          .borderRadius(8)
                          .margin({ bottom: 4 })
                        })
                      }
                      .padding({ left: 12, right: 12, bottom: 12 })
                    }
                  }
                  .width('100%')
                  .backgroundColor('#FFFAF0')
                  .border({ width: 1, color: '#FF9500', radius: 10 })
                  .margin({ bottom: 10 })
                })
              }
              .width('100%')
              .padding(16)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .margin({ left: 12, right: 12, bottom: 100 })
            }

            // 无重复文件提示
            if (this.hasScanned && this.duplicateGroups.length === 0) {
              Column() {
                Text('✅').fontSize(48).margin({ bottom: 12 })
                Text('太棒了！没有发现重复文件')
                  .fontSize(16)
                  .fontColor('#34C759')
                  .fontWeight(FontWeight.Medium)
              }
              .width('100%')
              .padding(40)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .margin({ left: 12, right: 12, bottom: 8 })
            }
          }
        }
        .layoutWeight(1)
        .scrollBar(BarState.Off)
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#F5F5F5')

      // 回收站面板
      if (this.showTrashPanel) {
        Stack() {
          Column()
            .width('100%')
            .height('100%')
            .backgroundColor('rgba(0,0,0,0.5)')
            .onClick(() => { this.showTrashPanel = false; })

          Column() {
            Row() {
              Text('🗑️ 回收站')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor('#333333')
                .layoutWeight(1)

              if (this.trashItems.length > 0) {
                Button('清空')
                  .height(28)
                  .fontSize(12)
                  .fontColor('#FF3B30')
                  .backgroundColor('#FFF0F0')
                  .borderRadius(14)
                  .onClick(() => {
                    this.confirmAction = 'clearTrash';
                    this.showConfirmDialog = true;
                  })
              }

              Text('✕')
                .fontSize(20)
                .fontColor('#999999')
                .margin({ left: 12 })
                .onClick(() => { this.showTrashPanel = false; })
            }
            .width('100%')
            .padding(16)

            if (this.trashItems.length === 0) {
              Column() {
                Text('📭').fontSize(48).margin({ bottom: 12 })
                Text('回收站为空').fontSize(14).fontColor('#999999')
              }
              .width('100%')
              .padding(40)
            } else {
              Scroll() {
                Column() {
                  ForEach(this.trashItems, (item: TrashItem) => {
                    Row() {
                      Column() {
                        Text(item.filename)
                          .fontSize(14)
                          .fontColor('#333333')
                          .maxLines(1)
                          .textOverflow({ overflow: TextOverflow.Ellipsis })
                        Text(`${item.sizeReadable} · 删除于 ${item.deleteTimeReadable}`)
                          .fontSize(11)
                          .fontColor('#999999')
                      }
                      .alignItems(HorizontalAlign.Start)
                      .layoutWeight(1)

                      Button('恢复')
                        .height(28)
                        .fontSize(12)
                        .fontColor('#34C759')
                        .backgroundColor('#F0FFF0')
                        .borderRadius(14)
                        .onClick(() => { this.restoreFile(item); })

                      Button('删除')
                        .height(28)
                        .fontSize(12)
                        .fontColor('#FF3B30')
                        .backgroundColor('#FFF0F0')
                        .borderRadius(14)
                        .margin({ left: 8 })
                        .onClick(() => { this.permanentDeleteOne(item); })
                    }
                    .width('100%')
                    .padding(12)
                    .backgroundColor('#FAFAFA')
                    .borderRadius(8)
                    .margin({ bottom: 8, left: 16, right: 16 })
                  })
                }
              }
              .layoutWeight(1)
            }
          }
          .width('90%')
          .height('70%')
          .backgroundColor('#FFFFFF')
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
      }

      // 确认对话框
      if (this.showConfirmDialog) {
        Stack() {
          Column()
            .width('100%')
            .height('100%')
            .backgroundColor('rgba(0,0,0,0.5)')
            .onClick(() => { this.showConfirmDialog = false; })

          Column() {
            Text(this.confirmAction === 'deduplicate' ? '确认一键去重' :
                 this.confirmAction === 'clearTrash' ? '确认清空回收站' : '确认删除')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .margin({ bottom: 16 })

            if (this.confirmAction === 'deduplicate') {
              Column() {
                Text(`将移动 ${this.getDeduplicateStats().deleteCount} 个重复文件到回收站`)
                  .fontSize(14).fontColor('#666666')
                Text(`保留 ${this.getDeduplicateStats().keep} 个文件`)
                  .fontSize(14).fontColor('#666666')
                Text(`可节省空间: ${this.formatFileSize(this.getDeduplicateStats().saveSpace)}`)
                  .fontSize(14).fontColor('#34C759').margin({ top: 8 })
              }.margin({ bottom: 20 })
            } else if (this.confirmAction === 'clearTrash') {
              Text(`将永久删除回收站中的 ${this.trashItems.length} 个文件`)
                .fontSize(14).fontColor('#666666').margin({ bottom: 20 })
            } else if (this.pendingDeleteFile) {
              Text(`确定删除 "${this.pendingDeleteFile.filename}" 吗？`)
                .fontSize(14).fontColor('#666666').margin({ bottom: 20 })
            }

            Text(this.confirmAction === 'clearTrash' ? '⚠️ 此操作不可恢复！' : '💡 可在回收站中恢复')
              .fontSize(13)
              .fontColor(this.confirmAction === 'clearTrash' ? '#FF3B30' : '#999999')
              .margin({ bottom: 20 })

            Row() {
              Button('取消')
                .width('45%')
                .height(44)
                .fontSize(15)
                .fontColor('#333333')
                .backgroundColor('#E5E5E5')
                .borderRadius(10)
                .onClick(() => { this.showConfirmDialog = false; this.pendingDeleteFile = null; })

              Button('确认')
                .width('45%')
                .height(44)
                .fontSize(15)
                .fontColor('#FFFFFF')
                .backgroundColor('#FF3B30')
                .borderRadius(10)
                .onClick(async () => {
                  if (this.confirmAction === 'deduplicate') await this.executeDeduplicate();
                  else if (this.confirmAction === 'clearTrash') this.clearTrash();
                  else await this.confirmDeleteOneFile();
                })
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
          }
          .width('85%')
          .padding(24)
          .backgroundColor('#FFFFFF')
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  StatCard(label: string, value: string, color: string) {
    Column() {
      Text(value).fontSize(18).fontWeight(FontWeight.Bold).fontColor(color)
      Text(label).fontSize(12).fontColor('#999999').margin({ top: 4 })
    }
    .padding({ top: 12, bottom: 12, left: 16, right: 16 })
    .backgroundColor('#F8F8F8')
    .borderRadius(10)
    .width('30%')
  }
}
