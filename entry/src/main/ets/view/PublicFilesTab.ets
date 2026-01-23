/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License,Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FileManager } from '../common/utils/FileManager';
import { fileIo, fileUri } from '@kit.CoreFileKit';
import { FileInfo } from '../common/utils/FileManager';

//readFile 仅仅只能读txt文件
import { readFile } from '../common/utils/ReadFile';
import { common } from "@kit.AbilityKit"
import { BusinessError } from '@kit.BasicServicesKit'
import fs from '@ohos.file.fs';
import { filePreview } from '@kit.PreviewKit';

/**
 * Preview configuration interface
 */
interface PreviewConfig {
  title?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

@Component
export struct publicFilesTab {
  // 新增状态变量
  @State fileList: Array<FileInfo> = []; // 文件列表
  @State searchKeyword: string = ''; // 搜索关键字
  @State selectedFile: string = ''; // 当前选中的文件
  @State fileContent: string = ''; // 文件内容
  @State showFileContent: boolean = false; // 是否显示文件内容
  @State newFileName: string = ''; // 新文件名
  @State fileManager: FileManager | null = null; // 文件管理器实例

  // 删除的状态变量
  @State showSaveSuccess: boolean = false;
  @State saveMessage: string = '';

  // 文件操作菜单相关状态
  @State showFileActionMenu: boolean = false;
  @State selectedFileForMenu: string = '';

  // 重命名状态
  @State renamingFile: string = '';
  @State newFilename: string = '';
  @State showRenameDialog: boolean = false;

  // 文件操作面板状态
  @State showFileActionPanel: boolean = false;
  @State selectedFileForPanel: string = '';

  aboutToAppear() {
    let context = this.getUIContext().getHostContext() as Context;
    this.fileManager = new FileManager(context);
    // initDeleteUtils(context);
    // this.searchFilesWithInfo();
    this.loadFileListWithInfo();
  }

  onPageShow() {
    console.log('页面显示，刷新文件列表');
    this.searchFilesWithInfo();
  }
  // 加载文件列表（包含详细信息）
  async loadFileListWithInfo() {
    console.log('加载文件列表（带详细信息）...');

    if (this.fileManager) {
      try {
        const files = await this.fileManager.getAllFilesWithInfo();
        console.log('获取到的文件数量:', files.length);
        this.fileList = files;

        if (files.length > 0) {
          console.log('示例文件信息:', {
            filename: files[0].filename,
            size: files[0].sizeReadable,
            ctime: files[0].ctimeFormatted
          });
        }
      } catch (error) {
        console.error('加载文件列表失败:', error);
        this.fileList = [];
      }
    }
  }
  // 搜索文件（带详细信息）
  async searchFilesWithInfo() {
    console.log('搜索文件:', this.searchKeyword);

    if (this.fileManager) {
      if (this.searchKeyword.trim() === '') {
        await this.loadFileListWithInfo();
      } else {
        const files = await this.fileManager.searchFilesWithInfo(this.searchKeyword);
        this.fileList = files;
        console.log('搜索结果:', files.length, '个文件');
      }
    }
  }

  private deleteFile(fileName: string): boolean {
    try {
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;
      const filePath: string = sandboxDir + '/' + fileName;

      // 检查文件是否存在
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          return false;
        }
      } catch (error) {
        return false;
      }

      // 直接删除文件
      fs.unlinkSync(filePath);

