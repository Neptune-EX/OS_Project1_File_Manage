/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License,Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

// 全局沙箱目录
let _filesDir: string = '';

/**
 * 初始化（只需要调用一次）
 */
export function initDeleteUtils(context: common.Context): void {
  const uiAbilityContext = context as common.UIAbilityContext;
  _filesDir = uiAbilityContext.filesDir;
}

/**
 * 函数1：删除文件
 * @param filename 文件名
 * @returns 是否删除成功
 */
export function deleteFile(filename: string): boolean {
  try {
    if (!_filesDir) {
      console.error('DeleteUtils未初始化');
      return false;
    }

    if (!filename || filename.trim() === '') {
      console.error('文件名为空');
      return false;
    }

    const filePath = `${_filesDir}/${filename}`;

    // 检查文件是否存在
    if (!fileIo.accessSync(filePath)) {
      console.log(`文件不存在: ${filename}`);
      return false;
    }

    // 删除文件
    fileIo.unlinkSync(filePath);
    console.log(`文件删除成功: ${filename}`);

    return true;
  } catch (error) {
    console.error(`删除文件失败: ${error.message}`);
    return false;
  }
}
