const startBtn = document.querySelector(".startBtn");

startBtn.addEventListener("click", parsing);
    
function parsing() {
    
    const axios = require("axios");
    const cheerio = require("cheerio");
    const fs = require("fs");
    
    // Достаем значения из полей ввода
    const category = document.querySelector("#category").value;
    const pageAmount = +document.querySelector("#pageAmount").value || 1; // Если в поле ввода ничего не введено (""), вернет 1
    
    // Величина продукта может быть либо ноль, либо больше ноля
    const productAmount = document.querySelector("#productAmount").value;

    // Активация окна индикатора загрузки 
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
            
            // Формируем URL
            let url;
            if (category === "shop") {
                url = `https://china.onshop.am/shop?page=${page}`;    
            } else {
                url = `https://china.onshop.am/shop?category=${category}&page=${page}`;
            }
            
            // Делает запрос по адресу через axios и возвращает объект cheerio 
            const $ = await getPage(url);

            // Запускается парсинг при помощи cheerio
            await getProductsData($, arr, executed, page);
        }
    }


    async function getPage(url) {

        return axios.get(url)
            .then((response) => cheerio.load(response.data))
            .catch((error) => console.log("The page is not exist!"));

    }


    async function getProductsData($, arr, executedElements, pageNumber) {

        // Получаем все товары
        const products = $('.product-item-container');

        const promise = new Promise((resolve, reject) => {

            let i = 1;

            products.each(async (index, element) => {

                const productData = {};

                const itemTitle = $(element).find("h4");
                const link = $(itemTitle).find("a");
                const linkText = $(link).attr("href");

                const $product = await getPage(linkText);

                const product = $product(".content-product-right");
                
                const productName = $product(product).find(".title-product h1").text();
                const productPrice = $product(product).find(".price-new").text();
                
                const productId = $product(product).find("div:not(.hidden).stock > b").text();
    
                const currentProductAmount = $product(product).find(".status-stock").text();
                
                // На сайте china.onshop нет тега с количеством товара, но если товар
                // закончился, появляется тег с надписью "Վերջացել է" 
                const productAlert = $product(product).find(".alert.alert-danger b").text();

                console.log("productId " + productId);
                console.log("productAmount " + productAmount);

                // Если количество товара совпадает с изначально заданным количеством (ноль по умолчанию) 
                if (+productAmount === 0 && +currentProductAmount === 0 && productAlert === "Վերջացել է") {

                    // Создаем результирующий объект с данными товара
                    productData.name = productName;
                    productData.id = productId;
                    productData.amount = currentProductAmount;
                    productData.link = "https://china.onshop.am/admins/product/update?id=" + linkText.split("product/")[1];
                    productData.pageNumber = pageNumber;

                    // Добавляем в результирующий массив
                    arr.push(productData);
                
                // Если количество товара превышает ноль
                } else if (+productAmount === 1 && +currentProductAmount > 0 && productAlert === "") {

                    // Создаем результирующий объект с данными товара
                    productData.name = productName;
                    productData.id = productId;
                    productData.amount = currentProductAmount;
                    productData.link = "https://china.onshop.am/admins/product/update?id=" + linkText.split("product/")[1];
                    productData.pageNumber = pageNumber;

                    // Добавляем в результирующий массив
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

        // Пишем результат в localStorage в виде JSON объекта result 
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

    // Функционал модального окна, чтобы показать процесс выполнения
    let timerId = setInterval(() => {
        if (notification.textContent.length < 4) {
            notification.textContent += ".";
        } else {
            notification.textContent = ".";
        } 
    }, 1000);


    // Запуск главной функции в обработчике
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
        width: 1200,
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