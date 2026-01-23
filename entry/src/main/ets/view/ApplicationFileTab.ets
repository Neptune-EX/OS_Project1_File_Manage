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

import { readFile } from '../common/utils/ReadFile';
import { writeFile } from '../common/utils/WriteFile';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo as fs, fileShare, picker } from '@kit.CoreFileKit';


@Component
export struct ApplicationFileTab {
  // Used to record the read content.
  @State message: string = '';
  // Used to record the contents of a text box.
  @State content: string = '';

  // 新增：记录文件名
  @State fileName: string = '';

  // 新增：拷贝状态信息
  @State copyStatus: string = '';

  // 新增：文件列表状态
  @State fileList: string[] = [];

  // 外部导入路径
  private externalPath: string = '/data/local/tmp/docs';


  // 新增：获取rawfile目录下的所有文件
  private getRawFilelist(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      try {
        const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;

        // 直接返回Promise
        context.resourceManager.getRawFileList("")
          .then((fileList: string[]) => {
            console.info("FileTab", "Rawfile文件列表:", fileList);
            resolve(fileList);
          })
          .catch((error: Error) => {
            console.error("FileTab", "获取rawfile文件列表失败:", error);
            resolve([]); // 出错时返回空数组
          });
      } catch (error) {
        console.error("FileTab", "获取context失败:", error);
        resolve([]);
      }
    });
  }

  // 新增：拷贝rawfile所有文件到沙箱
  private async copyAllRawFilesToSandbox(): Promise<void> {
    try {
      // 获取UIAbilityContext
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;

      // 获取rawfile文件列表
      const rawFileList: string[] = await this.getRawFilelist();

      if (rawFileList.length === 0) {
        this.copyStatus = "rawfile目录中没有文件";
        return;
      }

      this.copyStatus = `开始拷贝 ${rawFileList.length} 个文件...`;
      let successCount: number = 0;
      let failCount: number = 0;
      let details: string = "";

      // 获取沙箱目录
      const sandboxDir: string = context.filesDir;

      // 遍历所有文件进行拷贝
      for (const fileName of rawFileList) {
        try {
          // 从rawfile读取文件内容
          const fileContent: Uint8Array = context.resourceManager.getRawFileContentSync(fileName);

          // 目标文件路径
          const targetPath: string = sandboxDir + '/' + fileName;

          // 创建并写入文件
          const file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
          const writeLen: number = fs.writeSync(file.fd, fileContent.buffer as ArrayBuffer);
          fs.closeSync(file);

          successCount++;
          details += `✓ ${fileName}: ${writeLen} 字节\n`;
          console.info("FileTab", `文件 ${fileName} 拷贝成功, 大小: ${writeLen} 字节`);

        } catch (fileError) {
          failCount++;
          details += `✗ ${fileName}: 失败\n`;
          console.error("FileTab", `文件 ${fileName} 拷贝失败:`, fileError);
        }
      }

      this.copyStatus = `拷贝完成！\n成功: ${successCount}, 失败: ${failCount}\n${details}`;

      // 更新文件列表显示
      await this.updateFileList();

    } catch (error) {
      const code: number = (error as BusinessError).code;
      const message: string = (error as BusinessError).message;
      this.copyStatus = `整体拷贝失败！错误码: ${code}, 信息: ${message}`;
      console.error("FileTab", `整体拷贝失败, error code: ${code}, message: ${message}.`);
    }
  }

  // 新增：更新沙箱文件列表（简化版）
  private async updateFileList(): Promise<void> {
    try {
      // 获取上下文
      const context = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;

      // 直接使用 listFileSync，这是最常用的方法
      const allEntries: string[] = fs.listFileSync(sandboxDir);

      // 过滤出文件（如果是目录则跳过）
      const fileList: string[] = [];

      for (const entry of allEntries) {
        const fullPath = sandboxDir + '/' + entry;
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            fileList.push(entry);
          }
        } catch (error) {
          // 如果无法获取文件信息，跳过
          continue;
        }
      }
      this.fileList = fileList.sort();
      console.info("FileTab", "沙箱文件列表更新完成:", this.fileList);

    } catch (error) {
      console.error("FileTab", "更新文件列表失败:", error);
      this.fileList = [];
    }
  }

  // 从外部路径导入文件到沙箱
  private async importFromExternal(): Promise<void> {
    try {
      const context = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;

      // 检查外部目录是否存在
      if (!fs.accessSync(this.externalPath)) {
        this.copyStatus = `外部目录不存在: ${this.externalPath}`;
        return;
      }

      const files: string[] = fs.listFileSync(this.externalPath);
      if (files.length === 0) {
        this.copyStatus = '外部目录中没有文件';
        return;
      }

      this.copyStatus = `开始导入 ${files.length} 个文件...`;
      let successCount = 0;
      let failCount = 0;
      let details = '';

      for (const fileName of files) {
        try {
          const srcPath = this.externalPath + '/' + fileName;
          const dstPath = sandboxDir + '/' + fileName;

          // 检查是否为文件
          const stat = fs.statSync(srcPath);
          if (!stat.isFile()) {
            continue;
          }

          // 读取并写入
          const srcFile = fs.openSync(srcPath, fs.OpenMode.READ_ONLY);
          const buffer = new ArrayBuffer(stat.size);
          fs.readSync(srcFile.fd, buffer);
          fs.closeSync(srcFile);

          const dstFile = fs.openSync(dstPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
          fs.writeSync(dstFile.fd, buffer);
          fs.closeSync(dstFile);

          successCount++;
          details += `✓ ${fileName}: ${stat.size} 字节\n`;
        } catch (fileError) {
          failCount++;
          details += `✗ ${fileName}: 失败\n`;
          console.error("FileTab", `导入 ${fileName} 失败:`, fileError);
        }
      }

      this.copyStatus = `导入完成！\n成功: ${successCount}, 失败: ${failCount}\n${details}`;
      await this.updateFileList();
    } catch (error) {
      this.copyStatus = `导入失败: ${JSON.stringify(error)}`;
      console.error("FileTab", "导入失败:", error);
    }
  }

  // 使用文件选择器导入文件
  private async importWithPicker(): Promise<void> {
    try {
      const context = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;

      // 创建文档选择器
      const documentPicker = new picker.DocumentViewPicker(context);
      const options = new picker.DocumentSelectOptions();
      options.maxSelectNumber = 20;

      const uris = await documentPicker.select(options);
      if (uris.length === 0) {
        this.copyStatus = '未选择任何文件';
        return;
      }

      this.copyStatus = `开始导入 ${uris.length} 个文件...`;
      let successCount = 0;
      let details = '';

      for (const uri of uris) {
        try {
          // 从 URI 获取文件名
          const parts = uri.split('/');
          const fileName = parts[parts.length - 1];

          // 打开源文件
          const srcFile = fs.openSync(uri, fs.OpenMode.READ_ONLY);
          const stat = fs.statSync(srcFile.fd);
          const buffer = new ArrayBuffer(stat.size);
          fs.readSync(srcFile.fd, buffer);
          fs.closeSync(srcFile);

          // 写入沙盒
          const dstPath = sandboxDir + '/' + fileName;
          const dstFile = fs.openSync(dstPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
          fs.writeSync(dstFile.fd, buffer);
          fs.closeSync(dstFile);

          successCount++;
          details += `✓ ${fileName}\n`;
        } catch (fileError) {
          details += `✗ 导入失败\n`;
          console.error("FileTab", "导入文件失败:", fileError);
        }
      }

      this.copyStatus = `导入完成！成功: ${successCount}/${uris.length}\n${details}`;
      await this.updateFileList();
    } catch (error) {
      this.copyStatus = `选择文件失败: ${JSON.stringify(error)}`;
      console.error("FileTab", "文件选择器错误:", error);
    }
  }


  //信息预览：

  // 1 读取
  // const file = fs.openSync(getContext(this).cacheDir+'/jz.txt', fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE)
  // 2 修改响应式数据
  // const result = fs.readText(getContext(this).cacheDir+'/jz.txt')
  // console.log('查看结果1：', await result)

  // 作者：IT充电站
  // 链接：https://juejin.cn/post/7576936862632706048
  // 来源：稀土掘金
  // 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


  build() {
    Column() {
      // === 文件拷贝功能区域 ===
      Text('rawfile文件批量拷贝')
        .width('90%')
        .height($r('app.float.default_22'))
        .fontColor('black')
        .fontWeight(500)
        .fontSize($r('app.float.default_16'))
        .fontFamily('HarmonyHeiTi-Medium')
        .lineHeight($r('app.float.default_22'))
        .textAlign(TextAlign.Start)
        .margin({
          top: $r('app.float.default_20'),
          bottom: $r('app.float.default_10')
        })

      // 拷贝状态显示
      Scroll() {
        Text(this.copyStatus)
          .width('90%')
          .fontSize($r('app.float.default_12'))
          .fontColor('black')
          .textAlign(TextAlign.Start)
          .margin({ bottom: $r('app.float.default_10') })
      }
      .height(80)
      .width('90%')
      .margin({ bottom: $r('app.float.default_10') })

      // 文件操作按钮区域
      Row() {
        Button('拷贝所有文件')
          .width('30%')
          .height($r('app.float.default_40'))
          .fontColor('white')
          .backgroundColor('#4CAF50')
          .fontSize($r('app.float.default_12'))
          .onClick((): void => {
            this.copyAllRawFilesToSandbox();
          })

        Button('选择文件')
          .width('30%')
          .height($r('app.float.default_40'))
          .fontColor('white')
          .backgroundColor('#2196F3')
          .fontSize($r('app.float.default_12'))
          .onClick((): void => {
            this.importWithPicker();
          })

        Button('外部导入')
          .width('30%')
          .height($r('app.float.default_40'))
          .fontColor('white')
          .backgroundColor('#FF9800')
          .fontSize($r('app.float.default_12'))
          .onClick((): void => {
            this.importFromExternal();
          })
      }
      .width('90%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin({ bottom: $r('app.float.default_10') })


      // 文件内容显示区域
      if (this.message) {
        Text('文件内容:')
          .width('90%')
          .height($r('app.float.default_22'))
          .fontColor('black')
          .fontWeight(500)
          .fontSize($r('app.float.default_14'))
          .textAlign(TextAlign.Start)
          .margin({ bottom: $r('app.float.default_10') })

        Scroll() {
          Text(this.message)
            .width('100%')
            .fontSize($r('app.float.default_12'))
            .fontColor('black')
            .textAlign(TextAlign.Start)
        }
        .height(100)
        .width('90%')
        .margin({ bottom: $r('app.float.default_20') })
      }

      Divider()
        .strokeWidth(1)
        .color($r('app.color.divider_color'))
        .margin({
          top: $r('app.float.default_10'),
          bottom: $r('app.float.default_20')
        })

      // === 文件名输入区域 ===
      Text('文件名称：')
        .width($r('app.float.default_294'))
        .height($r('app.float.default_22'))
        .fontColor($r('app.color.text_color'))
        .fontWeight(500)
        .fontSize($r('app.float.default_16'))
        .fontFamily('HarmonyHeiTi-Medium')
        .lineHeight($r('app.float.default_22'))
        .textAlign(TextAlign.Start)
        .margin({
          top: $r('app.float.default_13'),
          bottom: $r('app.float.default_13'),
          right: $r('app.float.default_8')
        })

      TextInput({ placeholder: '输入文件名（如：myfile.txt）', text: this.fileName })
        .width($r('app.float.default_336'))
        .height($r('app.float.default_40'))
        .borderRadius($r('app.float.default_8'))
        .backgroundColor($r('app.color.start_window_background'))
        .padding({ left: 10, right: 10 })
        .onChange((value: string): void => {
          this.fileName = value;
        })
        .margin({ bottom: $r('app.float.default_16') })

      Text($r('app.string.textarea_default'))
        .width($r('app.float.default_294'))
        .height($r('app.float.default_22'))
        .fontColor($r('app.color.text_color'))
        .fontWeight(500)
        .fontSize($r('app.float.default_16'))
        .fontFamily('HarmonyHeiTi-Medium')
        .lineHeight($r('app.float.default_22'))
        .textAlign(TextAlign.Start)
        .margin({
          top: $r('app.float.default_13'),
          bottom: $r('app.float.default_13'),
          right: $r('app.float.default_8')
        })

      TextArea({ placeholder: '输入文件内容', text: this.content })
        .width($r('app.float.default_336'))
        .height($r('app.float.default_139'))
        .borderRadius($r('app.float.default_24'))
        .backgroundColor($r('app.color.start_window_background'))
        .enableKeyboardOnFocus(false)
        .onChange((value: string): void => {
          this.content = value;
        })

      Column() {
        Button($r('app.string.button1'))
          .width($r('app.float.default_312'))
          .height($r('app.float.default_40'))
          .onClick((): void => {
            writeFile(this.content, this.fileName);
            this.content = '';
            this.fileName = '';
            // 创建后更新文件列表
            this.updateFileList();
          })
      }
      .width('100%')
      .margin({ top: 20 })
    }
    .width('100%')
    .onAppear((): void => {
      // 页面显示时自动执行初始化
      // this.initializeRawFiles();
    })
  }


}