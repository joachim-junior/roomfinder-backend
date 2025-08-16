// server.js
//
// Use this sample code to handle webhook events in your integration of the FAPSHI payment API.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install express
//
// 3) Run the server on http://localhost:3000
//   node server.js
//webhook data strcuture

[
  {
    "transId": "<string>",
    "status": "CREATED",
    "medium": "mobile money",
    "serviceName": "<string>",
    "amount": 123,
    "revenue": 123,
    "payerName": "<string>",
    "email": "jsmith@example.com",
    "redirectUrl": "<string>",
    "externalId": "<string>",
    "userId": "<string>",
    "webhook": "<string>",
    "financialTransId": "<string>",
    "dateInitiated": "2023-12-25",
    "dateConfirmed": "2023-12-25"
  }
]



const express = require('express');
const fapshi = require('./fapshi');
const app = express();
const port = process.env.PORT || 3000;

app.post('/fapshi-webhook', express.json(), async (req, res) => {
  // Get the transaction status from fapshi's API to be sure of its source
  const event = await fapshi.paymentStatus(req.body.transId);

  if(event.statusCode !== 200)
    return res.status(400).send({message: event.message});

  // Handle the event
  switch (event.status) {
    case 'SUCCESSFUL':
      // Then define and call a function to handle a SUCCESSFUL payment
      console.log(event, 'successful');
      break;
    case 'FAILED':
      // Then define and call a function to handle a FAILED payment
      console.log(event, 'failed');
      break;
    case 'EXPIRED':
      // Then define and call a function to handle an expired transaction
      console.log(event, 'expired');
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event status: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
