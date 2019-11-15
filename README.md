# moneymour-api-client
The library offers easy access to Moneymour APIs

## Installation

A package is available on npmjs

```bash
$ npm i moneymour-api-client -s
```

## Usage

```javascript

const ApiClient = require('moneymour-api-client')

// Get the following information from https://merchant.sandbox.moneymour.com
// For production: https://merchant.moneymour.com
const PRIVATE_KEY = '<YOUR_PRIVATE_KEY>'
const MERCHANT_ID = '<YOUR_MERCHANT_ID>'
const MERCHANT_SECRET = '<YOUR_MERCHANT_SECRET>'

// Build the client
const client = new ApiClient(MERCHANT_ID, MERCHANT_SECRET, environments.ENVIRONMENT_SANDBOX)

// Request payload
const payload = {
    'orderId': '123456',  // the order id in your system
    'amount': '1080',  // must be >= 300 and <= 2000
    'email': 'customer@merchant.com',
    'phoneNumber': '+393334444555',  // must include +39
    'products': [  // the list of products in the cart
      {
        'name': 'iPhone 7',
        'type': 'Electronics',
        'price': '500',
        'quantity': 2,
        'discount': 0
      },
      {
        'name': 'MacBook Pro Charger',
        'type': 'Electronics',
        'price': '80',
        'quantity': 1,
        'discount': 0
      }
    ]
}

;(async () => {
  // Perform the request
  const response = await client.request(PRIVATE_KEY, payload)
  
  // Output response
  console.log(response)  
})()

/*
{
    "status": "accepted",
    "amount": 1080,
    "phoneNumber": "+393334444555",
    "orderId": "123456",
    "products": [
        {
            "name": "iPhone 7",
            "type": "Electronics",
            "price": "500",
            "price": "2",
            "discount": 0
        },
        {
            "name": "MacBook Pro Charger",
            "type": "Electronics",
            "price": "80",
            "price": "1",
            "discount": 0
        }
    ]
}
*/
```

## Gotchas

Moneymour APIs allow only one pending request at a time. If you get a **403 error** having message **Duplicated request** please cancel the current pending request using the Moneymour app for iOS or Android.

## Verify signature in your webhook

```javascript

const ApiClient = require('moneymour-api-client')

ApiClient.SignatureFactory.verify(
    signature,  // http request header "Signature"
    expiresAt,  // http request header "Expires-at"
    body,  // http request body
    environment // One of the supported environments. Default: sandbox
) // return true or false
```
