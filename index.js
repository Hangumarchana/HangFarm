const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require("url");

function replaceHTML(html, data) {
    let output = html.replace(/{%TITLE%}/g, data.productName);
    output = output.replace(/{%IMAGE%}/g, data.image);
    output = output.replace(/{%PRICE%}/g, data.price);
    output = output.replace(/{%QUANTITY%}/g, data.quantity);
    output = output.replace(/{%ID%}/g, data.id);
    output = output.replace(/{%COUNTRY%}/g, data.from);
    output = output.replace(/{%NUTRIENTS%}/g, data.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, data.description);

    if (data.organic) {
        output = output.replace(/{%STATUS%}/g, 'organic');
    } else {
        output = output.replace(/{%STATUS%}/g, '');
    }

    return output;
}

const overview = fs.readFileSync(path.join(__dirname, 'overview.html'), "utf-8");
const productTemplate = fs.readFileSync(path.join(__dirname, 'product.html'), "utf-8");
const cards = fs.readFileSync(path.join(__dirname, "product-cards.html"), "utf-8");
const data = fs.readFileSync(path.join(__dirname, "data.json"), "utf-8");
const objectData = JSON.parse(data);

const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);

    if (pathname === "/" || pathname === "/overview") {
        res.writeHead(200, { "Content-Type": "text/html" });
        const htmlCards = objectData.map(item => replaceHTML(cards, item)).join('');
        const output = overview.replace('{%PRODUCTCARDS%}', htmlCards);
        res.end(output);
    }

    else if (pathname === "/product") {
        const productData = objectData[query.id];
        if (!productData) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Product not found</h1>");
            return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        const output = replaceHTML(productTemplate, productData);
        res.end(output);
    }

    else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>Page not found</h1>");
    }
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Server is Listening on http://127.0.0.1:8000");
});
