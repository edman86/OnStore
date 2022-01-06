const { shell } = require("electron");
//const products = require("../db/productData.json");

// Загружаем данные из localStorage 
const products = JSON.parse(localStorage.results);

// Создаем таблицу с результирующими данными
const resultTable = document.querySelector(".result__table");
for (let productData of products) {
    let tr = document.createElement("tr");
    let html = `<td>${productData.id}</td><td>${productData.name}</td><td>${productData.amount}</td><td><a href=${productData.link}>link</a></td><td>${productData.pageNumber}</td>`
    tr.insertAdjacentHTML("beforeend", html);
    resultTable.append(tr);
}

const links = document.querySelectorAll("a[href]");
Array.prototype.forEach.call(links, (link) => {
    const url = link.getAttribute("href");
    if (url.indexOf("http") === 0) {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            shell.openExternal(url);
        });
    }
});