export { Parser } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/parser";
export * as rules from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/rules";
export * as errors from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/errors"
export * as results from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/parsing-results"
export * as StringSource from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/StringSource";
export * as Token from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/Token";
export * as bottomUp from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/bottom-up";
export { RegexTokeniser } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/regex-tokeniser";
export const rule = function(ruleBuilder) {
    var rule;
    return function(input) {
        if (!rule) {
            rule = ruleBuilder();
        }
        return rule(input);
    };
};
