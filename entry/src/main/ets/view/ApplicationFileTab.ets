// /*
//  * Copyright (c) 2025 Huawei Device Co., Ltd.
//  * Licensed under the Apache License,Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  * http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
//
// import { readFile } from '../common/utils/ReadFile';
// import { writeFile } from '../common/utils/WriteFile';
//
// import { common } from '@kit.AbilityKit';
// import { BusinessError } from '@kit.BasicServicesKit';
// import { fileIo as fs } from '@kit.CoreFileKit';
//
// single file update test
//
// @Component
// export struct ApplicationFileTab {
//   // Used to record the read content.
//   @State message: string = '';
//   // Used to record the contents of a text box.
//   @State content: string = '';
//
//   // 新增：记录文件名
//   @State fileName: string = '';
//
//   // 新增：拷贝状态信息
//   @State copyStatus: string = '';
//
//   // 新增：拷贝TXT文件到沙箱
//   private onCopyTXTToSandbox(): void {
//     try {
//       // 获取UIAbilityContext
//       let context = getContext(this) as common.UIAbilityContext;
//
//       // 从rawfile读取文件内容
//       let fileContent: Uint8Array = context.resourceManager.getRawFileContentSync("test.txt");
//       console.info("FileTab", "getRawFileContentSync done");
//
//       // 获取沙箱目录
//       let sandboxDir: string = context.filesDir;
//       console.info("FileTab", "sandboxDir: " + sandboxDir);
//
//       // 目标文件路径
//       let targetPath: string = sandboxDir + '/test.txt';
//       console.info("FileTab", "targetPath: " + targetPath);
//
//       // 创建并写入文件
//       let file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
//       let writeLen = fs.writeSync(file.fd, fileContent.buffer as ArrayBuffer);
//       fs.closeSync(file);
//
//       this.copyStatus = `拷贝成功！文件大小: ${writeLen} 字节`;
//       console.info("FileTab", "File copied successfully, size: " + writeLen);
//
//     } catch (error) {
//       let code = (error as BusinessError).code;
//       let message = (error as BusinessError).message;
//       this.copyStatus = `拷贝失败！错误码: ${code}, 信息: ${message}`;
//       console.error("FileTab", `Copy failed, error code: ${code}, message: ${message}.`);
//     }
//   }
//
//   // 新增：检查文件是否存在
//   private checkFileExists(): void {
//     try {
//       let context = getContext(this) as common.UIAbilityContext;
//       let sandboxDir: string = context.filesDir;
//       //单文件测试
//       let targetPath: string = sandboxDir + '/test.txt';
//
//       let stats = fs.statSync(targetPath);
//       if (stats.isFile()) {
//         this.copyStatus = `文件已存在，大小: ${stats.size} 字节`;
//       } else {
//         this.copyStatus = '文件不存在';
//       }
//     } catch (error) {
//       this.copyStatus = '文件不存在';
//     }
//   }
//
//
//   build() {
//     Column() {
//       // === 文件拷贝功能区域 ===
//       Text('文件拷贝功能')
//         .width($r('app.float.default_294'))
//         .height($r('app.float.default_22'))
//         .fontColor('black')
//         .fontWeight(500)
//         .fontSize($r('app.float.default_16'))
//         .fontFamily('HarmonyHeiTi-Medium')
//         .lineHeight($r('app.float.default_22'))
//         .textAlign(TextAlign.Start)
//         .margin({
//           top: $r('app.float.default_20'),
//           bottom: $r('app.float.default_10')
//         })
//
//       // 拷贝状态显示
//       Text(this.copyStatus)
//         .width($r('app.float.default_336'))
//         .height($r('app.float.default_40'))
//         .fontSize($r('app.float.default_14'))
//         .fontColor('black')
//         .textAlign(TextAlign.Center)
//         .margin({ bottom: $r('app.float.default_10') })
//
//       Row() {
//         Button('拷贝test.txt到沙箱')
//           .width($r('app.float.default_150'))
//           .height($r('app.float.default_40'))
//           .fontColor('black')
//           .backgroundColor($r('app.color.start_window_background'))
//           .fontSize($r('app.float.default_14'))
//           .onClick(() => {
//             this.onCopyTXTToSandbox();
//           })
//
//         Button('检查文件')
//           .width($r('app.float.default_150'))
//           .height($r('app.float.default_40'))
//           .fontColor('black')
//           .margin({ left: $r('app.float.default_12') })
//           .backgroundColor($r('app.color.start_window_background'))
//           .fontSize($r('app.float.default_14'))
//           .onClick(() => {
//             this.checkFileExists();
//           })
//       }
//       .width('100%')
//       .justifyContent(FlexAlign.Center)
//       .margin({ bottom: $r('app.float.default_20') })
//
//       Divider()
//         .strokeWidth(1)
//         .color($r('app.color.divider_color'))
//         .margin({
//           top: $r('app.float.default_10'),
//           bottom: $r('app.float.default_20')
//         })
//
//       // === 文件名输入区域 ===
//       Text('文件名称：')
//         .width($r('app.float.default_294'))
//         .height($r('app.float.default_22'))
//         .fontColor($r('app.color.text_color'))
//         .fontWeight(500)
//         .fontSize($r('app.float.default_16'))
//         .fontFamily('HarmonyHeiTi-Medium')
//         .lineHeight($r('app.float.default_22'))
//         .textAlign(TextAlign.Start)
//         .margin({
//           top: $r('app.float.default_13'),
//           bottom: $r('app.float.default_13'),
//           right: $r('app.float.default_8')
//         })
//
//       TextInput({ placeholder: '输入文件名（如：myfile.txt）', text: this.fileName })
//         .width($r('app.float.default_336'))
//         .height($r('app.float.default_40'))
//         .borderRadius($r('app.float.default_8'))
//         .backgroundColor($r('app.color.start_window_background'))
//         .padding({ left: 10, right: 10 })
//         .onChange((value: string) => {
//           this.fileName = value;
//         })
//         .margin({ bottom: $r('app.float.default_16') })
//
//       Text($r('app.string.textarea_default'))
//         .width($r('app.float.default_294'))
//         .height($r('app.float.default_22'))
//         .fontColor($r('app.color.text_color'))
//         .fontWeight(500)
//         .fontSize($r('app.float.default_16'))
//         .fontFamily('HarmonyHeiTi-Medium')
//         .lineHeight($r('app.float.default_22'))
//         .textAlign(TextAlign.Start)
//         .margin({
//           top: $r('app.float.default_13'),
//           bottom: $r('app.float.default_13'),
//           right: $r('app.float.default_8')
//         })
//
//       TextArea({ placeholder: '输入文件内容', text: this.content })
//         .width($r('app.float.default_336'))
//         .height($r('app.float.default_139'))
//         .borderRadius($r('app.float.default_24'))
//         .backgroundColor($r('app.color.start_window_background'))
//         .enableKeyboardOnFocus(false)
//         .onChange((value: string) => {
//           this.content = value
//         })
//
//       Column() {
//         Button($r('app.string.button1'))
//           .width($r('app.float.default_312'))
//           .height($r('app.float.default_40'))
//           // Write the information and clear the content so that the text box is cleared after you click Save.
//           .onClick(() => {
//             writeFile(this.content, this.fileName);
//             this.content = '';
//             this.fileName = '';
//           })
//       }
//       .width('100%')
//       .margin({ top: 40 })
//     }
//     .width('100%')
//     .onAppear(() => {
//       // 页面显示时检查文件是否存在
//       this.checkFileExists();
//     })
//   }
// }

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
import { fileIo as fs, fileShare } from '@kit.CoreFileKit';
import { filePreview } from '@kit.PreviewKit';



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

  // // // 新增：获取rawfile目录下的所有文件
  // private async getRawFileList(): Promise<string[]> {
  //   try {
  //     const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  //
  //     // 使用getRawFileList方法获取rawfile目录下的所有文件名
  //     const fileList: string[] = await context.resourceManager.getRawFileList() as string[];
  //     console.info("FileTab", "Rawfile文件列表:", fileList);
  //     return fileList;
  //   } catch (error) {
  //     console.error("FileTab", "获取rawfile文件列表失败:", error);
  //     return [];
  //   }
  // }


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

  //   // 新增：检查文件是否存在
  //   private checkFileExists(): void {
  //     try {
  //       let context = getContext(this) as common.UIAbilityContext;
  //       let sandboxDir: string = context.filesDir;
  //       //单文件测试
  //       let targetPath: string = sandboxDir + '/test.txt';
  //
  //       let stats = fs.statSync(targetPath);
  //       if (stats.isFile()) {
  //         this.copyStatus = `文件已存在，大小: ${stats.size} 字节`;
  //       } else {
  //         this.copyStatus = '文件不存在';
  //       }
  //     } catch (error) {
  //       this.copyStatus = '文件不存在';
  //     }
  //   }

  // 新增：更新沙箱文件列表
  // private async updateFileList(): Promise<void> {
  //   try {
  //     const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  //     const sandboxDir: string = context.filesDir;
  //
  //     // 读取沙箱目录下的文件
  //     const dir = fs.opendirSync(sandboxDir);
  //     const files: string[] = [];
  //     let entry = dir.readSync();
  //
  //     while (entry !== undefined) {
  //       if (entry.isFile()) {
  //         files.push(entry.name);
  //       }
  //       entry = dir.readSync();
  //     }
  //
  //     dir.closeSync();
  //     this.fileList = files.sort();
  //     console.info("FileTab", "沙箱文件列表:", files);
  //
  //   } catch (error) {
  //     console.error("FileTab", "读取沙箱文件列表失败:", error);
  //     this.fileList = [];
  //   }
  // }

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

  // 新增：检查单个文件是否存在
  private checkFileExists(fileName: string = 'test.txt'): void {
    try {
      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;
      const targetPath: string = sandboxDir + '/' + fileName;

      const stats = fs.statSync(targetPath);
      if (stats.isFile()) {
        this.copyStatus = `${fileName} 已存在，大小: ${stats.size} 字节`;
      } else {
        this.copyStatus = `${fileName} 不存在`;
      }
    } catch (error) {
      this.copyStatus = `${fileName} 不存在`;
    }
  }

  // // 新增：初始化方法 - 自动拷贝rawfile文件到沙箱
  // private async initializeRawFiles(): Promise<void> {
  //   try {
  //     // 1. 更新沙箱文件列表
  //     await this.updateFileList();
  //
  //     // 2. 获取rawfile文件列表
  //     const rawFileList: string[] = await this.getRawFileList();
  //
  //     if (rawFileList.length === 0) {
  //       this.copyStatus = 'rawfile中没有文件';
  //       return;
  //     }
  //
  //     // 3. 检查是否需要拷贝文件
  //     const needCopy: boolean = await this.checkIfNeedCopy(rawFileList);
  //
  //     if (needCopy) {
  //       // 4. 自动拷贝所有rawfile文件
  //       this.copyStatus = `检测到 ${rawFileList.length} 个rawfile文件，开始自动拷贝...`;
  //       console.info("FileTab", "开始自动拷贝rawfile文件");
  //       await this.copyAllRawFilesToSandbox();
  //     } else {
  //       this.copyStatus = `rawfile文件已存在沙箱中 (${rawFileList.length} 个文件)`;
  //       console.info("FileTab", "rawfile文件已存在，跳过拷贝");
  //     }
  //
  //   } catch (error) {
  //     console.error("FileTab", "初始化失败:", error);
  //     this.copyStatus = '初始化失败';
  //   }
  // }
  //
  // // 新增：检查是否需要拷贝文件
  // private async checkIfNeedCopy(rawFileList: string[]): Promise<boolean> {
  //   try {
  //     const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  //     const sandboxDir: string = context.filesDir;
  //
  //     // 检查是否所有rawfile文件都已存在于沙箱中
  //     for (const fileName of rawFileList) {
  //       const targetPath: string = sandboxDir + '/' + fileName;
  //       try {
  //         const stats = fs.statSync(targetPath);
  //         if (!stats.isFile()) {
  //           return true; // 文件不存在或不是文件，需要拷贝
  //         }
  //       } catch (error) {
  //         return true; // 文件不存在，需要拷贝
  //       }
  //     }
  //
  //     // 所有文件都存在，不需要拷贝
  //     return false;
  //   } catch (error) {
  //     console.error("FileTab", "检查文件失败:", error);
  //     return true; // 出错时默认执行拷贝
  //   }
  // }


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


  // 新增：读取并显示文件内容，仅能适用于txt文本文件，pdf的读取还需小心

  // private readAndDisplayFile(fileName: string): void {
  //   try {
  //     const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  //     const sandboxDir: string = context.filesDir;
  //     const filePath: string = sandboxDir + '/' + fileName;
  //
  //     // 检查文件是否存在
  //     const stats = fs.statSync(filePath);
  //     if (!stats.isFile()) {
  //       this.message = `文件 ${fileName} 不存在`;
  //       return;
  //     }
  //
  //     // 读取文件内容
  //     const fileContent: Uint8Array = fs.readFileSync(filePath);
  //
  //     // 尝试解码为文本
  //     try {
  //       const decoder = new TextDecoder('utf-8');
  //       const textContent: string = decoder.decode(fileContent);
  //       this.message = `=== ${fileName} (${stats.size} 字节) ===\n${textContent}`;
  //     } catch (decodeError) {
  //       // 如果不是文本文件，显示二进制信息
  //       this.message = `=== ${fileName} (${stats.size} 字节) ===\n[二进制文件，无法显示文本内容]`;
  //     }
  //
  //   } catch (error) {
  //     console.error("FileTab", `读取文件 ${fileName} 失败:`, error);
  //     this.message = `读取文件 ${fileName} 失败`;
  //   }
  // }

  // 新增：预览文件
  // private async previewFile(fileName: string): Promise<void> {
  //   try {
  //     // 获取UIContext
  //     // let uiContext = this.getUIContext();
  //     let uiContext = this.getUIContext().getHostContext() as Context;
  //
  //     if (!uiContext) {
  //       this.copyStatus = '无法获取UI上下文';
  //       return;
  //     }
  //
  //     // 获取文件路径
  //     const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  //     const sandboxDir: string = context.filesDir;
  //     const filePath: string = sandboxDir + '/' + fileName;
  //
  //     // 检查文件是否存在
  //     try {
  //       const stats = fs.statSync(filePath);
  //       if (!stats.isFile()) {
  //         this.copyStatus = `文件 ${fileName} 不存在`;
  //         return;
  //       }
  //     } catch (error) {
  //       this.copyStatus = `文件 ${fileName} 不存在`;
  //       return;
  //     }
  //
  //     // 构建文件URI
  //     const fileUri = 'file://' + filePath;
  //
  //     // 设置预览窗口显示信息（可选）
  //     const displayInfo: filePreview.DisplayInfo = {
  //       x: 100,    // 窗口起始x坐标
  //       y: 100,    // 窗口起始y坐标
  //       width: 800, // 窗口宽度
  //       height: 800 // 窗口高度
  //     };
  //
  //     // 构建预览信息
  //     const fileInfo: filePreview.PreviewInfo = {
  //       title: fileName,  // 预览标题
  //       uri: fileUri,     // 文件URI
  //       mimeType: this.getMimeType(fileName) // 根据文件扩展名获取MIME类型
  //     };
  //
  //     this.copyStatus = `正在打开预览: ${fileName}...`;
  //
  //     // 打开预览
  //     await filePreview.openPreview(uiContext, fileInfo, displayInfo);
  //
  //     this.copyStatus = `已打开预览: ${fileName}`;
  //     console.info('FileTab', 'Succeeded in opening preview');
  //
  //   } catch (error) {
  //     const err = error as BusinessError;
  //     this.copyStatus = `预览失败: ${err.message}`;
  //     console.error(`FileTab`, `Failed to open preview, err.code = ${err.code}, err.message = ${err.message}`);
  //   }
  // }

  // async previewFile(fileName:string): Promise<void> {
  //   const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;const sandboxDir: string = context.filesDir;
  //   const selectedFilePath: string = sandboxDir + '/' + fileName;
  //   if (!selectedFilePath) {
  //     console.log("请先选择文件");
  //     return;
  //   }
  //
  //   try {
  //     let uiContext = this.getUIContext().getHostContext() as Context;
  //
  //     // 1. 检查文件是否存在
  //     try {
  //       await fs.access(selectedFilePath);
  //     } catch {
  //       console.log('文件不存在或不可访问');
  //       return;
  //     }
  //
  //     // 2. 检查是否可预览
  //     const uri = selectedFilePath.startsWith('file://') ?
  //       selectedFilePath :
  //       `file://${selectedFilePath}`;
  //
  //     await fileShare.persistPermission([
  //       {
  //         uri: uri,
  //         operationMode: fileShare.OperationMode.READ_MODE
  //       }
  //     ]);
  //
  //     const canPreview = await filePreview.canPreview(uiContext, uri);
  //     if (!canPreview) {
  //       console.log('不支持预览此文件类型');
  //       return;
  //     }
  //
  //     // 3. 准备预览参数
  //     const fileInfo: filePreview.PreviewInfo = {
  //       title: this.fileName,
  //       uri: uri,
  //       mimeType: this.getMimeType(selectedFilePath)
  //     };
  //
  //     // 4. 检查是否已有预览窗口
  //     const hasDisplayed = await filePreview.hasDisplayed(uiContext);
  //
  //     if (hasDisplayed) {
  //       // 已有窗口则关闭
  //       await filePreview.closePreview(uiContext)
  //     } else {
  //       // 新开预览窗口
  //       const displayInfo: filePreview.DisplayInfo = {
  //         x: 100,  // 窗口起始x坐标
  //         y: 100,  // 窗口起始y坐标
  //         width: 800, // 窗口宽度
  //         height: 800 // 窗口高度
  //       };
  //
  //       await filePreview.openPreview(uiContext, fileInfo, displayInfo);
  //     }
  //
  //     console.info('文件预览成功');
  //   } catch (err) {
  //     const error = err as BusinessError;
  //     console.error(`预览失败，错误码: ${error.code}, 错误信息: ${error.message}`);
  //   }
  // }

  private async previewFile(fileName: string): Promise<void> {
    try {
      console.info('FileTab', '开始预览文件:', fileName);

      const context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
      const sandboxDir: string = context.filesDir;
      const filePath: string = sandboxDir + '/' + fileName;

      // 检查文件是否存在
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          this.copyStatus = `${fileName} 不是文件`;
          return;
        }
      } catch (error) {
        this.copyStatus = `${fileName} 不存在`;
        return;
      }

      // 获取正确的URI格式
      // HarmonyOS沙箱文件的正确URI格式
      const fileUri = `internal://app/${fileName}`;

      console.info('FileTab', '文件URI:', fileUri);
      console.info('FileTab', '文件路径:', filePath);

      // 获取UIContext
      let uiContext: common.UIAbilityContext;
      try {
        // 方式1：使用getUIContext
        const uiContextObj = this.getUIContext();
        uiContext = uiContextObj.getHostContext() as common.UIAbilityContext;
      } catch (error) {
        // 方式2：备用方法，直接使用context
        uiContext = context;
      }

      // 构建预览参数
      const displayInfo: filePreview.DisplayInfo = {
        x: 100,
        y: 100,
        width: 800,
        height: 600
      };

      const fileInfo: filePreview.PreviewInfo = {
        title: fileName,
        uri: fileUri,
        mimeType: this.getMimeType(fileName)
      };

      this.copyStatus = `正在打开 ${fileName}...`;

      // 直接打开预览，去掉不必要的权限检查
      await filePreview.openPreview(uiContext, fileInfo, displayInfo);

      this.copyStatus = `已打开预览: ${fileName}`;
      console.info('FileTab', '预览成功');

    } catch (error) {
      const err = error as BusinessError;
      console.error('FileTab', `预览失败, 错误码: ${err.code}, 错误信息: ${err.message}`);

      // 根据错误码提供具体提示
      switch (err.code) {
        case 201:
          this.copyStatus = '权限验证失败，请检查应用权限设置';
          break;
        case 202:
          this.copyStatus = `没有应用可以打开 ${fileName}`;
          break;
        case 206:
          this.copyStatus = '文件不存在或无法访问';
          break;
        default:
          this.copyStatus = `预览失败: ${err.message}`;
      }
    }
  }

  private getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';

      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';

      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'ogg':
        return 'audio/ogg';

      case 'txt':
      case 'log':
        return 'text/plain';

      case 'html':
      case 'htm':
        return 'text/html';

      default:
        return 'application/octet-stream';
    }
  }

  // 修改文件类型检测方法，用于UI显示
  private detectFileType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop() || '';

    const typeMap: Record<string, string> = {
      // 文档
      'pdf': 'PDF文档',
      'doc': 'Word文档',
      'docx': 'Word文档',
      'xls': 'Excel表格',
      'xlsx': 'Excel表格',
      'ppt': 'PowerPoint演示',
      'pptx': 'PowerPoint演示',
      'txt': '文本文件',
      'rtf': '富文本文件',

      // 图片
      'jpg': 'JPEG图片',
      'jpeg': 'JPEG图片',
      'png': 'PNG图片',
      'gif': 'GIF图片',
      'bmp': '位图文件',
      'svg': '矢量图形',

      // 音频
      'mp3': 'MP3音频',
      'wav': 'WAV音频',
      'ogg': 'OGG音频',

      // 视频
      'mp4': 'MP4视频',
      'avi': 'AVI视频',
      'mov': 'MOV视频',

      // 压缩文件
      'zip': 'ZIP压缩包',
      'rar': 'RAR压缩包',
      '7z': '7Z压缩包',

      // 默认
      '': '未知文件'
    };

    return typeMap[extension] || `${extension.toUpperCase()}文件`;
  }





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
          .width('45%')
          .height($r('app.float.default_40'))
          .fontColor('white')
          .backgroundColor('#4CAF50')
          .fontSize($r('app.float.default_14'))
          .onClick((): void => {
            this.copyAllRawFilesToSandbox();
          })
        //
        // Button('清空沙箱')
        //   .width('45%')
        //   .height($r('app.float.default_40'))
        //   .fontColor('white')
        //   .margin({ left: $r('app.float.default_12') })
        //   .backgroundColor('#f44336')
        //   .fontSize($r('app.float.default_14'))
        //   .onClick((): void => {
        //     this.clearSandboxFiles();
        //   })
      }
      .width('90%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: $r('app.float.default_10') })

      // 沙箱文件列表显示
      if (this.fileList.length > 0) {
        Text('沙箱文件列表:')
          .width('90%')
          .height($r('app.float.default_22'))
          .fontColor('black')
          .fontWeight(500)
          .fontSize($r('app.float.default_14'))
          .textAlign(TextAlign.Start)
          .margin({ bottom: $r('app.float.default_10') })

        Scroll() {
          Column() {
            ForEach(this.fileList, (fileName: string) => {
              Row() {
                Text(fileName)
                  .width('70%')
                  .fontSize($r('app.float.default_12'))
                  .fontColor('black')
                  .textAlign(TextAlign.Start)

                Row() {
                  Button('查看')
                    .width(50)
                    .height(30)
                    .fontSize($r('app.float.default_10'))
                    .backgroundColor('#2196F3')
                    .onClick((): void => {
                      this.previewFile(fileName);
                    })

                  Button('检查')
                    .width(50)
                    .height(30)
                    .fontSize($r('app.float.default_10'))
                    .margin({ left: 5 })
                    .backgroundColor('#FF9800')
                    .onClick((): void => {
                      this.checkFileExists(fileName);
                    })
                }
                .width('30%')
                .justifyContent(FlexAlign.End)
              }
              .width('100%')
              .padding(5)
              .backgroundColor('#f5f5f5')
              .margin({ bottom: 5 })
            })
          }
          .width('100%')
        }
        .height(150)
        .width('90%')
        .margin({ bottom: $r('app.float.default_20') })
      }

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
      .margin({ top: 40 })
    }
    .width('100%')
    .onAppear((): void => {
      // 页面显示时自动执行初始化
      // this.initializeRawFiles();
    })
  }


}