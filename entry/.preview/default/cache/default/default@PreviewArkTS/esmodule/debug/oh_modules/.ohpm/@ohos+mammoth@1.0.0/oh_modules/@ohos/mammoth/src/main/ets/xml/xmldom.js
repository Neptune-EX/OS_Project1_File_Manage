import * as xmldom from "@package:pkg_modules/.ohpm/@xmldom+xmldom@0.8.2/pkg_modules/@xmldom/xmldom/lib/index";
import * as dom from "@package:pkg_modules/.ohpm/@xmldom+xmldom@0.8.2/pkg_modules/@xmldom/xmldom/lib/dom";

function parseFromString(string, type) {
    var error = null;

    var domParser = new xmldom.DOMParser({
        onError: function(level, message) {
            error = {level: level, message: message};
        }
    });
    var document = domParser.parseFromString(string, type);
    if (error === null) {
        return document;
    } else {
        throw new Error(error.level + ": " + error.message);
    }
}

const Node = dom.Node;

export {
    parseFromString,
    Node
};
