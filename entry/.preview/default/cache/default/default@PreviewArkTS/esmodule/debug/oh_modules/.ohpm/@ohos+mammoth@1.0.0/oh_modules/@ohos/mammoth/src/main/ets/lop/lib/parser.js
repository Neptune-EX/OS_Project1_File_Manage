import TokenIterator from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/lop/lib/TokenIterator"

export const Parser = function(options) {
    var parseTokens = function(parser, tokens) {
        return parser(new TokenIterator(tokens));
    };
    
    return {
        parseTokens: parseTokens
    };
};
