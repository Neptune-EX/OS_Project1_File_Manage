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
let _trashDir: string = '';

interface TrashPathInfo {
  trashPath: string;
  finalName: string;
}

function buildUniqueTrashPath(filename: string): TrashPathInfo {
  let baseName = filename;
  let ext = '';
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex > 0) {
    baseName = filename.substring(0, dotIndex);
    ext = filename.substring(dotIndex);
  }

  let candidate = filename;
  let counter = 1;
  while (true) {
    const candidatePath = `${_trashDir}/${candidate}`;
    try {
      fileIo.statSync(candidatePath);
      candidate = `${baseName}_${counter}${ext}`;
      counter++;
    } catch (e) {
      const info: TrashPathInfo = { trashPath: candidatePath, finalName: candidate };
      return info;
    }
  }
}

/**
 * 初始化（只需要调用一次）
 */
export function initDeleteUtils(context: common.Context): void {
  const uiAbilityContext = context as common.UIAbilityContext;
  _filesDir = uiAbilityContext.filesDir;
  _trashDir = `${_filesDir}/.trash`;

  // 确保回收站目录存在
  try {
    try {
      fileIo.statSync(_trashDir);
    } catch (e) {
      fileIo.mkdirSync(_trashDir);
      console.log('创建回收站目录:', _trashDir);
    }
  } catch (error) {
    console.error('初始化回收站失败:', error);
  }
}

/**
 * 删除文件（移动到回收站）
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
    try {
      fileIo.statSync(filePath);
    } catch (e) {
      console.log(`文件不存在: ${filename}`);
      return false;
    }

    // 移动文件到回收站
    const trashInfo = buildUniqueTrashPath(filename);
    const trashPath = trashInfo.trashPath;
    const metaPath = `${trashPath}.meta`;

    try {
      fileIo.renameSync(filePath, trashPath);

      // 保存元数据
      const deleteTime = Date.now();
      const metaContent = `${filePath}\n${deleteTime}`;
      const metaFile = fileIo.openSync(metaPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY);
      fileIo.writeSync(metaFile.fd, metaContent);
      fileIo.closeSync(metaFile);

      console.log(`文件已移动到回收站: ${trashInfo.finalName}`);
      return true;
    } catch (moveError) {
      console.error(`移动到回收站失败: ${filename}`, moveError);
      return false;
    }
  } catch (error) {
    console.error(`删除文件失败: ${error}`);
    return false;
  }
}
