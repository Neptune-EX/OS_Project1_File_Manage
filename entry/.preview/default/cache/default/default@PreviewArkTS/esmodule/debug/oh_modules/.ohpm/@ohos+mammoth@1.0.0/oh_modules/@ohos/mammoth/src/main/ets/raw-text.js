import * as documents from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/documents";

export function convertElementToRawText(element) {
    if (element.type === "text") {
        return element.value;
    } else if (element.type === documents.types.tab) {
        return "\t";
    } else {
        var tail = element.type === "paragraph" ? "\n\n" : "";
        return (element.children || []).map(convertElementToRawText).join("") + tail;
    }
}

