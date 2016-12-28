/* globals it: false, describe: false */
'use strict';

var expect = require('expect.js');
var amzEntry = require('../lib/amzEntryStamp.js').amazonEntryStamp;
var comp = require('../lib/amzEntryStamp.js').comp;

describe('Compare entries', function () {

    var book1 = amzEntry({
        "offerPrice":"$58.11",
        "shippingPrice":"$3.99",
        "isPrime":false,
        "condition":"Used - Like new",
        "description":"Unread copy in perfect condition. Unread copy in p",
        "sellerName":"---SuperBookDeals",
        "sellerId":"A3TJVJMBQL014A"});

    var book2 = amzEntry({
        "offerPrice":"$58.09",
        "shippingPrice":"$3.99",
        "isPrime":false,
        "condition":"Used - Like new",
        "description":"Unread copy in perfect condition. Unread copy in p",
        "sellerName":"---SuperBookDeals",
        "sellerId":"A3TJVJMBQL014A"});

    describe('Diff', function () {
        it('Price increased', function () {
            expect(book1.diff(book2)).to.eql(comp.MORE_EXPENSIVE);
        });

        it('Price decreased', function () {
            expect(book2.diff(book1)).to.eql(comp.CHEAPER);
        });

        it('Price hasnt changed', function () {
            expect(book1.diff(book1)).to.eql(comp.EXACTLY_EQUAL);
        });

        it('New entry', function () {
            expect(book1.diff(undefined)).to.eql(comp.NEW_ENTRY);
        });
    });

    it('Hash', function () {
        expect(book1.hash).to.eql("[---SuperBookDealsUsed - Like newUnread copy in ]");
    });

    it('instance', function() {
        // the stamp
        expect(book1).to.have.property('getFinalPrice');

        // the raw input instance
        expect(book1.getInstance()).to.have.property('sellerId');
        expect(book1.getInstance()).not.to.have.property('getFinalPrice');
    });
});
