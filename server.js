'use strict';

require('dotenv').config();

// Sets the port to what is specified in the .ENV file or defaults to 3000
const PORT = process.env.PORT || 3000;

// Library that has all of the GET and Set commands
const express = require('express');
const superagent = require('superagent');


const app = express();


app.get('/happyhour', searchGeocodeData);



// Middlewear - bridges between data and application
app.set('view-engine', 'ejs');




// Redirects the user to the index page
app.get('/', handleUserInput);

// Functions //

function searchGeocodeData(request, response) {
  const searchQuery = request.query.userInput;
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GOOGLE_API_KEY}`;
  superagent.get(URL).then(result => {
    if(result.body.status === 'ZERO_RESULTS') {
      response.status(500).send('Something went wrong, dummy');
      return;
    }
    const geocodeResult = result.body.results[0];
    response.render('happyHour.ejs', {geocodeResult:geocodeResult});
  })
}

function handleUserInput(request, response) {
  response.render('index.ejs');
}




// If connected, logs to the terminal which port it is on
app.listen(PORT, () => { console.log(`App is running on port ${PORT}`)})
