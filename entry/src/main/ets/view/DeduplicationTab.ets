/*
 * 文件去重页面组件
 */

import { DeduplicationManager, DuplicateGroup, FileItem, ScanResult, DirectoryInfo } from '../common/utils/DeduplicationManager';
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

  // 目录选择
  @State availableDirectories: DirectoryInfo[] = [];
  @State selectedDirectories: string[] = [];

  // 扫描状态
  @State isScanning: boolean = false;
  @State scanProgress: string = '';
  @State hasScanned: boolean = false;

  // 扫描结果
  @State scanResult: ScanResult | null = null;
  @State duplicateGroups: DuplicateGroup[] = [];

  // 消息提示
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: 'success' | 'error' | 'info' = 'info';

  // 确认对话框
  @State showConfirmDialog: boolean = false;
  @State confirmAction: 'deduplicate' | 'delete' | 'clearTest' = 'deduplicate';
  @State pendingDeleteFile: FileItem | null = null;

  // 导入测试文件状态
  @State isImporting: boolean = false;
  @State importedFileCount: number = 0;
  @State testFolderFileCount: number = 0;

  aboutToAppear() {
    let context = this.getUIContext().getHostContext() as Context;
    this.deduplicationManager = new DeduplicationManager(context);
    this.loadDirectories();
    this.updateTestFolderCount();
  }

  // 更新测试文件夹文件数量
  private updateTestFolderCount() {
    if (this.deduplicationManager) {
      this.testFolderFileCount = this.deduplicationManager.getTestFolderFileCount();
    }
  }

  // 加载可用目录
  private loadDirectories() {
    if (this.deduplicationManager) {
      this.availableDirectories = this.deduplicationManager.getAvailableDirectories();
      // 默认选中主目录
      if (this.availableDirectories.length > 0) {
        this.selectedDirectories = [this.availableDirectories[0].path];
        this.availableDirectories[0].selected = true;
      }
    }
  }

  // 切换目录选择
  private toggleDirectorySelection(dir: DirectoryInfo) {
    dir.selected = !dir.selected;
    if (dir.selected) {
      if (!this.selectedDirectories.includes(dir.path)) {
        this.selectedDirectories.push(dir.path);
      }
    } else {
      this.selectedDirectories = this.selectedDirectories.filter(p => p !== dir.path);
    }
    // 触发更新
    this.availableDirectories = [...this.availableDirectories];
  }

  // 导入测试文件
  private async importTestFiles() {
    if (!this.deduplicationManager) return;

    try {
      // 创建文件选择器
      const documentPicker = new picker.DocumentViewPicker();

      // 配置选择选项
      const options = new picker.DocumentSelectOptions();
      options.maxSelectNumber = 100; // 最多选择100个文件

      this.isImporting = true;
      this.importedFileCount = 0;

      // 打开文件选择器
      const result = await documentPicker.select(options);

      if (result && result.length > 0) {
        console.log(`选择了 ${result.length} 个文件`);

        // 确保测试文件夹存在
        this.deduplicationManager.createTestFolder();

        let successCount = 0;
        for (const uri of result) {
          // 从 URI 提取文件名
          const parts = uri.split('/');
          const fileName = parts[parts.length - 1] || `file_${Date.now()}`;

          const success = await this.deduplicationManager.importFileToTestFolder(uri, fileName);
          if (success) {
            successCount++;
          }
        }

        this.importedFileCount = successCount;
        this.updateTestFolderCount();
        this.loadDirectories(); // 刷新目录列表

        if (successCount > 0) {
          this.showToast(`成功导入 ${successCount} 个文件`, 'success');
        } else {
          this.showToast('导入失败', 'error');
        }
      } else {
        this.showToast('未选择任何文件', 'info');
      }
    } catch (error) {
      console.error('导入文件失败:', error);
      this.showToast('导入失败，请重试', 'error');
    } finally {
      this.isImporting = false;
    }
  }

  // 清空测试文件夹
  private prepareClearTestFolder() {
    this.confirmAction = 'clearTest';
    this.showConfirmDialog = true;
  }

  private executeClearTestFolder() {
    if (!this.deduplicationManager) return;

    const deletedCount = this.deduplicationManager.clearTestFolder();
    this.showConfirmDialog = false;
    this.updateTestFolderCount();
    this.loadDirectories();

    if (deletedCount > 0) {
      this.showToast(`已清空 ${deletedCount} 个测试文件`, 'success');
    } else {
      this.showToast('测试文件夹已为空', 'info');
    }
  }

  // 开始扫描
  private async startScan() {
    if (!this.deduplicationManager || this.selectedDirectories.length === 0) {
      this.showToast('请先选择要扫描的目录', 'error');
      return;
    }

    this.isScanning = true;
    this.scanProgress = '正在扫描文件...';
    this.hasScanned = false;

    try {
      const result = await this.deduplicationManager.scanForDuplicates(this.selectedDirectories);
      this.scanResult = result;
      this.duplicateGroups = this.deduplicationManager.getDuplicateGroups();
      this.hasScanned = true;

      if (result.duplicateGroups === 0) {
        this.showToast('未发现重复文件', 'info');
      } else {
        this.showToast(`发现 ${result.duplicateGroups} 组重复文件`, 'success');
      }
    } catch (error) {
      console.error('扫描失败:', error);
      this.showToast('扫描失败，请重试', 'error');
    } finally {
      this.isScanning = false;
      this.scanProgress = '';
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
    this.duplicateGroups = [...this.duplicateGroups];
  }

  // 一键去重准备
  private prepareAutoDeduplicate() {
    if (!this.deduplicationManager || this.duplicateGroups.length === 0) {
      return;
    }
    this.deduplicationManager.autoSelectForDeduplicate();
    this.duplicateGroups = [...this.deduplicationManager.getDuplicateGroups()];
    this.confirmAction = 'deduplicate';
    this.showConfirmDialog = true;
  }

  // 执行去重
  private executeDeduplicate() {
    if (!this.deduplicationManager) return;

    const deletedCount = this.deduplicationManager.executeDeduplicate();
    this.showConfirmDialog = false;

    if (deletedCount > 0) {
      this.showToast(`成功删除 ${deletedCount} 个重复文件`, 'success');
      // 重新扫描以刷新结果
      this.startScan();
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
  private confirmDeleteOneFile() {
    if (!this.deduplicationManager || !this.pendingDeleteFile) return;

    const success = this.deduplicationManager.deleteFile(this.pendingDeleteFile.path);
    this.showConfirmDialog = false;

    if (success) {
      this.showToast(`已删除: ${this.pendingDeleteFile.filename}`, 'success');
      // 重新扫描以刷新结果
      this.startScan();
    } else {
      this.showToast('删除失败', 'error');
    }

    this.pendingDeleteFile = null;
  }

  // 显示提示消息
  private showToast(message: string, type: 'success' | 'error' | 'info') {
    this.messageText = message;
    this.messageType = type;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  // 获取消息背景色
  private getMessageColor(): string {
    switch (this.messageType) {
      case 'success': return '#34C759';
      case 'error': return '#FF3B30';
      case 'info': return '#007AFF';
    }
  }

  // 获取保留文件数和删除文件数
  private getDeduplicateStats(): DeduplicateStats {
    let keep = 0;
    let del = 0;
    let saveSpace = 0;

    for (const group of this.duplicateGroups) {
      for (const file of group.files) {
        if (file.selected) {
          keep++;
        } else {
          del++;
          saveSpace += file.size;
        }
      }
    }

    const result: DeduplicateStats = {
      keep: keep,
      deleteCount: del,
      saveSpace: saveSpace
    };
    return result;
  }

  build() {
    Stack() {
      Column() {
        // === 顶部标题栏 ===
        Row() {
          Text('📁 文件去重')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 12, bottom: 8 })

        // === 消息提示 ===
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
            // === 导入测试数据区域 ===
            Column() {
              Row() {
                Text('📥 导入测试数据')
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#333333')
                  .layoutWeight(1)

                if (this.testFolderFileCount > 0) {
                  Text(`已导入 ${this.testFolderFileCount} 个文件`)
                    .fontSize(12)
                    .fontColor('#34C759')
                    .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                    .backgroundColor('#E8F5E9')
                    .borderRadius(10)
                }
              }
              .width('100%')
              .margin({ bottom: 10 })

              Text('从设备选择测试文件导入到应用中，用于去重测试验证')
                .fontSize(13)
                .fontColor('#666666')
                .width('100%')
                .margin({ bottom: 12 })

              Row() {
                Button(this.isImporting ? '导入中...' : '选择文件导入')
                  .layoutWeight(1)
                  .height(40)
                  .fontSize(14)
                  .fontColor('#FFFFFF')
                  .backgroundColor(this.isImporting ? '#999999' : '#5856D6')
                  .borderRadius(10)
                  .enabled(!this.isImporting)
                  .onClick(() => {
                    this.importTestFiles();
                  })

                if (this.testFolderFileCount > 0) {
                  Button('清空')
                    .width(70)
                    .height(40)
                    .fontSize(14)
                    .fontColor('#FFFFFF')
                    .backgroundColor('#FF3B30')
                    .borderRadius(10)
                    .margin({ left: 10 })
                    .onClick(() => {
                      this.prepareClearTestFolder();
                    })
                }
              }
              .width('100%')
            }
            .width('100%')
            .padding(16)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .margin({ left: 12, right: 12, top: 8, bottom: 8 })

            // === 目录选择区域 ===
            Column() {
              Text('选择扫描目录')
                .fontSize(16)
                .fontWeight(FontWeight.Medium)
                .fontColor('#333333')
                .width('100%')
                .margin({ bottom: 10 })

              if (this.availableDirectories.length === 0) {
                Text('暂无可扫描目录')
                  .fontSize(14)
                  .fontColor('#999999')
                  .padding(20)
              } else {
                ForEach(this.availableDirectories, (dir: DirectoryInfo) => {
                  Row() {
                    Checkbox()
                      .select(dir.selected)
                      .onChange((value: boolean) => {
                        this.toggleDirectorySelection(dir);
                      })
                      .margin({ right: 10 })

                    Column() {
                      Text(dir.name)
                        .fontSize(14)
                        .fontWeight(FontWeight.Medium)
                        .fontColor('#333333')
                      Text(dir.path)
                        .fontSize(11)
                        .fontColor('#999999')
                        .maxLines(1)
                        .textOverflow({ overflow: TextOverflow.Ellipsis })
                    }
                    .alignItems(HorizontalAlign.Start)
                    .layoutWeight(1)
                  }
                  .width('100%')
                  .padding({ top: 8, bottom: 8 })
                  .onClick(() => {
                    this.toggleDirectorySelection(dir);
                  })
                })
              }

              // 扫描按钮
              Button(this.isScanning ? '扫描中...' : '开始扫描')
                .width('100%')
                .height(44)
                .fontSize(16)
                .fontColor('#FFFFFF')
                .backgroundColor(this.isScanning ? '#999999' : '#007AFF')
                .borderRadius(10)
                .margin({ top: 12 })
                .enabled(!this.isScanning)
                .onClick(() => {
                  this.startScan();
                })

              if (this.isScanning) {
                Text(this.scanProgress)
                  .fontSize(13)
                  .fontColor('#666666')
                  .margin({ top: 8 })
              }
            }
            .width('100%')
            .padding(16)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .margin({ left: 12, right: 12, top: 8, bottom: 8 })

            // === 扫描结果统计 ===
            if (this.hasScanned && this.scanResult) {
              Column() {
                Text('扫描结果')
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#333333')
                  .width('100%')
                  .margin({ bottom: 10 })

                Row() {
                  this.StatCard('总文件', `${this.scanResult.totalFiles}`, '#007AFF')
                  this.StatCard('重复组', `${this.scanResult.duplicateGroups}`, '#FF9500')
                  this.StatCard('可节省', this.scanResult.savableSpaceReadable, '#34C759')
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

            // === 重复文件组列表 ===
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
                    .onClick(() => {
                      this.prepareAutoDeduplicate();
                    })
                }
                .width('100%')
                .margin({ bottom: 12 })

                ForEach(this.duplicateGroups, (group: DuplicateGroup) => {
                  Column() {
                    // 组头部
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
                    .onClick(() => {
                      this.toggleGroupExpanded(group);
                    })

                    // 文件列表（展开时显示）
                    if (group.expanded) {
                      Column() {
                        ForEach(group.files, (file: FileItem) => {
                          Row() {
                            Checkbox()
                              .select(file.selected)
                              .onChange(() => {
                                this.toggleFileSelection(group, file);
                              })
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
                                .onClick(() => {
                                  this.deleteOneFile(file);
                                })
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

            // === 无重复文件提示 ===
            if (this.hasScanned && this.duplicateGroups.length === 0) {
              Column() {
                Text('✅')
                  .fontSize(48)
                  .margin({ bottom: 12 })
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

      // === 确认对话框 ===
      if (this.showConfirmDialog) {
        Stack() {
          // 背景遮罩
          Column()
            .width('100%')
            .height('100%')
            .backgroundColor('rgba(0, 0, 0, 0.5)')
            .onClick(() => {
              this.showConfirmDialog = false;
            })

          // 对话框内容
          Column() {
            Text(this.confirmAction === 'deduplicate' ? '确认一键去重' :
                 this.confirmAction === 'clearTest' ? '确认清空测试数据' : '确认删除')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .margin({ bottom: 16 })

            if (this.confirmAction === 'deduplicate') {
              Column() {
                Text(`即将删除 ${this.getDeduplicateStats().deleteCount} 个重复文件`)
                  .fontSize(14)
                  .fontColor('#666666')
                Text(`保留 ${this.getDeduplicateStats().keep} 个文件`)
                  .fontSize(14)
                  .fontColor('#666666')
                Text(`可节省空间: ${this.scanResult?.savableSpaceReadable || '0 B'}`)
                  .fontSize(14)
                  .fontColor('#34C759')
                  .margin({ top: 8 })
              }
              .margin({ bottom: 20 })
            } else if (this.confirmAction === 'clearTest') {
              Text(`确定清空测试文件夹中的 ${this.testFolderFileCount} 个文件吗？`)
                .fontSize(14)
                .fontColor('#666666')
                .margin({ bottom: 20 })
            } else if (this.pendingDeleteFile) {
              Text(`确定删除文件 "${this.pendingDeleteFile.filename}" 吗？`)
                .fontSize(14)
                .fontColor('#666666')
                .margin({ bottom: 20 })
            }

            Text('⚠️ 此操作不可恢复！')
              .fontSize(13)
              .fontColor('#FF3B30')
              .margin({ bottom: 20 })

            Row() {
              Button('取消')
                .width('45%')
                .height(44)
                .fontSize(15)
                .fontColor('#333333')
                .backgroundColor('#E5E5E5')
                .borderRadius(10)
                .onClick(() => {
                  this.showConfirmDialog = false;
                  this.pendingDeleteFile = null;
                })

              Button('确认')
                .width('45%')
                .height(44)
                .fontSize(15)
                .fontColor('#FFFFFF')
                .backgroundColor('#FF3B30')
                .borderRadius(10)
                .onClick(() => {
                  if (this.confirmAction === 'deduplicate') {
                    this.executeDeduplicate();
                  } else if (this.confirmAction === 'clearTest') {
                    this.executeClearTestFolder();
                  } else {
                    this.confirmDeleteOneFile();
                  }
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
      Text(value)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(color)
      Text(label)
        .fontSize(12)
        .fontColor('#999999')
        .margin({ top: 4 })
    }
    .padding({ top: 12, bottom: 12, left: 16, right: 16 })
    .backgroundColor('#F8F8F8')
    .borderRadius(10)
    .width('30%')
  }
}
