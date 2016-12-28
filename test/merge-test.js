/* global describe, it */
"use strict";

const chai = require('chai');
const expect = chai.expect;
const mergeJson = require('../lib/jsonmerge.js');


// $4.61, $6.96, $7.99, $8.10, $8.27
const amzList = require('./rosseau-amz.json');

// $8.1, $9.55
const ebayList = require('./rosseau-ebay.json');

describe('Merge lists', function () {
    it('correct', function () {
        let result = mergeJson(amzList, ebayList);
        expect(result).to.have.length(amzList.length + ebayList.length);

        // amz results
        expect(result[0].sellerName).to.eql('BetterWorldBooksUK');
        expect(result[1].sellerName).to.eql('OhioUTextbooks');
        expect(result[2].sellerName).to.eql('dewbre');

        // ebay result
        expect(result[3].sellerName).to.eql('seller-201756091435');

        // amz result
        expect(result[4].sellerName).to.eql('Ammareal - Pro seller - ships within 24hrs');
    });

    it('empty lists', function () {
        let result = mergeJson(amzList, null);
        expect(result).to.eql(amzList);

        result = mergeJson(null, ebayList);
        expect(result).to.eql(ebayList);
    });
});
