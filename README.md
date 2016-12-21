# amz-monitor
git-like tool to follow price of books in amazon.

Add a book to the amazon monitor, fetch the price periodically and see how it has changed.

All the information is stored locally and only updated when running fetch. No daemons, no cloud, no fancy.

## Requirements
- [Node.js](https://nodejs.org/en/) is used for the http call and page scrapping 
- [jq](https://stedolan.github.io/jq/) to manipulate JSON in the scripts

## Usage

### Initilize the monitor (only once)
- `./amz init` will create the required hidden folders to store the information

### Add/list/remove books to monitor
- `./amz add [asin] "title"`: See below on how to find out the "asin" of your book. The title doesn't need to match the amazon name (can be an alias or shortcut). e.g `./amz add 1451673310 "Fahrenheit 451 (recommended by Alan)"`.

- `./amz ls`: list all books being monitored

- `./amz rm [asin]`: to stop monitoring that book

### Get latest prices
- `./amz fetch`

By default it fetches latest prices for all books in the monitor. Adding an "asin" will fetch only for that title. It will pring the diff and best know price, so usually this is all you need for a regular check.

### Other commands
- `./amz diff`: To see the difference between latest and previous fetched data
- `./amz history`: To see the best price of each fetch for that title
- `./amz best`: Latest best fetched price

### Getting autocomplete for commands and asins
Run `source ./autocomplete` and pressing `TAB` after ./amz will offer command and asin autocompletion.

## Finding the "asin" of a book
The book is identified by its "asin", a unique number in amazon. To find it out, go to the book page, click in the "used" link to see the list of prices and check the url. The URL should look like:

`https://www.amazon.com/gp/offer-listing/**ASIN**/other-stuff`

For example, in
`https://www.amazon.com/gp/offer-listing/1451673310/ref=tmm_pap_new_olp_0?ie=UTF8&condition=new&qid=&sr=`
the asin is 1451673310

## The git-likeness
git (or my misunderstanding of it) has been an inspiration to structure this tool:
- fetched prices for a title at certain time are like a "commit"
- a "commit" is identified by a hash of its contents
- there is a HEAD reference pointing to the latest "commit"
- a new "commit" for a title has as parent the previous "commit" for the title
- everything is stored using just plain files (using `.amz` and the `.git` directory)
- the commands are implemented as individual scripts

