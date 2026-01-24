import _ from '@package:pkg_modules/.ohpm/underscore@1.13.7/pkg_modules/underscore/modules/index-all';
import * as docxReader from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/docx/docx-reader";
import * as docxStyleMap from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/docx/style-map";
import { DocumentConverter } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/document-to-html";
import { convertElementToRawText } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/raw-text";
import { readStyle } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/style-reader";
import { readOptions } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/options-reader";
import * as unzip from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/unzip";
import { Result } from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/results";
import * as images from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/images";
import * as transforms from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/transforms";
import * as underline from "@package:pkg_modules/.ohpm/@ohos+mammoth@1.0.0/pkg_modules/@ohos/mammoth/src/main/ets/underline";
import Buffer from '@ohos:buffer';

function convertToHtml(input, options) {
    return convert(input, options);
}

function convertToMarkdown(input, options) {
    var markdownOptions = Object.create(options || {});
    markdownOptions.outputFormat = "markdown";
    return convert(input, markdownOptions);
}

function convert(input, options) {
    options = readOptions(options);

    return unzip.openZip(input)
        // .tap(function(docxFile) {
        //     return docxStyleMap.readStyleMap(docxFile).then(function(styleMap) {
        //         options.embeddedStyleMap = styleMap;
        //     });
        // })
        .then(function(docxFile) {
            docxStyleMap.readStyleMap(docxFile).then(function(styleMap) {
                options.embeddedStyleMap = styleMap;
            });
            return docxReader.read(docxFile, input, options)
                .then(function(documentResult) {
                    return documentResult.map(options.transformDocument);
                })
                .then(function(documentResult) {
                    return convertDocumentToHtml(documentResult, options);
                });
        });
}

function readEmbeddedStyleMap(input) {
    return unzip.openZip(input)
        .then(docxStyleMap.readStyleMap);
}

function convertDocumentToHtml(documentResult, options) {
    var styleMapResult = parseStyleMap(options.readStyleMap());
    var parsedOptions = _.extend({}, options, {
        styleMap: styleMapResult.value
    });
    var documentConverter = new DocumentConverter(parsedOptions);

    return documentResult.flatMapThen(function(document) {
        return styleMapResult.flatMapThen(function(styleMap) {
            return documentConverter.convertToHtml(document);
        });
    });
}

function parseStyleMap(styleMap) {
    return Result.combine((styleMap || []).map(readStyle))
        .map(function(styleMap) {
            return styleMap.filter(function(styleMapping) {
                return !!styleMapping;
            });
        });
}


function extractRawText(input) {
    return unzip.openZip(input)
        .then(docxReader.read)
        .then(function(documentResult) {
            return documentResult.map(convertElementToRawText);
        });
}

function embedStyleMap(input, styleMap) {
    return unzip.openZip(input)
        // .tap(function(docxFile) {
        //     return docxStyleMap.writeStyleMap(docxFile, styleMap);
        // })
        .then(function(docxFile) {
            docxStyleMap.writeStyleMap(docxFile, styleMap);
            return docxFile.toArrayBuffer();
        })
        .then(function(arrayBuffer) {
            return {
                toArrayBuffer: function() {
                    return arrayBuffer;
                },
                toBuffer: function() {
                    return Buffer.from(arrayBuffer);
                }
            };
        });
}

function styleMapping() {
    throw new Error('Use a raw string instead of mammoth.styleMapping e.g. "p[style-name=\'Title\'] => h1" instead of mammoth.styleMapping("p[style-name=\'Title\'] => h1")');
};

export {
    convertToHtml,
    convertToMarkdown,
    convert,
    extractRawText,
    images,
    transforms,
    underline,
    embedStyleMap,
    readEmbeddedStyleMap,
    styleMapping
}
