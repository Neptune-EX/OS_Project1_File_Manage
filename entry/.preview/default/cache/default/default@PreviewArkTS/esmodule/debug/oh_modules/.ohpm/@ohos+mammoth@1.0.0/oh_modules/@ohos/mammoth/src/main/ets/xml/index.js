import * as nodes from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/xml/nodes";
import { readString } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/xml/reader";
import { writeString } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/xml/writer";

const Element = nodes.Element;
const element = nodes.element;
const emptyElement = nodes.emptyElement;
const text = nodes.text;

export {
    Element,
    element,
    emptyElement,
    text,
    readString,
    writeString
};
