/**
 * 回收站 Tab 页面
 */

import { common } from '@kit.AbilityKit';
import { TrashManager, TrashItem } from '../common/utils/TrashManager';

@Component
export struct TrashTab {
  @State trashItems: TrashItem[] = [];
  @State isLoading: boolean = false;
  @State showToastMsg: boolean = false;
  @State toastText: string = '';
  @State toastType: string = 'info';

  private trashManager: TrashManager | null = null;

  aboutToAppear(): void {
    const context = this.getUIContext().getHostContext() as Context;
    this.trashManager = TrashManager.getInstance(context);
    this.loadTrashItems();
  }

  private loadTrashItems(): void {
    if (!this.trashManager) return;
    this.trashItems = this.trashManager.getTrashItems();
    // 按删除时间倒序
    this.trashItems.sort((a: TrashItem, b: TrashItem): number => b.deletedTime - a.deletedTime);
  }

  private restoreFile(item: TrashItem): void {
    if (!this.trashManager) return;

    if (this.trashManager.restore(item.trashName)) {
      this.showToast(`已恢复: ${item.originalName}`, 'success');
      this.loadTrashItems();
    } else {
      this.showToast('恢复失败', 'error');
    }
  }

  private deleteFile(item: TrashItem): void {
    if (!this.trashManager) return;

    if (this.trashManager.deletePermanently(item.trashName)) {
      this.showToast('已永久删除', 'success');
      this.loadTrashItems();
    } else {
      this.showToast('删除失败', 'error');
    }
  }

  private emptyTrash(): void {
    if (!this.trashManager || this.trashItems.length === 0) return;

    const count = this.trashManager.emptyTrash();
    this.showToast(`已清空 ${count} 个文件`, 'success');
    this.loadTrashItems();
  }

  private showToast(message: string, type: string): void {
    this.toastText = message;
    this.toastType = type;
    this.showToastMsg = true;
    setTimeout((): void => {
      this.showToastMsg = false;
    }, 2500);
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const min = date.getMinutes();
    return `${m}/${d} ${h}:${min < 10 ? '0' + min : min}`;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  build() {
    Column() {
      // 顶部栏
      Row() {
        Column() {
          Text('回收站')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
          Text(`${this.trashItems.length} 个文件`)
            .fontSize(12)
            .fontColor('#8E8E93')
            .margin({ top: 2 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        Button('刷新')
          .height(32)
          .fontSize(13)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
          .onClick((): void => {
            this.loadTrashItems();
            this.showToast('已刷新', 'info');
          })

        if (this.trashItems.length > 0) {
          Button('清空')
            .height(32)
            .fontSize(13)
            .backgroundColor('#FF3B30')
            .fontColor(Color.White)
            .borderRadius(8)
            .margin({ left: 8 })
            .onClick((): void => {
              this.emptyTrash();
            })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor(Color.White)

      // Toast
      if (this.showToastMsg) {
        Text(this.toastText)
          .fontSize(13)
          .fontColor(Color.White)
          .backgroundColor(this.toastType === 'success' ? '#34C759' : (this.toastType === 'error' ? '#FF3B30' : '#007AFF'))
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(20)
          .margin({ top: 8 })
      }

      // 列表
      if (this.trashItems.length === 0) {
        Column() {
          Text('🗑️')
            .fontSize(48)
            .margin({ bottom: 12 })
          Text('回收站为空')
            .fontSize(16)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        List({ space: 8 }) {
          ForEach(this.trashItems, (item: TrashItem) => {
            ListItem() {
              Row() {
                Column() {
                  Text(item.originalName)
                    .fontSize(14)
                    .fontColor('#333333')
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                  Row({ space: 8 }) {
                    Text(this.formatTime(item.deletedTime))
                      .fontSize(11)
                      .fontColor('#8E8E93')
                    Text(this.formatSize(item.size))
                      .fontSize(11)
                      .fontColor('#8E8E93')
                  }
                  .margin({ top: 4 })
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)

                Button('恢复')
                  .height(30)
                  .fontSize(12)
                  .backgroundColor('#34C759')
                  .fontColor(Color.White)
                  .borderRadius(6)
                  .onClick((): void => {
                    this.restoreFile(item);
                  })

                Button('删除')
                  .height(30)
                  .fontSize(12)
                  .backgroundColor('#FF3B30')
                  .fontColor(Color.White)
                  .borderRadius(6)
                  .margin({ left: 8 })
                  .onClick((): void => {
                    this.deleteFile(item);
                  })
              }
              .width('100%')
              .padding(12)
              .backgroundColor(Color.White)
              .borderRadius(10)
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16, top: 8 })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