      console.log(`已永久删除: ${fileName}`) ;
      console.info('FileTab', `文件 ${fileName} 已删除`);
      return true;

    } catch (error) {
      const err = error as BusinessError;
      console.error('FileTab', `删除文件失败:`, err);
      console.log(`删除失败: ${err.message}`);
      return false;
    }
  }

  // 执行删除文件的方法
  private async executeDeleteFile(filename: string) {
    console.log(`执行删除文件: ${filename}`);
    const success = this.deleteFile(filename);
    if (success) {
      console.log(`文件 ${filename} 删除成功`);
      await this.loadFileListWithInfo();

      if (this.selectedFile === filename) {
        this.selectedFile = '';
        this.fileContent = '';
        this.showFileContent = false;
      }

      this.saveMessage = `文件 "${filename}" 已删除`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    } else {
      console.log(`文件 ${filename} 删除失败`);
      this.saveMessage = `删除文件失败`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }

  // 打开文件操作面板
  private openFileActionPanel(filename: string) {
    this.selectedFileForPanel = filename;
    this.showFileActionPanel = true;
  }

  // 关闭文件操作面板
  private closeFileActionPanel() {
    this.showFileActionPanel = false;
    this.selectedFileForPanel = '';
  }


  // 查看文件内容



  /**
   * Get MIME type based on file extension
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop() || '';

    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Check if file type supports preview
   */
  private canPreviewFileType(fileName: string): boolean {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    const supportedTypes = ['pdf', 'doc', 'docx', 'txt'];
    return supportedTypes.indexOf(extension) !== -1;
  }

  /**
   * Check if file is a text file
   */
  private isTextFile(fileName: string): boolean {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return extension === 'txt';
  }

  /**
   * Open file preview using PreviewKit (for PDF, DOCX, etc.)
   */
  private async openFilePreview(fileName: string): Promise<void> {
    try {
      // Get UIContext
      const uiContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
      if (!uiContext) {
        throw new Error('Unable to get UI context');
      }

      // Get file path
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;
      const filePath: string = sandboxDir + '/' + fileName;
      // Check if file exists
      try {
        const isExist = fs.accessSync(filePath);
        if (!isExist) {
          throw new Error(`File does not exist: ${fileName}`);
        }
      } catch (error) {
        throw new Error(`File does not exist: ${fileName}`);
      }
      // Convert path to URI
      const uri = fileUri.getUriFromPath(filePath);
      // Build preview parameters
      const previewInfo: filePreview.PreviewInfo = {
        title: fileName,
        uri: uri,
        mimeType: this.getMimeType(fileName)
      };
      const displayInfo: filePreview.DisplayInfo = {
        x: 100,
        y: 100,
        width: 800,
        height: 800
      };
      // Open preview
      await filePreview.openPreview(uiContext, previewInfo, displayInfo);

      this.saveMessage = `Preview opened: ${fileName}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 2000);

    } catch (error) {
      const err = error as BusinessError;
      console.error(`Failed to open preview:`, err);
      this.saveMessage = `Preview failed: ${err.message || 'Unknown error'}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }

  /**
   * View file content - supports TXT (inline), DOCX and PDF (preview window)
   */
  private async viewFileContent(filename: string): Promise<void> {
    if (!this.fileManager) {
      return;
    }

    try {
      // Check if file type is supported
      if (!this.canPreviewFileType(filename)) {
        this.saveMessage = `File type not supported for preview: ${filename}`;
        this.showSaveSuccess = true;
        setTimeout(() => {
          this.showSaveSuccess = false;
        }, 3000);
        return;
      }

      await this.openFilePreview(filename);
      // // For text files, display content inline (commented out as UI is commented)
      // if (this.isTextFile(filename)) {
      //   const content = readFile(filename);
      //   console.log(`File content: ${content}`);
      //
      //   this.selectedFile = filename;
      //   this.fileContent = content;
      //   this.showFileContent = true;
      //
      //   this.saveMessage = `Text file loaded: ${filename}`;
      //   this.showSaveSuccess = true;
      //   setTimeout(() => {
      //     this.showSaveSuccess = false;
      //   }, 2000);
      // } else {
      //   // For DOCX, PDF, and other document types, open preview window
      //   await this.openFilePreview(filename);
      // }
    } catch (error) {
      console.error(`Failed to view file: ${error}`);
      this.saveMessage = `Failed to read file: ${error}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }



  // 打开重命名对话框
  private openRenameDialog(filename: string) {
    this.renamingFile = filename;
    this.newFilename = filename;
    this.showRenameDialog = true;
  }

  // 关闭重命名对话框
  private closeRenameDialog() {
    this.showRenameDialog = false;
    this.renamingFile = '';
    this.newFilename = '';
  }

  // 执行重命名
  private async executeRename() {
    if (!this.fileManager || !this.renamingFile || !this.newFilename) {
      console.error('重命名参数不完整');
      return;
    }

    if (this.renamingFile === this.newFilename.trim()) {
      this.saveMessage = '文件名未改变';
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 2000);
      this.closeRenameDialog();
      return;
    }

    if (this.newFilename.trim() === '') {
      this.saveMessage = '新文件名不能为空';
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 2000);
      return;
    }

    try {
      console.log(`old name${this.renamingFile} new name${this.newFilename.trim()}`);
      const success = await this.fileManager.renameFile(this.renamingFile, this.newFilename.trim());

      if (success) {
        console.log(`重命名成功: ${this.renamingFile} -> ${this.newFilename}`);
        await this.loadFileListWithInfo();

        if (this.selectedFile === this.renamingFile) {
          this.selectedFile = this.newFilename.trim();
        }

        this.saveMessage = `文件已重命名为 "${this.newFilename.trim()}"`;
        this.showSaveSuccess = true;
        setTimeout(() => {
          this.showSaveSuccess = false;
        }, 3000);

        this.closeRenameDialog();
      } else {
        console.error('重命名失败');
        this.saveMessage = '重命名失败，请检查文件名是否合法或已存在';
        this.showSaveSuccess = true;
        setTimeout(() => {
          this.showSaveSuccess = false;
        }, 3000);
      }
    } catch (error) {
      console.error(`重命名过程中发生错误: ${error}`);
      this.saveMessage = `重命名失败: ${error}`;
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    }
  }


  // 根据文件扩展名返回对应的图标
  private getFileIcon(filename: string): string {
    if (filename.endsWith('.txt')) return '📝';
    if (filename.endsWith('.pdf')) return '📕';
    if (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.gif')) return '🖼️';
    if (filename.endsWith('.mp4') || filename.endsWith('.avi')) return '🎬';
    if (filename.endsWith('.mp3') || filename.endsWith('.wav')) return '🎵';
    if (filename.endsWith('.zip') || filename.endsWith('.rar')) return '🗜️';
    return '📄';
  }

  build() {
    Column() {
      // === 顶部搜索栏 ===
      Row() {
        TextInput({ placeholder: '搜索文件...', text: this.searchKeyword })
          .onChange((value: string) => {
            this.searchKeyword = value;
            this.searchFilesWithInfo();
          })
          .layoutWeight(1)
          .height(40)
          .margin({ right: 10 })
          .padding({ left: 10, right: 10 })
          .backgroundColor(Color.White)
          .border({ width: 1, color: Color.Gray, radius: 8 })

        Button('刷新')
          .onClick(() => {
            this.searchFilesWithInfo();
          })
          .height(40)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(8)
      }
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })

      // === 成功提示消息 ===
      if (this.showSaveSuccess) {
        Text(this.saveMessage)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor('#34C759')
          .padding({ left: 16, right: 16, top: 8, bottom: 8 })
          .borderRadius(8)
          .margin({ bottom: 12 })
      }

      // === 文件列表 ===
      if (this.fileList.length === 0) {
        Column() {
          Text("📁")
            .fontSize(48)
            .margin({ bottom: 10 })
          Text(this.searchKeyword ? '未找到相关文件' : '暂无文件')
            .fontColor(Color.Gray)
        }
        .height(200)
        .justifyContent(FlexAlign.Center)
        .width('100%')
      } else {
        List({ space: 8 }) {
          ForEach(this.fileList, (fileInfo: FileInfo) => {
            ListItem() {
              Row() {
                Text(this.getFileIcon(fileInfo.filename))
                  .fontSize(18)
                  .margin({ right: 10 })

                Column() {
                  Text(fileInfo.filename)
                    .fontSize(15)
                    .fontWeight(FontWeight.Medium)
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .width('100%')

                  Row() {
                    Text(fileInfo.sizeReadable)
                      .fontSize(11)
                      .fontColor(Color.Gray)
                      .margin({ right: 12 })

                    // Text(fileInfo.ctimeFormatted)
                    //   .fontSize(11)
                    //   .fontColor(Color.Gray)
                  }
                }
                .layoutWeight(1)

                Row() {
                  Button('查看')
                    .onClick(() => {
                      this.openFileActionPanel(fileInfo.filename);
                    })
                    .height(28)
                    .fontSize(11)
                    .margin({ right: 4 })
                    .borderRadius(14)
                    .backgroundColor('#007AFF')
                    .fontColor(Color.White)

                  Button('删除')
                    .onClick(() => {
                      this.executeDeleteFile(fileInfo.filename);
                    })
                    .height(28)
                    .fontSize(11)
                    .borderRadius(14)
                    .backgroundColor($r('app.color.delete_button'))
                    .fontColor(Color.White)
                }
              }
              .padding({ left: 12, right: 12, top: 10, bottom: 10 })
              .backgroundColor(Color.White)
              .borderRadius(8)
              .border({ width: 1, color: '#F0F0F0' })
            }
          })
        }
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }

      // === 文件操作面板（居中弹出）===
      if (this.showFileActionPanel) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.closeFileActionPanel();
          })
          .position({ x: 0, y: 0 })

        Column() {
          Row() {
            Text('文件操作')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .layoutWeight(1)

            Button('×')
              .fontSize(24)
              .fontColor('#666666')
              .backgroundColor(Color.Transparent)
              .onClick(() => {
                this.closeFileActionPanel();
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 15, bottom: 15 })
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })

          Column({ space: 12 }) {
            Row() {
              Text('文件名:')
                .fontSize(16)
                .fontColor('#666666')
                .width('30%')
              Text(this.selectedFileForPanel)
                .fontSize(16)
                .fontColor('#007AFF')
                .fontWeight(FontWeight.Bold)
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .width('70%')
            }
            .width('100%')
          }
          .width('100%')
          .padding(20)

          Column({ space: 15 }) {
            Button('重命名')
              .fontSize(18)
              .width('90%')
              .height(50)
              .backgroundColor('#007AFF')
              .fontColor('#FFFFFF')
              .borderRadius(10)
              .onClick(() => {
                this.openRenameDialog(this.selectedFileForPanel);
                this.closeFileActionPanel();
              })

            Button('查看内容')
              .fontSize(18)
              .width('90%')
              .height(50)
              .backgroundColor('#34C759')
              .fontColor('#FFFFFF')
              .borderRadius(10)
              .onClick(() => {
                this.viewFileContent(this.selectedFileForPanel);
                this.closeFileActionPanel();
              })

            Button('取消')
              .fontSize(18)
              .width('90%')
              .height(50)
              .backgroundColor('#8E8E93')
              .fontColor('#FFFFFF')
              .borderRadius(10)
              .onClick(() => {
                this.closeFileActionPanel();
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, bottom: 20 })
          .alignItems(HorizontalAlign.Center)
        }
        .width('85%')
        .backgroundColor('#FFFFFF')
        .borderRadius(20)
        .shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 })
        .position({ x: '7.5%', y: '25%' })
        .hitTestBehavior(HitTestMode.None)
      }

      // === 重命名对话框 ===
      if (this.showRenameDialog) {
        Stack()
          .width('100%')
          .height('100%')
          .backgroundColor('rgba(0, 0, 0, 0.5)')
          .onClick(() => {
            this.closeRenameDialog();
          })

        Column() {
          Row() {
            Text('重命名文件')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .layoutWeight(1)

            Button('×')
              .fontSize(24)
              .fontColor('#666666')
              .backgroundColor(Color.Transparent)
              .onClick(() => {
                this.closeRenameDialog();
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 15, bottom: 15 })
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })

          Column({ space: 15 }) {
            Row() {
              Text('原文件名:')
                .fontSize(16)
                .fontColor('#666666')
                .width('30%')
              Text(this.renamingFile)
                .fontSize(16)
                .fontColor('#333333')
                .fontWeight(FontWeight.Medium)
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .width('70%')
            }
            .width('100%')

            Row() {
              Text('新文件名:')
                .fontSize(16)
                .fontColor('#666666')
                .width('30%')
              TextInput({
                placeholder: '输入新文件名',
                text: this.newFilename
              })
                .onChange((value: string) => {
                  this.newFilename = value;
                })
                .width('70%')
                .height(40)
                .padding(10)
                .border({ width: 1, color: Color.Gray, radius: 8 })
            }
            .width('100%')
          }
          .width('100%')
          .padding(20)

          Row({ space: 15 }) {
            Button('取消')
              .fontSize(16)
              .width('45%')
              .height(45)
              .backgroundColor('#8E8E93')
              .fontColor('#FFFFFF')
              .borderRadius(10)
              .onClick(() => {
                this.closeRenameDialog();
              })

            Button('确定')
              .fontSize(16)
              .width('45%')
              .height(45)
              .backgroundColor('#007AFF')
              .fontColor('#FFFFFF')
              .borderRadius(10)
              .onClick(() => {
                this.executeRename();
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, bottom: 20 })
        }
        .width('85%')
        .backgroundColor('#FFFFFF')
        .borderRadius(20)
        .shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 })
        .position({ x: '7.5%', y: '30%' })
        .hitTestBehavior(HitTestMode.None)
      }

      // // === 文件内容查看/编辑界面 ===
      // if (this.showFileContent && this.selectedFile) {
      //   Stack()
      //     .width('100%')
      //     .height('100%')
      //     .backgroundColor('rgba(0, 0, 0, 0.5)')
      //     .onClick(() => {
      //       this.showFileContent = false;
      //     })
      //
      //   Column() {
      //     Row() {
      //       Text('编辑文件内容')
      //         .fontSize(20)
      //         .fontWeight(FontWeight.Bold)
      //         .fontColor('#333333')
      //         .layoutWeight(1)
      //
      //       Button('×')
      //         .fontSize(24)
      //         .fontColor('#666666')
      //         .backgroundColor(Color.Transparent)
      //         .onClick(() => {
      //           this.showFileContent = false;
      //         })
      //     }
      //     .width('100%')
      //     .padding({ left: 20, right: 20, top: 15, bottom: 15 })
      //     .border({ width: { bottom: 1 }, color: '#E0E0E0' })
      //
      //     Column({ space: 15 }) {
      //       Row() {
      //         Text('文件名:')
      //           .fontSize(16)
      //           .fontColor('#666666')
      //           .width('20%')
      //         Text(this.selectedFile)
      //           .fontSize(16)
      //           .fontColor('#007AFF')
      //           .fontWeight(FontWeight.Medium)
      //           .maxLines(1)
      //           .textOverflow({ overflow: TextOverflow.Ellipsis })
      //           .width('80%')
      //       }
      //       .width('100%')
      //
      //       Text('文件内容:')
      //         .fontSize(16)
      //         .fontColor('#666666')
      //         .width('100%')
      //         .textAlign(TextAlign.Start)
      //
      //       TextArea({ text: this.fileContent })
      //         .onChange((value: string) => {
      //           this.fileContent = value;
      //         })
      //         .width('100%')
      //         .height(300)
      //         .backgroundColor('#F8F8F8')
      //         .padding(10)
      //         .border({ width: 1, color: '#E0E0E0', radius: 8 })
      //     }
      //     .width('100%')
      //     .padding(20)
      //
      //     Row({ space: 15 }) {
      //       Button('取消')
      //         .fontSize(16)
      //         .width('45%')
      //         .height(45)
      //         .backgroundColor('#8E8E93')
      //         .fontColor('#FFFFFF')
      //         .borderRadius(10)
      //         .onClick(() => {
      //           this.showFileContent = false;
      //         })
      //
      //       Button('保存修改')
      //         .fontSize(16)
      //         .width('45%')
      //         .height(45)
      //         .backgroundColor('#34C759')
      //         .fontColor('#FFFFFF')
      //         .borderRadius(10)
      //         .onClick(() => {
      //           this.updateFileContent();
      //         })
      //     }
      //     .width('100%')
      //     .padding({ left: 20, right: 20, bottom: 20 })
      //   }
      //   .width('85%')
      //   .backgroundColor('#FFFFFF')
      //   .borderRadius(20)
      //   .shadow({ radius: 20, color: '#000000', offsetX: 0, offsetY: 0 })
      //   .position({ x: '7.5%', y: '15%' })
      //   .hitTestBehavior(HitTestMode.None)
      // }



    }
    .width('100%')
    .layoutWeight(1)
    .backgroundColor('#F5F5F5')
  }
}
