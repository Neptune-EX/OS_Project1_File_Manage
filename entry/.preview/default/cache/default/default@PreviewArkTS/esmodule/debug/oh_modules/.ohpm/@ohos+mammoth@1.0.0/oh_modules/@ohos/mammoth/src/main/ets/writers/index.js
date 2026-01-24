import * as htmlWriter from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/writers/html-writer";
import * as markdownWriter from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/writers/markdown-writer";

export function writer(options) {
    options = options || {};
    if (options.outputFormat === "markdown") {
        return markdownWriter.writer();
    } else {
        return htmlWriter.writer(options);
    }
}
