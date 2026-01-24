import * as documents from '@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/documents';
import { Result } from '@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/results';

const createFootnotesReader = createReader.bind(this, "footnote");
const createEndnotesReader = createReader.bind(this, "endnote");

function createReader(noteType, bodyReader) {
    function readNotesXml(element) {
        return Result.combine(element.getElementsByTagName("w:" + noteType)
            .filter(isFootnoteElement)
            .map(readFootnoteElement));
    }

    function isFootnoteElement(element) {
        var type = element.attributes["w:type"];
        return type !== "continuationSeparator" && type !== "separator";
    }

    function readFootnoteElement(footnoteElement) {
        var id = footnoteElement.attributes["w:id"];
        return bodyReader.readXmlElements(footnoteElement.children)
            .map(function(body) {
                return documents.Note({noteType: noteType, noteId: id, body: body});
            });
    }
    
    return readNotesXml;
}

export {
    createFootnotesReader,
    createEndnotesReader
};
