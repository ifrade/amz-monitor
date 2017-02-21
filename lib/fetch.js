#!/usr/bin/env node
"use strict";
const mergeJson = require('./jsonmerge');

const amazon = require('./amzPage2json.js');
const ebay = require('./ebayPage2json.js');

function asPromise(getUsedCopiesFn) {
    return (asin) => {
        return new Promise(function (fullfill, reject) {
            getUsedCopiesFn(asin, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    fullfill(result);
                }
            });
        });
    };
}

if (require.main === module) {
    if (process.argv.length !== 3) {
        console.error(process.argv[1], "[asin]");
        process.exit(-1);
    }

    const asin = process.argv[2];

    const amzFetch = asPromise(amazon.getUsedCopies);
    const ebayFetch = asPromise(ebay.getUsedCopies);

    Promise.all([amzFetch(asin), ebayFetch(asin)])
        .then(results => {
            let [amzResult, ebayResult] = results;
            let resultsTogether = mergeJson(amzResult, ebayResult);

            if (resultsTogether.length === 0) {
                process.exit(2);
            }

            console.log(JSON.stringify(resultsTogether.slice(0, 10)));
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
