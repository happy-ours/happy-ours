'use strict';

require('dotenv').config();

// Sets the port to what is specified in the .ENV file or defaults to 3000
const PORT = process.env.PORT || 3000;

// Library that has all of the GET and Set commands
const express = require('express');
const superagent = require('superagent');




const app = express();

app.use(express.static('./public'));

app.get('/happyhour', searchGeocodeData);



const allResultsObject = {};

// ======================================================
// ----------------Constructor Function------------------
// ======================================================

// The right side of the constructor will need to be changed in order to fit the API result
function Geocode (resultObject, searchQuery){
  this.userInput = searchQuery;
  this.address = resultObject.formatted_address;
  this.originLat = resultObject.geometry.location.lat;
  this.originLng = resultObject.geometry.location.lng;
}

function Places (seachQuery){
  this.destLat = seachQuery.geometry.location.lat;
  this.destLng = seachQuery.geometry.location.lng;
  this.name = seachQuery.name;
  this.prices = seachQuery.price_level;
  this.rating = seachQuery.rating;
  this.openNow = seachQuery.opening_hours.open_now;
}

function DarkSky (seachQuery){
  this.currentIcon = seachQuery.currently.icon;
  this.currentTemp = seachQuery.currently.temperature;
}

function Sunset (seachQuery){
  this.sunsetTime = seachQuery.body.results.solar_noon;
}

function Zomato (seachQuery) {
  this.menu = seachQuery.menu;
}

function Uber (seachQuery){
  this.priceEstimates = seachQuery.priceEstimates;
}

function Routes (seachQuery){
  this.distance = seachQuery.distance.text;
  this.duration = seachQuery.duration.text;
}









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
    const searchedResults = result.body.results[0];
    const geocodeResult = new Geocode(searchedResults, searchQuery)
    Object.assign(allResultsObject, geocodeResult);
    getMap(request, response);
  })
}

function getMap(request, response) {
  const URL = `https://maps.googleapis.com/maps/api/staticmap?center=${allResultsObject.originLat},${allResultsObject.originLng}&zoom=13&size=600x300&maptype=roadmap
  &key=${process.env.GOOGLE_API_KEY}`;
  allResultsObject.map = URL;
  searchPlacesData(request, response);
}

function searchPlacesData(request, response) {
  const resultArray = [];
  const URL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=happy hour patio&location=${allResultsObject.originLat},${allResultsObject.originLng}&radius=1600&key=${process.env.GOOGLE_API_KEY}`;
  superagent.get(URL).then(result => {
    const searchedResults = result.body.results;
    for(let i = 0; i < 5; i++) {
      const newRestaurant = new Places(searchedResults[i]);
      resultArray.push(newRestaurant);
    }
    allResultsObject.hh = resultArray;
    searchWeatherData(request, response);
  })
}

function searchWeatherData(request, response) {
  const URL = `https://api.darksky.net/forecast/776a7b4b172c83e5eaf765414951b01e/${allResultsObject.originLat},${allResultsObject.originLng}`;
  superagent.get(URL).then(result => {
    const currentWeather = new DarkSky(result.body);
    Object.assign(allResultsObject, currentWeather);
    whenIsTheSunset(request, response);
  })
}

function whenIsTheSunset(request, response) {
  const time = new Date(Date.now()).toISOString().slice(0, 10);
  const URL = `https://api.sunrise-sunset.org/json?lat=${allResultsObject.originLat}&lng=${allResultsObject.originLng}&date=${time}`;
  superagent.get(URL).then(result => {
    const sunsetData = new Sunset(result);
    allResultsObject.sunset = sunsetData.sunsetTime;
    response.render('happyHour.ejs', {allResultsObject:allResultsObject});
    // searchRouteData(request, response);
  })
}

// TODO:function searchRouteData(request, response) {
//   const resultsArray = [];
//   const regex = /(?![\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})./gi;
//   for(let i = 0; i < allResultsObject.hh.length; i++){
//     const destination = allResultsObject.hh[i].name.replace(regex, '');
//     const URL = `https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${destination}&key=${process.env.GOOGLE_API_KEY}`;
//     superagent.get(URL).then(result => {
//       const searchedRoute = result.body.routes[0].legs[0];
//       resultsArray.push(new Routes(searchedRoute));
//       allResultsObject.routes = resultsArray;
//     })
//     response.render('happyHour.ejs', {allResultsObject:allResultsObject});
//   }
// }

// TODO:function searchMenuData(request, response) {
//   const URL = `https://developers.zomato.com/api/v2.1/search?q=${allResultsObject.name}
//   `;
//   superagent.get(URL).then(result => {
//     const 
//   })
// }

function handleUserInput(request, response) {
  response.render('index.ejs');
}

app.get('/about_us', (request, response) => {
  response.render('about_us.ejs');

})


// If connected, logs to the terminal which port it is on
app.listen(PORT, () => { console.log(`App is running on port ${PORT}`)})
