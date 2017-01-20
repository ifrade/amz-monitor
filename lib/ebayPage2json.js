#!/usr/bin/env node
"use strict";

var sa = require('superagent');
const URL_TMPL="http://svcs.ebay.com/services/search/FindingService/v1?" +
      "OPERATION-NAME=findItemsByProduct" +
      "&SERVICE-VERSION=1.0.0" +
      "&SECURITY-APPNAME=IvanFrad-bookmoni-PRD-645f8a2bd-d12b026c" +
      "&RESPONSE-DATA-FORMAT=json" +
      "&REST-PAYLOAD" +
      "&productId=@@AMAZON_ID@@" +
      "&productId.@type=ISBN" +
      "&paginationInput.entriesPerPage=10" +
      "&itemFilter(0).name=Condition" +
      "&itemFilter(0).value(0)=1000" +
      "&itemFilter(0).value(1)=4000" +
      "&sortOrder=PricePlusShippingLowest";

const HTML_URL_TMPL = "http://www.ebay.com/sch" +
      "/Books/267/i.html" +
      "?_from=R40&_nkw=@@AMAZON_ID@@&_sop=15";

const SHIPPING_COST_URL_TMPL = "http://open.api.ebay.com/shopping?" +
      "callname=GetShippingCosts" +
      "&responseencoding=JSON" +
      "&appid=IvanFrad-bookmoni-PRD-645f8a2bd-d12b026c" +
      "&siteid=0" +
      "&version=517" +
      "&ItemID=@@ITEM_ID@@" +
      "&DestinationCountryCode=US" +
      "&DestinationPostalCode=94107" +
      "&IncludeDetails=false" +
      "&QuantitySold=1";


function getHumanUrl(amazonId) {
    return HTML_URL_TMPL.replace("@@AMAZON_ID@@", amazonId);
}

/* callback(err, htmlbody) */
function retrieve(amazonId, callback) {
    var URL = URL_TMPL.replace("@@AMAZON_ID@@", amazonId);
    sa.get(URL).end(function (err, res) {
        callback(err, res ? res.text: null);
    });
}

function normalizeCondition(conditionId) {
    const EBAY_CONDITION_IDS = {
        1000: "New", //"New",
        1500: "New", //"New other (see details)",
        1750: "New", //"New with defects",
        2000: "Used - Like New", //"Manufacturer refurbished",
        2500: "Used - Like New", //"Seller refurbished",
        3000: "Used", //"Used",
        4000: "Used - Very Good", //"Very Good",
        5000: "Used - Good", //"Good",
        6000: "Used - Acceptable", //"Acceptable",
        7000: "" //"For parts or not working"
    };

    return EBAY_CONDITION_IDS[conditionId] || "unknown";
}


function ssa(url) {
    // sa.then doesn't work well with chunked responses
    return new Promise(function (fullfill, reject) {
        sa.get(url)
            .end((error, res) => {
                error ? reject(error) : fullfill(JSON.parse(res.text));
            });
    });
}

/* entry = {
 offerPrice,
 shippingPrice,
 isPrime,
 condition,
 description,
 sellerName,
 sellerId }
*/
function parseEntries(body, callback) {

    let content = JSON.parse(body);
    let ebayItems = [];
    if (content.findItemsByProductResponse[0].ack[0] === 'Success' &&
        content.findItemsByProductResponse[0].searchResult[0]['@count'] !== '0') {
        ebayItems = content.findItemsByProductResponse[0].searchResult[0].item;
    }

    function getShippingCost(itemId, shippingInfo) {
        if (shippingInfo.shippingType[0] === "Calculated") {
            let url = SHIPPING_COST_URL_TMPL.replace("@@ITEM_ID@@", itemId);
            return ssa(url).then(body => {
                if (body.Ack === "Success") {
                    return "$" + body.ShippingCostSummary.ListedShippingServiceCost.Value;
                } else {
                    return "$0.0";
                }
            });
        } else {
            return Promise.resolve("$" + shippingInfo.shippingServiceCost[0].__value__);
        }
    }

    function parseSingleEntry(r) {
        let offerPrice = "$" + r.sellingStatus[0].convertedCurrentPrice[0].__value__;
        let condition = normalizeCondition(r.condition[0].conditionId);
        let sellerName = "seller-" + r.itemId;
        // Diff with use as hash: sellerName + condition + description[0,15]
        //  so that MUST be unique for an item...

        return getShippingCost(r.itemId, r.shippingInfo[0])
            .then(shippingPrice => ({
                      offerPrice,
                      shippingPrice,
                      isPrime: false,
                      condition,
                      description: 'Ebay book (no description available)',
                      sellerName,
                      sellerId: 'N/A'
            }));
    }

    return Promise.all(ebayItems.map(parseSingleEntry))
        .then(results => {
            callback(null, results);
        });
}
/*
const fs = require('fs');
var body = fs.readFileSync('game-engine.response');
parseEntries(body, function (err, entries) {
    console.log(JSON.stringify(entries));
});
*/

/* callback(err, [entry]); */
function getUsedCopies(asin, callback) {
    retrieve(asin, function (err, body) {
        parseEntries(body, callback);
    });
}

module.exports = {
    getUsedCopies: getUsedCopies,
    entriesFromPage: parseEntries,
    getHumanUrl: getHumanUrl
};

if (require.main === module) {
    if (process.argv.length !== 3) {
        console.error(process.argv[1], "[asin]");
        process.exit(-1);
    }

    getUsedCopies(process.argv[2], function (err, result) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        if (result.length === 0) {
            process.exit(2);
        }

        console.log(JSON.stringify(result));
    });
}
