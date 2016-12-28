"use strict";
const amazonEntryStamp = require('./amzEntryStamp.js').amazonEntryStamp;

// l1 and l2 are already sorted by price
//  in case of equality, chooses l1 first
function mergeLists(l1, l2) {

    if (!l1 || l1.length === 0) {
        return l2;
    }

    if (!l2 || l2.length === 0) {
        return l1;
    }

    if (l1[0].getFinalPrice() <= l2[0].getFinalPrice()) {
        return [l1.shift()].concat(mergeLists(l1, l2));
    } else {
        return [l2.shift()].concat(mergeLists(l1, l2));
    }
}

function mergeJson(l1, l2) {
    if (!l1) {
        return l2;
    }

    if (!l2) {
        return l1;
    }

    let l1AsStamp = l1.map(amazonEntryStamp);
    let l2AsStamp = l2.map(amazonEntryStamp);

    return mergeLists(l1AsStamp, l2AsStamp)
        .map(stamp => stamp.getInstance());
}
module.exports = mergeJson;
