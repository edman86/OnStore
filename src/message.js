const fetch = require('node-fetch');
const clipboardy = require('clipboardy');

const templates = require("../db/templates.json");

const phoneNumberInput = document.querySelector("#phoneNumber");
const recipient = document.querySelector("#recipient");
const templateSelector = document.querySelector("#template");
const messageText = document.querySelector("#messageText");
const pasteNumberBtn = document.querySelector(".btn.paste");
const sendingMessageBtn = document.querySelector(".startBtn");


const notificationWindow = document.querySelector(".modal-indicator");

const modalClose = document.querySelector(".modal-close");


function returnCorrectNumber(number) {
    /*
    Checks the number for extra characters and removes them. 
    */
    let emptyNumber = "";
    const discardChars = ["-", "_", ".", " ", "--", ",", "(", ")", "()", "/", ":", "*", "%", "&", "$", "@", "#", "?"];
    
    for (let char of number) {
        if (discardChars.includes(char) || isNaN(char)) {
            continue;
        } else {
            emptyNumber += char;
        }
    }        
    
    correctNumber = "374" + emptyNumber.slice(-8); 

    return correctNumber;
}


function getAllTemplates() {

    for (let temp of templates) {
        const option = document.createElement("option");
        option.value = temp.value;
        option.textContent = temp.name;
        templateSelector.append(option);
    }
}

function getCurrentTemplate() {

    const currentValue = templateSelector.value;

    for (let temp of templates) {
        if (temp.value === currentValue) {
            const text = temp.body.replace("%name%", recipient.value);
            messageText.value = text;

        }
    }

}

function showNotification(text) {
    
    notificationWindow.style.display = "block";
    const notification = document.querySelector(".label.notification");
    notification.textContent = text;

}

function closeNotification() {
    
    modalClose.addEventListener("click", () => {
        notificationWindow.style.display = "none";
    });
}


function sendingMessage(number, message) {
    // Passing authorization on the site mobipace.com
    const url = "https://api.mobipace.com:444/v3/authorize";
    
    const body = {
        Username: process.env.USERNAME,
        Password: process.env.PASSWORD
    };

    fetch(url, {
        method: "post",
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => response.json())
        
        // Get the session id of the connection
        .then(resObj => resObj["SessionId"])
        
        // Sending message
        .then(sessionId => {
            const url = "https://api.mobipace.com:444/v3/Send";
            const data = {
                SessionId: sessionId,
                Sender: process.env.SENDER,
                Messages: [{
                    Recipient: number,
                    Body: message
                }]
            }

            fetch(url, {
                method: "post",
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            })
                .then(response => response.json())
                .then(res => {
                    if (res["Status"] === "Success") {
                        console.log("Success");
                        console.log("StatusCode: " + res["StatusCode"]);
                        console.log("MessageCount: " + res["MessageCount"]);
                        console.log("PartCount: " + res["PartCount"]);
                        console.log("AveragePrice: " + res["AveragePrice"]);
                        console.log("TotalPrice: " + res["TotalPrice"]);
                        showNotification("Сообщение отправлено!");
                    }
                })
                .catch(error => {
                    console.log(error.message);
                    showNotification("Ошибка!\n" + error.message);
                });

        })
        .catch(error => {
            showNotification("Ошибка!\n" + error.message);
        }); 
}
    
/*
***************************** Main ***************************
*/    

getAllTemplates();

getCurrentTemplate(); 

templateSelector.addEventListener("click", () => {
    getCurrentTemplate();
});

pasteNumberBtn.addEventListener("click", () => {
    // Get the phone number from clipboard.
    const number = clipboardy.readSync();
    
    // Editing number
    const phoneNumber = returnCorrectNumber(number);
    phoneNumberInput.value = phoneNumber;

});

sendingMessageBtn.addEventListener("click", () => {
    
    const phoneNumber = phoneNumberInput.value;
    const textMessage = messageText.value;
    
    if (phoneNumber === "") {
        showNotification("Введите номер телефона!");
        
    } else if (phoneNumber.length !== 11) {
        showNotification("Номер телефона должен быть не менее и не более 11 символов!");
        
    } else if (textMessage === "") {
        showNotification("Введите текст сообщения!");
        
    } else {
        sendingMessage(phoneNumber, textMessage);
    }
    
    closeNotification();
    
});