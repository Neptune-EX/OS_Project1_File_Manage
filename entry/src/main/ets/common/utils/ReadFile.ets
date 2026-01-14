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
// import { fileIo } from '@kit.CoreFileKit';
// import { common } from '@kit.AbilityKit';
// import { buffer } from '@kit.ArkTS';
// import { hilog } from '@kit.PerformanceAnalysisKit';
//
// const uiContext: UIContext | undefined = AppStorage.get('uiContext');
//
// // Obtaining the Application File Path
// let context = uiContext!.getHostContext() as common.UIAbilityContext;
// let filesDir = context.filesDir;
// let res: string = '';
//
// /**
//  * readFile.
//  * Reads the contents of a file and returns a string.
//  * @return string.
//  */
// export function readFile(filename: string): string {
//   try {
//     let filePath = filesDir + '/' + filename;
//     console.log(`文件路径:${filePath}`);
//
//     let stat = fileIo.statSync(filePath);
//     let size = stat.size;
//     let buf = new ArrayBuffer(size);
//     // Open a file stream based on the file path.
//     let fileStream = fileIo.createStreamSync(filePath, "r+");
//     // File stream reading information
//     fileStream.readSync(buf);
//     // Converts the read information to the string type and returns the string type.
//     let con = buffer.from(buf, 0);
//     res = con.toString();
//     fileStream.close();
//     return res;
//   } catch (error) {
//     hilog.error(0x0000, 'readFile', `readFile catch error, code: ${error.code}, message: ${error.message}`);
//     return '';
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

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { buffer } from '@kit.ArkTS';
import { hilog } from '@kit.PerformanceAnalysisKit';

const uiContext: UIContext | undefined = AppStorage.get('uiContext');

// Obtaining the Application File Path
let context = uiContext!.getHostContext() as common.UIAbilityContext;
let filesDir = context.filesDir;
let res: string = '';

/**
 * readFile.
 * Reads the contents of a file and returns a string.
 * @return string.
 */
export function readFile(filename: string): string {
  try {
    let filePath = filesDir + '/' + filename;
    console.log(`文件路径:${filePath}`);

    let stat = fileIo.statSync(filePath);
    let size = stat.size;
    console.log(`文件大小: ${size} 字节`);

    // 如果文件为空，直接返回空字符串
    if (size === 0) {
      console.log('文件为空');
      return '';
    }

    let buf = new ArrayBuffer(size);
    let fileStream = fileIo.createStreamSync(filePath, "r");

    // 读取文件内容
    let bytesRead = fileStream.readSync(buf);
    console.log(`实际读取字节数: ${bytesRead}`);

    // 方法1: 使用 buffer.from 的正确方式
    // 注意：第二个参数是偏移量，第三个参数是长度
    let con = buffer.from(buf, 0, bytesRead);
    res = con.toString(); // 默认使用 UTF-8 编码

    // 方法2: 如果方法1不行，尝试使用 String.fromCharCode
    // let uint8Array = new Uint8Array(buf, 0, bytesRead);
    // let str = '';
    // for (let i = 0; i < uint8Array.length; i++) {
    //   str += String.fromCharCode(uint8Array[i]);
    // }
    // res = str;

    fileStream.close();

    console.log(`读取的内容长度: ${res.length}`);
    if (res.length > 0) {
      console.log(`内容预览: ${res.substring(0, Math.min(100, res.length))}`);
    }

    return res;
  } catch (error) {
    hilog.error(0x0000, 'readFile', `readFile catch error, code: ${error.code}, message: ${error.message}`);
    return '';
  }
}