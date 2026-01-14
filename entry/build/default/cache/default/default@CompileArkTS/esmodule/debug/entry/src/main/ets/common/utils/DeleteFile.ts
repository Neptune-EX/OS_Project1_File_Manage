import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
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
    }
    catch (error) {
        console.error(`删除文件失败: ${error.message}`);
        return false;
    }
}
