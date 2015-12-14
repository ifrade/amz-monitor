#!/usr/bin/node
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var sa = require('superagent');
var cheerio = require('cheerio');

var URL_TMPL = "http://www.amazon.com/gp/offer-listing/@@AMAZON_ID@@" +
    "/ref=olp_f_usedVeryGood?ie=UTF8&f_usedLikeNew=true&f_usedVeryGood=true";

/* callback(err, htmlbody) */
function retrieve(amazonId, callback) {
    var URL = URL_TMPL.replace("@@AMAZON_ID@@", amazonId);
    sa.get(URL).end(function (err, res) {
        callback(err, res ? res.text: null);
    });
}

function compactStr(input) {
    return input.trim()
        .split('\n')
        .map(function (s) { return s.trim();} )
        .filter(function (s) { return s.length > 0;})
        .filter(function (s) { return s !== 'Show less';}) // Not really needed
        .filter(function (s) { return s !== '«';})
        .join(' ');
}


/* callback(err, [entry]) */
function parseEntries(body, callback) {
    var entries = [];
    var $ = cheerio.load(body);
    $('div.olpOffer').each(function (i, element) {
        var row = $(element);

        var entry = {};
        
        //Price column
        var priceColumn = row.children().first();
        entry.offerPrice = priceColumn.children('span.olpOfferPrice')
            .first().text().trim();
        entry.shippingPrice = priceColumn.find('span.olpShippingPrice')
            .first().text().trim();

        entry.isPrime = priceColumn.find('span.supersaver').length === 1;

        //Condition column
        var conditionColumn = priceColumn.next();
        entry.condition = compactStr(conditionColumn.find('span.olpCondition').text());

        // Removing the child span to clean the "show less"
        entry.description = compactStr(conditionColumn.find('div.expandedNote')
                                       .clone().children().remove().end().text());
        if (entry.description.length === 0) {
            entry.description = compactStr(conditionColumn.find('div.comments').text());
        }

        //Seller column
        var sellerColumn = row.children('div.olpSellerColumn');
        entry.sellerName = compactStr(sellerColumn.children('h3.olpSellerName').text());
        var sellerUrl = sellerColumn.find('h3.olpSellerName span a').attr('href');
        entry.sellerId = qs.parse(url.parse(sellerUrl).query).seller;

        entries.push(entry);
    });
    callback(null, entries);
}
/*
var asin = "1566913101";

retrieve(asin, function (err, body) {
    fs.writeFileSync(asin + '_body.html', body);
    //var body = fs.readFileSync('0140442936_body.html');
    parseEntries(body, function (err, entries) {
        console.log("Done", entries.length);
    });
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
    entriesFromPage: parseEntries
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

        console.log(JSON.stringify(result));
    });
}
