'use strict';

require('dotenv').config();

// Sets the port to what is specified in the .ENV file or defaults to 3000
const PORT = process.env.PORT || 3000;

// Library that has all of the GET and Set commands
const express = require('express');


const app = express();







// ======================================================
// ----------------Constructor Function------------------
// ======================================================

// The right side of the constructor will need to be changed in order to fit the API result
function Geocode (seachQuery){
  this.adress = seachQuery.adress;
  this.originLat = seachQuery.originLat;
  this.originalLong = seachQuery.originalLong;
}

function Places (seachQuery){
  this.destination = seachQuery.destination;
  this.destLat = seachQuery.destLat;
  this.destLong = seachQuery.destLong;
  this.name = seachQuery.name;
  this.prices = seachQuery.prices;
  this.rating = seachQuery.rating;
  this.openNow = seachQuery.openNow;
}

function DarkSky (seachQuery){
  this.currentIcon = seachQuery.currentIcon;
  this.currentTemp = seachQuery.currentTemp;
}

function Sunset (seachQuery){
  this.sunsetTime = seachQuery.sunsetTime;
}

function Zomato (seachQuery) {
  this.menu = seachQuery.menu;
}

function Uber (seachQuery){
  this.priceEstimates = seachQuery.priceEstimates;
}

function Routes (seachQuery){
  this.distance = seachQuery.distance;
  this.durration = seachQuery.durration;
}









// Middlewear - bridges between data and application
app.set('view-engine', 'ejs');




// Redirects the user to the index page
app.get('/', (request, response) => {
  response.render('index.ejs');
});




// If connected, logs to the terminal which port it is on
app.listen(PORT, () => { console.log(`App is running on port ${PORT}`)})
