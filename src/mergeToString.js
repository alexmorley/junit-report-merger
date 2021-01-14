const { create } = require("xmlbuilder2");

/**
 * Merges contents of given XML strings and returns resulting XML string.
 * @param {String[]} srcStrings   Array of strings to merge together.
 * @param {Object} [options]   Merge options. Currently unused.
 * @return {String}
 */
function mergeToString(srcStrings, options) {
    const targetDoc = create({
        testsuites: {},
    });
    const targetSuite = targetDoc.root().ele("testsuite", { name: "pytest" });

    const attrs = {
        failures: 0,
        errors: 0,
        tests: 0,
        time: 0.0,
    };

    srcStrings.forEach((srcString) => {
        const doc = create(srcString, {});

        doc.root().each(
            (xmlBuilder) => {
                if (xmlBuilder.node.nodeName.toLowerCase() === "testsuite") {
                    for (const attrNode of xmlBuilder.node.attributes) {
                        const name = attrNode.name;
                        if (name in attrs) {
                            attrs[name] += Number(attrNode.value);
                        }
                    }
                    xmlBuilder.each((testcase) => {
                        if (
                            testcase.node.nodeName.toLowerCase() === "testcase"
                        ) {
                            targetSuite.import(testcase);
                        }
                    });
                }
            },
            true,
            true
        );

        for (const attr in attrs) {
            targetDoc.root().att(attr, attrs[attr]);
        }
    });

    return targetDoc.toString({
        prettyPrint: true,
        noDoubleEncoding: true,
    });
}

module.exports = { mergeToString };
