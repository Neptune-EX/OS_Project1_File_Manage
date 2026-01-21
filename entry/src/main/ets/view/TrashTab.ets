/*
 * 回收站Tab页面 - 实现已删除文件的查看和恢复功能
 */

import { TrashManager, TrashFileInfo } from '../common/utils/TrashManager';

@Component
export struct TrashTab {
  @State trashFiles: TrashFileInfo[] = [];
  @State showMessage: boolean = false;
  @State messageText: string = '';
  @State messageType: string = 'success';
  @State showConfirmDialog: boolean = false;
  @State confirmAction: string = ''; // 'empty' | 'delete' | 'restore_all'
  @State selectedTrashName: string = '';
  @State isLoading: boolean = false;

  private trashManager: TrashManager | null = null;

  aboutToAppear() {
    const context = this.getUIContext().getHostContext() as Context;
    this.trashManager = TrashManager.getInstance(context);
    this.loadTrashFiles();
  }

  // 加载回收站文件
  private loadTrashFiles() {
    if (this.trashManager) {
      this.trashFiles = this.trashManager.getTrashFiles();
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

  // 恢复单个文件
  private restoreFile(trashName: string) {
    if (!this.trashManager) return;

    const success = this.trashManager.restoreFile(trashName);
    if (success) {
      this.showToast('文件已恢复', 'success');
      this.loadTrashFiles();
    } else {
      this.showToast('恢复失败', 'error');
    }
  }

  // 永久删除单个文件
  private permanentDelete(trashName: string) {
    if (!this.trashManager) return;

    const success = this.trashManager.permanentDelete(trashName);
    if (success) {
      this.showToast('文件已永久删除', 'success');
      this.loadTrashFiles();
    } else {
      this.showToast('删除失败', 'error');
    }
    this.showConfirmDialog = false;
  }

  // 恢复所有文件
  private restoreAll() {
    if (!this.trashManager) return;

    const restoredCount = this.trashManager.restoreAll();
    this.showToast(`已恢复 ${restoredCount} 个文件`, 'success');
    this.loadTrashFiles();
    this.showConfirmDialog = false;
  }

  // 清空回收站
  private emptyTrash() {
    if (!this.trashManager) return;

    const success = this.trashManager.emptyTrash();
    if (success) {
      this.showToast('回收站已清空', 'success');
      this.loadTrashFiles();
    } else {
      this.showToast('清空失败', 'error');
    }
    this.showConfirmDialog = false;
  }

  // 获取删除来源文字
  private getSourceText(source: string): string {
    switch (source) {
      case 'manual':
        return '手动删除';
      case 'dedup':
        return '去重删除';
      default:
        return '删除';
    }
  }

  // 获取删除来源颜色
  private getSourceColor(source: string): string {
    switch (source) {
      case 'manual':
        return '#007AFF';
      case 'dedup':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  }

  build() {
    Column() {
      // === 顶部标题 ===
      Column() {
        Text('回收站')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 4 })

        Text(`共 ${this.trashFiles.length} 个文件`)
          .fontSize(12)
          .fontColor('#8E8E93')
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })
      .alignItems(HorizontalAlign.Start)

      // === 操作按钮区 ===
      Row({ space: 10 }) {
        Button('刷新')
          .onClick(() => this.loadTrashFiles())
          .height(40)
          .fontSize(14)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('全部恢复')
          .onClick(() => {
            if (this.trashFiles.length > 0) {
              this.confirmAction = 'restore_all';
              this.showConfirmDialog = true;
            } else {
              this.showToast('回收站为空', 'info');
            }
          })
          .enabled(this.trashFiles.length > 0)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.trashFiles.length > 0 ? '#34C759' : '#C7C7CC')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)

        Button('清空回收站')
          .onClick(() => {
            if (this.trashFiles.length > 0) {
              this.confirmAction = 'empty';
              this.showConfirmDialog = true;
            } else {
              this.showToast('回收站为空', 'info');
            }
          })
          .enabled(this.trashFiles.length > 0)
          .height(40)
          .fontSize(14)
          .backgroundColor(this.trashFiles.length > 0 ? '#FF3B30' : '#C7C7CC')
          .fontColor(Color.White)
          .borderRadius(8)
          .layoutWeight(1)
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 12 })

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

      // === 文件列表 ===
      if (this.trashFiles.length === 0) {
        Column() {
          Text('🗑️')
            .fontSize(48)
            .margin({ bottom: 16 })
          Text('回收站为空')
            .fontSize(16)
            .fontColor('#8E8E93')
            .margin({ bottom: 8 })
          Text('删除的文件会暂存在这里，可以随时恢复')
            .fontSize(12)
            .fontColor('#C7C7CC')
        }
        .width('100%')
        .height(300)
        .justifyContent(FlexAlign.Center)
      } else {
        List({ space: 8 }) {
          ForEach(this.trashFiles, (file: TrashFileInfo) => {
            ListItem() {
              Row() {
                Column() {
                  Row() {
                    Text(file.originalName)
                      .fontSize(15)
                      .fontWeight(FontWeight.Medium)
                      .fontColor('#333333')
                      .maxLines(1)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })
                      .layoutWeight(1)

                    Text(this.getSourceText(file.source))
                      .fontSize(10)
                      .fontColor(Color.White)
                      .backgroundColor(this.getSourceColor(file.source))
                      .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                      .borderRadius(4)
                      .margin({ left: 8 })
                  }
                  .width('100%')

                  Row() {
                    Text(file.sizeReadable)
                      .fontSize(11)
                      .fontColor('#8E8E93')
                      .margin({ right: 12 })

                    Text(`删除于 ${file.deleteTimeFormatted}`)
                      .fontSize(11)
                      .fontColor('#8E8E93')
                  }
                  .margin({ top: 4 })
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)

                Row({ space: 8 }) {
                  Button('恢复')
                    .onClick(() => this.restoreFile(file.trashName))
                    .height(32)
                    .fontSize(12)
                    .backgroundColor('#34C759')
                    .fontColor(Color.White)
                    .borderRadius(16)

                  Button('删除')
                    .onClick(() => {
                      this.selectedTrashName = file.trashName;
                      this.confirmAction = 'delete';
                      this.showConfirmDialog = true;
                    })
                    .height(32)
                    .fontSize(12)
                    .backgroundColor('#FF3B30')
                    .fontColor(Color.White)
                    .borderRadius(16)
                }
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Color.White)
              .borderRadius(12)
              .border({ width: 1, color: '#E0E0E0' })
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }

      // === 提示信息 ===
      if (this.trashFiles.length > 0) {
        Row() {
          Text('💡 提示：回收站中的文件不会永久删除，直到您手动清空回收站')
            .fontSize(11)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8, bottom: 16 })
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
          Text(
            this.confirmAction === 'empty' ? '确认清空回收站' :
              (this.confirmAction === 'restore_all' ? '确认恢复所有文件' : '确认永久删除')
          )
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
            .margin({ bottom: 16 })

          Text(
            this.confirmAction === 'empty'
              ? `即将永久删除回收站中的所有 ${this.trashFiles.length} 个文件。\n\n此操作不可撤销！`
              : (this.confirmAction === 'restore_all'
                ? `即将恢复回收站中的所有 ${this.trashFiles.length} 个文件到原位置。`
                : '此文件将被永久删除，无法恢复。')
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

            Button(this.confirmAction === 'restore_all' ? '确认恢复' : '确认删除')
              .onClick(() => {
                switch (this.confirmAction) {
                  case 'empty':
                    this.emptyTrash();
                    break;
                  case 'restore_all':
                    this.restoreAll();
                    break;
                  case 'delete':
                    this.permanentDelete(this.selectedTrashName);
                    break;
                }
              })
              .height(44)
              .fontSize(16)
              .backgroundColor(this.confirmAction === 'restore_all' ? '#34C759' : '#FF3B30')
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
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
