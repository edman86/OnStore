# OnStore

## Desctop application for managing e-commerce website.
___
### The application was written specifically for the e-commerce website
### [onshop.am](https://www.onshop.am).

![mygif](./onstore2.gif)
___
## The application currently includes 2 main opportunities:

- ### The ability to find a product on the web site by its quantity.

You can select a product category, the number of pagination pages to search for, and the desired amount of product. 

Under the hood, the application uses a library to parse and scrap the data from the web site and find the data it needs. 

The search result is placed in the generated table with the product id, name, quantity, pagination page number and URL link fields. 

The user can easily open the product on the web site from the application using the link to it.

![mygif](./onstore3.gif)

- ### The ability to send an SMS message to the desired number.
Under the hood, the app is integrated with [www.mobipace.com](https://www.mobipace.com) and uses its API to send messages.

![mygif](./onstore1.gif)
___
### This desctop app developed with `Electron js` framework and `Node js`.

### For parsing and scraping data is using `axios` and `cheerio` libraries.