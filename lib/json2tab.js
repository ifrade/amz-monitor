#!/usr/bin/node
var fs = require('fs');
var columnify = require('columnify');
var input = fs.readFileSync('/dev/stdin').toString();
var json = JSON.parse(input);

/* removes initial dollar and makes it a number */
function priceToNumber(str) {
    if (str.length === 0) {
        return 0;
    }
    
    var cleanPrice = str[0] === '$'? str.substring(1, str.length): str;
    var f = parseFloat(cleanPrice, 10);
    if (isNaN(f)) {
        console.error("Cannot parse as number:", str);
    }
    return f;
}

var col = columnify(json.map(function (row) {
    var itemPrice = priceToNumber(row.offerPrice);
    var shippingPrice = priceToNumber(row.shippingPrice);
    var finalPrice = (itemPrice + shippingPrice).toFixed(2);

    return {
        price: finalPrice,
        sellerName: row.sellerName,
        condition: row.condition,
        description: row.description.substring(0, 50)
    };
}), {
    truncate: true,
    config: {
        price: {
            minWidth: 8,
            maxWidth: 8
        },
        sellerName: {
            minWidth: 26,
            maxWidth: 26
        },
        condition: {
            minWidth: 18,
            maxWidth: 18
        }
    }
});

console.log(col);
