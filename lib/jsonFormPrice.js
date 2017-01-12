#!/usr/bin/env node
'use strict';

var amazonEntryStamp = require('./amzEntryStamp.js').amazonEntryStamp;
var stdin = process.stdin,
    stdout = process.stdout,
    stderr = process.stderr,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    let inputJSON = inputChunks.join();
    try {
        let parsedData = JSON.parse(inputJSON);
        let stamp = amazonEntryStamp(parsedData);
        stdout.write("" + stamp.getFinalPrice().toFixed(2));
    } catch (e) {
        stderr.write("jsonFomPrice.js: Unable to parse", inputJSON);
    }
});
