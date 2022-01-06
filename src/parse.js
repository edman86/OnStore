const startBtn = document.querySelector(".startBtn");

startBtn.addEventListener("click", parsing);
    
function parsing() {
    
    const axios = require("axios");
    const cheerio = require("cheerio");
    const fs = require("fs");
    
    const category = document.querySelector("#category").value;
    const pageAmount = +document.querySelector("#pageAmount").value || 1; // Если в поле ввода ничего не введено (""), вернет 1
    const productAmount = +document.querySelector("#productAmount").value || 0; // Если в поле ввода ничего не введено (""), вернет 0
    
    const indicatorWindow = document.querySelector(".modal-indicator");
    indicatorWindow.classList.toggle("appearance");
    
    const pageIndicator = document.querySelector("#pageIndicator"); 
    const elementIndicator = document.querySelector("#elementIndicator");
    const notification = document.querySelector(".label.notification");


    async function parse() {

        const arr = [];
        let executed = 1;

        for (let page = 1; page <= pageAmount; page++) {

            pageIndicator.textContent = `Страница ${page}/${pageAmount}`;
            console.log(`Page ${page}/${pageAmount}`);
            
            let url;
            if (category === "shop") {
                url = `https://www.onshop.am/shop?page=${page}`;    
            } else {
                url = `https://www.onshop.am/shop?category=${category}&page=${page}`;
            }
            
            const $ = await getPage(url);

            await getProductsData($, arr, executed, page);
        }
    }


    async function getPage(url) {

        return axios.get(url)
            .then((response) => cheerio.load(response.data))
            .catch((error) => console.log("The page is not exist!"));

    }


    async function getProductsData($, arr, executedElements, pageNumber) {

        const products = $('.product-item');

        const promise = new Promise((resolve, reject) => {

            let i = 1;

            products.each(async (index, element) => {

                const productData = {};

                const itemTitle = $(element).find("h2");
                const link = $(itemTitle).find("a");
                const linkText = $(link).attr("href");

                const $product = await getPage(linkText);

                const product = $product(".product-inner");
                const productName = $product(product).find(".product-name").text();
                const productInfo = $product(product).find(".product-inner-price");
                const productId = productInfo.text().trim().slice(0, 10);
                const currentProductAmount = parseIntFromString(productInfo.text().trim().slice(-12).trim());

                if (currentProductAmount === productAmount) {

                    productData.name = productName;
                    productData.id = productId;
                    productData.amount = currentProductAmount;
                    productData.link = process.env.PRODUCTDATA_LINK + linkText.split("product/")[1];
                    productData.pageNumber = pageNumber;

                    arr.push(productData);
                }

                console.log(`Executed ${executedElements} elements`);
                elementIndicator.textContent = `Обработано ${executedElements} элементов`;
                
                executedElements++;
                
                if (i === products.length) {
                    resolve(arr);
                }

                i++;
            });

        });

        //await promise.then(() => createJSONFile(JSON.stringify(arr)))
        await promise.then(() => localStorage.results = JSON.stringify(arr))
    
    }


    function parseIntFromString(string) {

        let int = "";
        for (let char of string) {
            if (!isNaN(Number(char)) && char !== " ") {
                int += char;
            }
        }

        return +int;
    }


    function createJSONFile(data) {

        fs.open("db/productData.json", "w", (err) => {
            if (err) throw err;
        })


        fs.writeFile("db/productData.json", data, (err) => {
            if (err) throw err;
        });

    }


    let timerId = setInterval(() => {
        if (notification.textContent.length < 4) {
            notification.textContent += ".";
        } else {
            notification.textContent = ".";
        } 
    }, 1000);


    parse()
        .then(() => {
            notification.textContent = "Готово!";
            clearInterval(timerId);
            console.log("Done!");
        })
        .then(() => setTimeout(() => {
            createResultWindow();
            notification.textContent = ".";
            indicatorWindow.classList.toggle("appearance");
        }, 1000));

}


function createResultWindow() {
    
    const { BrowserWindow } = require('electron').remote
    const path = require('path')

    const modalPath = path.join("file://", __dirname, "result.html");
    let resultWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    resultWindow.on("close", function() { win: null });
    resultWindow.loadURL(modalPath);
    resultWindow.show();
}