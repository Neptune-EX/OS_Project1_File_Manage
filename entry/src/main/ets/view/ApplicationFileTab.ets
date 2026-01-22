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
import { fileIo as fs } from '@kit.CoreFileKit';



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

  // 新增：拷贝TXT文件到沙箱
  private onCopyTXTToSandbox(): void {
    try {
      // 获取UIAbilityContext
      let context = getContext(this) as common.UIAbilityContext;

      // 从rawfile读取文件内容
      let fileContent: Uint8Array = context.resourceManager.getRawFileContentSync("test.txt");
      console.info("FileTab", "getRawFileContentSync done");

      // 获取沙箱目录
      let sandboxDir: string = context.filesDir;
      console.info("FileTab", "sandboxDir: " + sandboxDir);

      // 目标文件路径
      let targetPath: string = sandboxDir + '/test.txt';
      console.info("FileTab", "targetPath: " + targetPath);

      // 创建并写入文件
      let file = fs.openSync(targetPath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      let writeLen = fs.writeSync(file.fd, fileContent.buffer as ArrayBuffer);
      fs.closeSync(file);

      this.copyStatus = `拷贝成功！文件大小: ${writeLen} 字节`;
      console.info("FileTab", "File copied successfully, size: " + writeLen);

    } catch (error) {
      let code = (error as BusinessError).code;
      let message = (error as BusinessError).message;
      this.copyStatus = `拷贝失败！错误码: ${code}, 信息: ${message}`;
      console.error("FileTab", `Copy failed, error code: ${code}, message: ${message}.`);
    }
  }

  // 新增：检查文件是否存在
  private checkFileExists(): void {
    try {
      let context = getContext(this) as common.UIAbilityContext;
      let sandboxDir: string = context.filesDir;
      //单文件测试
      let targetPath: string = sandboxDir + '/test.txt';

      let stats = fs.statSync(targetPath);
      if (stats.isFile()) {
        this.copyStatus = `文件已存在，大小: ${stats.size} 字节`;
      } else {
        this.copyStatus = '文件不存在';
      }
    } catch (error) {
      this.copyStatus = '文件不存在';
    }
  }


  build() {
    Column() {
      // === 文件拷贝功能区域 ===
      Text('文件拷贝功能')
        .width($r('app.float.default_294'))
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
      Text(this.copyStatus)
        .width($r('app.float.default_336'))
        .height($r('app.float.default_40'))
        .fontSize($r('app.float.default_14'))
        .fontColor('black')
        .textAlign(TextAlign.Center)
        .margin({ bottom: $r('app.float.default_10') })

      Row() {
        Button('拷贝test.txt到沙箱')
          .width($r('app.float.default_150'))
          .height($r('app.float.default_40'))
          .fontColor('black')
          .backgroundColor($r('app.color.start_window_background'))
          .fontSize($r('app.float.default_14'))
          .onClick(() => {
            this.onCopyTXTToSandbox();
          })

        Button('检查文件')
          .width($r('app.float.default_150'))
          .height($r('app.float.default_40'))
          .fontColor('black')
          .margin({ left: $r('app.float.default_12') })
          .backgroundColor($r('app.color.start_window_background'))
          .fontSize($r('app.float.default_14'))
          .onClick(() => {
            this.checkFileExists();
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: $r('app.float.default_20') })

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
        .onChange((value: string) => {
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
        .onChange((value: string) => {
          this.content = value
        })

      Column() {
        Button($r('app.string.button1'))
          .width($r('app.float.default_312'))
          .height($r('app.float.default_40'))
          // Write the information and clear the content so that the text box is cleared after you click Save.
          .onClick(() => {
            writeFile(this.content, this.fileName);
            this.content = '';
            this.fileName = '';
          })
      }
      .width('100%')
      .margin({ top: 40 })
    }
    .width('100%')
    .onAppear(() => {
      // 页面显示时检查文件是否存在
      this.checkFileExists();
    })
  }
}