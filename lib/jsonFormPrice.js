#!/usr/bin/env node
'use strict';

var amazonEntryStamp = require('./amzEntryStamp.js').amazonEntryStamp;
var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    let inputJSON = inputChunks.join();
    let parsedData = JSON.parse(inputJSON);
    let stamp = amazonEntryStamp(parsedData);
    stdout.write("" + stamp.getFinalPrice().toFixed(2));
});
