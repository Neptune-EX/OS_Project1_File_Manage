/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import { writeFile } from '../common/utils/WriteFile';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo as fs, picker } from '@kit.CoreFileKit';

@Component
export struct ApplicationFileTab {
  @State content: string = '';
  @State fileName: string = '';
  @State statusText: string = '';
  @State statusType: string = 'info'; // info, success, error
  @State isProcessing: boolean = false;

  private async copyAllRawFilesToSandbox(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.statusText = '正在导入...';
    this.statusType = 'info';

    try {
      const context = getContext(this) as common.UIAbilityContext;
      const rawFileList = await context.resourceManager.getRawFileList("");

      if (rawFileList.length === 0) {
        this.statusText = '资源目录为空';
        this.statusType = 'error';
        this.isProcessing = false;
        return;
      }

      let success = 0;
      for (const fileName of rawFileList) {
        try {
          const content = context.resourceManager.getRawFileContentSync(fileName);
          const targetPath = `${context.filesDir}/${fileName}`;
          const file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
          fs.writeSync(file.fd, content.buffer as ArrayBuffer);
          fs.closeSync(file);
          success++;
        } catch (e) {
          console.error("FileTab", `拷贝 ${fileName} 失败`);
        }
      }

      this.statusText = `导入完成：${success}/${rawFileList.length} 个文件`;
      this.statusType = 'success';
    } catch (error) {
      this.statusText = `导入失败：${(error as BusinessError).message}`;
      this.statusType = 'error';
    } finally {
      this.isProcessing = false;
    }
  }

  private async importWithPicker(): Promise<void> {
    if (this.isProcessing) return;

    try {
      const context = getContext(this) as common.UIAbilityContext;
      const documentPicker = new picker.DocumentViewPicker(context);
      const options = new picker.DocumentSelectOptions();
      options.maxSelectNumber = 20;

      const uris = await documentPicker.select(options);
      if (uris.length === 0) {
        this.statusText = '未选择文件';
        this.statusType = 'info';
        return;
      }

      this.isProcessing = true;
      this.statusText = '正在导入...';
      this.statusType = 'info';

      let success = 0;
      for (const uri of uris) {
        try {
          const parts = uri.split('/');
          const fileName = parts[parts.length - 1];
          const srcFile = fs.openSync(uri, fs.OpenMode.READ_ONLY);
          const stat = fs.statSync(srcFile.fd);
          const buffer = new ArrayBuffer(stat.size);
          fs.readSync(srcFile.fd, buffer);
          fs.closeSync(srcFile);

          const dstPath = `${context.filesDir}/${fileName}`;
          const dstFile = fs.openSync(dstPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
          fs.writeSync(dstFile.fd, buffer);
          fs.closeSync(dstFile);
          success++;
        } catch (e) {
          console.error("FileTab", "导入文件失败:", e);
        }
      }

      this.statusText = `导入完成：${success}/${uris.length} 个文件`;
      this.statusType = 'success';
    } catch (error) {
      this.statusText = `选择失败`;
      this.statusType = 'error';
    } finally {
      this.isProcessing = false;
    }
  }

  private createFile(): void {
    const name = this.fileName.trim();
    const text = this.content.trim();

    if (name.length === 0) {
      this.statusText = '请输入文件名';
      this.statusType = 'error';
      return;
    }

    if (text.length === 0) {
      this.statusText = '请输入文件内容';
      this.statusType = 'error';
      return;
    }

    // 自动添加 .txt 扩展名
    const finalName = name.includes('.') ? name : `${name}.txt`;

    try {
      writeFile(text, finalName);
      this.statusText = `文件 "${finalName}" 创建成功`;
      this.statusType = 'success';
      this.content = '';
      this.fileName = '';
    } catch (e) {
      this.statusText = '创建失败';
      this.statusType = 'error';
    }
  }

  build() {
    Column() {
      // 标题
      Text('文件导入')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .width('100%')
        .padding({ left: 20, top: 16, bottom: 12 })

      // 导入卡片
      Column() {
        Row({ space: 12 }) {
          // 资源导入
          Column() {
            Text('📦')
              .fontSize(28)
            Text('资源导入')
              .fontSize(13)
              .fontColor('#333333')
              .margin({ top: 6 })
            Text('从应用资源')
              .fontSize(10)
              .fontColor('#8E8E93')
              .margin({ top: 2 })
          }
          .layoutWeight(1)
          .height(90)
          .backgroundColor('#E8F5E9')
          .borderRadius(12)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.copyAllRawFilesToSandbox())

          // 文件选择
          Column() {
            Text('📁')
              .fontSize(28)
            Text('选择文件')
              .fontSize(13)
              .fontColor('#333333')
              .margin({ top: 6 })
            Text('从设备存储')
              .fontSize(10)
              .fontColor('#8E8E93')
              .margin({ top: 2 })
          }
          .layoutWeight(1)
          .height(90)
          .backgroundColor('#E3F2FD')
          .borderRadius(12)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.importWithPicker())
        }
        .width('100%')

        // 状态提示
        if (this.statusText.length > 0) {
          Row() {
            Text(this.statusType === 'success' ? '✓' : (this.statusType === 'error' ? '✗' : 'ℹ'))
              .fontSize(14)
              .fontColor(
                this.statusType === 'success' ? '#34C759' :
                  (this.statusType === 'error' ? '#FF3B30' : '#007AFF')
              )
            Text(this.statusText)
              .fontSize(13)
              .fontColor('#666666')
              .margin({ left: 6 })
          }
          .width('100%')
          .margin({ top: 12 })
          .justifyContent(FlexAlign.Center)
        }
      }
      .width('100%')
      .padding(16)
      .margin({ left: 16, right: 16 })
      .backgroundColor(Color.White)
      .borderRadius(16)

      // 创建文件标题
      Text('创建新文件')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .width('100%')
        .padding({ left: 20, top: 24, bottom: 12 })

      // 创建文件卡片
      Column() {
        // 文件名输入
        Column() {
          Text('文件名')
            .fontSize(13)
            .fontColor('#8E8E93')
            .width('100%')
            .margin({ bottom: 6 })

          TextInput({ placeholder: '例如：笔记、会议记录', text: this.fileName })
            .width('100%')
            .height(44)
            .backgroundColor('#F5F5F5')
            .borderRadius(10)
            .padding({ left: 12, right: 12 })
            .onChange((value: string) => {
              this.fileName = value;
            })
        }
        .width('100%')
        .margin({ bottom: 16 })

        // 内容输入
        Column() {
          Text('文件内容')
            .fontSize(13)
            .fontColor('#8E8E93')
            .width('100%')
            .margin({ bottom: 6 })

          TextArea({ placeholder: '在此输入文件内容...', text: this.content })
            .width('100%')
            .height(120)
            .backgroundColor('#F5F5F5')
            .borderRadius(10)
            .padding(12)
            .onChange((value: string) => {
              this.content = value;
            })
        }
        .width('100%')
        .margin({ bottom: 16 })

        // 创建按钮
        Button('创建文件')
          .width('100%')
          .height(46)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .backgroundColor('#007AFF')
          .fontColor(Color.White)
          .borderRadius(10)
          .onClick(() => this.createFile())
      }
      .width('100%')
      .padding(16)
      .margin({ left: 16, right: 16 })
      .backgroundColor(Color.White)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}
