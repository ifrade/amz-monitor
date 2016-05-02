'use strict';
var stampit = require('stampit');

const NO_COMPARABLE = "NO_COMPARABLE";
const NEW_ENTRY = "NEW_ENTRY";
const EXACTLY_EQUAL = "EQUAL";
const CHEAPER = "CHEAPER";
const MORE_EXPENSIVE = "MORE_EXPENSIVE";

/* removes initial dollar and makes it a number */
function priceToNumber(str) {
    if (!str || str.length === 0) {
        return 0;
    }

    var cleanPrice = str[0] === '$'? str.substring(1, str.length): str;
    var f = parseFloat(cleanPrice, 10);
    if (isNaN(f)) {
        console.error("Cannot parse as number:", str);
    }
    return f;
}


/**
 * Not sure this is the right use of stampit...
 */
const amazonEntryStamp = stampit()
      .refs({
          hash: "",
          finalPrime: 0
      })
      .init(function (ctx) {
          const itemPrice = priceToNumber(ctx.instance.offerPrice);
          const shippingPrice = priceToNumber(ctx.instance.shippingPrice);
          this.finalPrice = itemPrice + shippingPrice;
          this.hash = "[" + ctx.instance.sellerName +
              ctx.instance.condition +
              ctx.instance.description.substring(0, 15) + "]";

          this.getHash = () => {
              return this.hash;
          };

          this.getFinalPrice = () => {
              return this.finalPrice;
          };

          // other is the previous entry
          this.diff = (other) => {
              if (!other) {
                  return NEW_ENTRY;
              }

              if (other.getHash() !== this.hash) {
                  return NO_COMPARABLE;
              }

              if (this.finalPrice === other.finalPrice) {
                  return EXACTLY_EQUAL;
              }

              return this.finalPrice < other.getFinalPrice() ? CHEAPER : MORE_EXPENSIVE;
          };

          return this;
      });

module.exports = {
    amazonEntryStamp: amazonEntryStamp,
    comp: {
        NO_COMPARABLE : NO_COMPARABLE,
        NEW_ENTRY : NEW_ENTRY,
        EXACTLY_EQUAL: EXACTLY_EQUAL,
        CHEAPER : CHEAPER,
        MORE_EXPENSIVE : MORE_EXPENSIVE
    }
};
