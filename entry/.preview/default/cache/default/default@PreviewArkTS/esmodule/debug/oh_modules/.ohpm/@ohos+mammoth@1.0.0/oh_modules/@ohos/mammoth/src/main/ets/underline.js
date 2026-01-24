import * as htmlPaths from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/styles/html-paths";
import * as Html from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/html/index";

export function element(name) {
    return function(html) {
        return Html.elementWithTag(htmlPaths.element(name), [html]);
    };
}
