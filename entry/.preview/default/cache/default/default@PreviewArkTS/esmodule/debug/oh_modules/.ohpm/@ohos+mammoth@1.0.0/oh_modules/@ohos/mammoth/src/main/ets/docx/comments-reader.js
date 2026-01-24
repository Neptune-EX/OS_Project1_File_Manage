import * as documents from '@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/documents';
import { Result } from '@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/results';

export function createCommentsReader(bodyReader) {
    function readCommentsXml(element) {
        return Result.combine(element.getElementsByTagName("w:comment")
            .map(readCommentElement));
    }

    function readCommentElement(element) {
        var id = element.attributes["w:id"];

        function readOptionalAttribute(name) {
            return (element.attributes[name] || "").trim() || null;
        }

        return bodyReader.readXmlElements(element.children)
            .map(function(body) {
                return documents.comment({
                    commentId: id,
                    body: body,
                    authorName: readOptionalAttribute("w:author"),
                    authorInitials: readOptionalAttribute("w:initials")
                });
            });
    }
    
    return readCommentsXml;
}
