#!/usr/bin/env node
'use strict';

var fs = require('fs');
var amazonEntryStamp = require('./amzEntryStamp.js').amazonEntryStamp;
var comp = require('./amzEntryStamp.js').comp;
var colors = require('colors/safe');

function readFile(filename) {
    return new Promise(function (fullfill, reject) {
        fs.readFile(filename, function (err, data) {
            if (err) {
                reject(err);
            } else {
                fullfill(data);
            }
        });
    });
}

function readJSONFile(filename) {
    return readFile(filename).then(JSON.parse);
}

const DIFF_TO_COLOR = {};
DIFF_TO_COLOR[comp.NO_COMPARABLE] = "red";
DIFF_TO_COLOR[comp.NEW_ENTRY] = "grey";
DIFF_TO_COLOR[comp.EXACTLY_EQUAL]= "grey";
DIFF_TO_COLOR[comp.CHEAPER] = "blue";
DIFF_TO_COLOR[comp.MORE_EXPENSIVE] = "grey";

function jsonDiff(previousEntries, newEntries) {
    return newEntries.map(entry => {
        let previousEntry = previousEntries.find(e => e.hash === entry.hash);
        entry.diffStatus = entry.diff(previousEntry);
        if (entry.diffStatus === comp.CHEAPER ||
            entry.diffStatus === comp.MORE_EXPENSIVE) {
            entry.diffPrice = entry.getFinalPrice() - previousEntry.getFinalPrice();
        }
        return entry;
    });
}

function stripUsedLabel(txt) {
    if (!txt) {
        return txt;
    }

    return txt.replace(/Used - /, "");
}

function padText(txt, length) {
    if (txt.length > length) {
        return txt.substring(0, length);
    }

    var padding = new Array(length - txt.length).join(' ');
    return txt + padding;
}

function prettyPrint(diffed) {
    diffed.forEach((entry, idx) => {
        let priceTxt = entry.finalPrice.toFixed(2);
        if (entry.diffPrice) {
            priceTxt = priceTxt.concat(" (" + entry.diffPrice.toFixed(2) + ")");
        }

        let line = padText(priceTxt, 16) +
            padText(entry.sellerName, 24) +
            padText(stripUsedLabel(entry.condition), 12) +
            padText(entry.description, 50);

        let colorFunc = DIFF_TO_COLOR[entry.diffStatus];
        if (idx === 0 &&
            (entry.diffStatus === comp.NEW_ENTRY || entry.diffStatus === comp.CHEAPER)) {
            colorFunc = "green";
        }

        console.log(colors[colorFunc](line));
    });
}

Promise.all([process.argv[2], process.argv[3]].map(readJSONFile))
    .then(function (contents) {
        let oldObjs = contents[0].entries.map(amazonEntryStamp);
        let newObjs = contents[1].entries.map(amazonEntryStamp);
        return jsonDiff(oldObjs, newObjs);
    })
    .then(prettyPrint)
    .catch(function (err) {
        console.log("Something wrong", err);
    });
