'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// ======================================================
// ----------------POSTGRES CLIENT-----------------------
// ======================================================
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.set('view-engine', 'ejs');
app.use(methodOverride((request, response) => {
  if(request.body && request.body._method){
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

app.get('/', handleUserInput);
app.get('/happy_hour', searchGeocodeData);
app.get('/about_us', (request, response) => response.render('about_us.ejs'));
app.put('/pet_friendly', addPetInformationToDB);


// ======================================================
// ----------------GLOBAL VARIABLES---------------------
// ======================================================
const allResultsObject = {};

// ======================================================
// ----------------CONSTRUCTOR FUNCTIONS-----------------
// ======================================================

function Geocode(resultObject, searchQuery){
  this.userInput = searchQuery;
  this.address = resultObject.formatted_address;
  this.originLat = resultObject.geometry.location.lat;
  this.originLng = resultObject.geometry.location.lng;
}

function DarkSky(resultObj){
  this.currentIcon = resultObj.currently.icon;
  this.currentTemp = resultObj.currently.temperature;
}

function Places(resultObj){
  this.destLat = resultObj.geometry.location.lat;
  this.destLng = resultObj.geometry.location.lng;
  this.name = resultObj.name;
  this.prices = resultObj.price_level;
  this.rating = resultObj.rating;
  if(resultObj.opening_hours.open_now){
    this.openNow = 'Currently Open';
  }else{
    this.openNow = 'Currently Closed';
  }
  this.petfriendly;
}

function Sunset(resultObj){
  this.sunsetTime = resultObj.body.results.solar_noon;
}

function Routes(resultObj){
  this.distance = resultObj.distance.text;
  this.duration = resultObj.duration.text;
}

function Uber(resultObj){
  this.priceEstimates = resultObj.prices[4].estimate;
}


// ======================================================
// ----------------OTHER FUNCTIONS----------------------
// ======================================================

//Renders home page
function handleUserInput(request, response) {
  response.render('index.ejs');
}

// ----------------GOOGLE GEOCODE-------------------------
//Finds location results
//Saves user input, latitude, longitude, and address of search
function searchGeocodeData(request, response) {
  const searchQuery = request.query.userInput;
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GOOGLE_API_KEY}`;
  superagent.get(URL).then(result => {
    if(result.body.status === 'ZERO_RESULTS') {
      response.status(500).send('Something went wrong, try a different search');
      return;
    }
    const searchedResults = result.body.results[0];
    const geocodeResult = new Geocode(searchedResults, searchQuery)
    Object.assign(allResultsObject, geocodeResult);
    getMap(request, response);
  })
}

// ----------------GOOGLE MAP------------------------------
//Finds a map of the searched location
//Saves the map as an image
function getMap(request, response) {
  const URL = `https://maps.googleapis.com/maps/api/staticmap?center=${allResultsObject.originLat},${allResultsObject.originLng}&zoom=13&size=600x300&maptype=roadmap
  &key=${process.env.GOOGLE_API_KEY}`;
  allResultsObject.map = URL;
  searchWeatherData(request, response);
}

// --------------------DARK SKY------------------------------
//Finds weather information
//Saves current temperature and description
function searchWeatherData(request, response) {
  const URL = `https://api.darksky.net/forecast/776a7b4b172c83e5eaf765414951b01e/${allResultsObject.originLat},${allResultsObject.originLng}`;
  superagent.get(URL).then(result => {
    const currentWeather = new DarkSky(result.body);
    Object.assign(allResultsObject, currentWeather);
    //If current temperature if above 70degrees or the descrition is clear-day
    //find happy hours with patios
    //otherwise, just find nearby happyhours
    if(currentWeather.currentTemp > 70 || currentWeather.currentIcon.toLowerCase() === 'clear-day'){
      searchPlacesData(request, response, 'happy hour patio');
    }else{
      searchPlacesData(request, response, 'happy hour');
    }
  })
}

// ----------------GOOGLE PLACES------------------------------
//Finds near by places with happy hour or happy hour with patio depending on weather
//saves 5 places - each with the name of the restaurant, latitude, longitude, prices, rating, and if they are open
function searchPlacesData(request, response, searchTerm) {
  const resultArray = [];
  const URL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchTerm}&location=${allResultsObject.originLat},${allResultsObject.originLng}&radius=1600&key=${process.env.GOOGLE_API_KEY}`;
  superagent.get(URL).then(result => {
    const searchedResults = result.body.results;
    for(let i = 0; i < 5; i++) {
      const newRestaurant = new Places(searchedResults[i]);
      resultArray.push(newRestaurant);
    }
    allResultsObject.hh = resultArray;
    whenIsTheSunset(request, response);
  })
}

// ----------------SUNSET-------------------------------------
//Finds what time the sun will set
function whenIsTheSunset(request, response) {
  const time = new Date(Date.now()).toISOString().slice(0, 10);
  const URL = `https://api.sunrise-sunset.org/json?lat=${allResultsObject.originLat}&lng=${allResultsObject.originLng}&date=${time}`;
  superagent.get(URL).then(result => {
    const sunsetData = new Sunset(result);
    allResultsObject.sunset = sunsetData.sunsetTime;
    searchRouteData(request, response);
  })
}

// ----------------GOOGLE ROUTES------------------------------
//Finds best route to the restaurant
//Saves distance to and how long it will take to get there
function searchRouteData (request, response){
  //removes special characters from restaurant names because the API does not recognize non UTF-8 characters
  const checkSpecialChars = /(?![\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})./gi;
  const dest0 = allResultsObject.hh[0].name.replace(checkSpecialChars, '');
  const dest1 = allResultsObject.hh[1].name.replace(checkSpecialChars, '');
  const dest2 = allResultsObject.hh[2].name.replace(checkSpecialChars, '');
  const dest3 = allResultsObject.hh[3].name.replace(checkSpecialChars, '');
  const dest4 = allResultsObject.hh[4].name.replace(checkSpecialChars, '');

  let routeOne = superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest0}&key=${process.env.GOOGLE_API_KEY}`).then(result =>{
    return new Routes(result.body.routes[0].legs[0]);
  })

  let routeTwo = superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest1}&key=${process.env.GOOGLE_API_KEY}`).then(result =>{
    return new Routes(result.body.routes[0].legs[0]);
  })

  let routeThree = superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest2}&key=${process.env.GOOGLE_API_KEY}`).then(result =>{
    return new Routes(result.body.routes[0].legs[0]);
  })

  let routeFour = superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest3}&key=${process.env.GOOGLE_API_KEY}`).then(result =>{
    return new Routes(result.body.routes[0].legs[0]);
  })

  let routeFive = superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest4}&key=${process.env.GOOGLE_API_KEY}`).then(result =>{
    return new Routes(result.body.routes[0].legs[0]);
  })

  Promise.all([routeOne, routeTwo, routeThree, routeFour, routeFive]).then(result =>{
    allResultsObject.routes = result;
    searchUberData(request, response);
  })
}

// ----------------UBER---------------------------------------
//Gets ride estimates
//Saves estimates for UberX
function searchUberData (request, response){
  let uber1 = superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[0].destLat}&end_longitude=${allResultsObject.hh[0].destLng}`).set('Authorization', `Token ${process.env.UBER_API_KEY}`).then(result =>{
    return new Uber(result.body);
  });

  let uber2 = superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[1].destLat}&end_longitude=${allResultsObject.hh[1].destLng}`).set('Authorization', `Token ${process.env.UBER_API_KEY}`).then(result =>{
    return new Uber(result.body);
  });

  let uber3 = superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[2].destLat}&end_longitude=${allResultsObject.hh[2].destLng}`).set('Authorization', `Token ${process.env.UBER_API_KEY}`).then(result =>{
    return new Uber(result.body);
  });

  let uber4 = superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[3].destLat}&end_longitude=${allResultsObject.hh[3].destLng}`).set('Authorization', `Token ${process.env.UBER_API_KEY}`).then(result =>{
    return new Uber(result.body);
  });

  let uber5 = superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[4].destLat}&end_longitude=${allResultsObject.hh[4].destLng}`).set('Authorization', `Token ${process.env.UBER_API_KEY}`).then(result =>{
    return new Uber(result.body);
  });

  Promise.all([uber1, uber2, uber3, uber4, uber5]).then(result =>{
    allResultsObject.uber = result;
    //After all data is collected, render the page!
    response.render('happy_hour.ejs', {allResultsObject: allResultsObject});
  });
}

// ----------------DATABASE---------------------------------------

//Adds restaurant to the database
function addPetInformationToDB(request, response){
  console.log(request.body);
  const name = request.body.name;
  var count = parseInt(request.body.Answer);
  var idx = parseInt(request.body.index)
  checkDB(name, count, idx, response).then(result => {
    if(result === 'NOT IN DATABASE'){
      client.query('INSERT INTO pets (restaurant, petfriendly) VALUES ($1, $2)', [name, count])
      response.render('happy_hour.ejs', {allResultsObject: allResultsObject});
    }
  });
}

//Checks if the restaurant exists in the database
//If not returns a negative response
//If yes, increment the votes and update the data base
function checkDB(name, count, idx, response){
  return client.query('SELECT * FROM pets WHERE restaurant=$1', [name]).then(result => {
    if(result.rows[0]){
      client.query('SELECT petfriendly FROM pets WHERE restaurant=$1', [name]).then(result => {
        if(count === 1){
          count = result.rows[0].petfriendly + 1;
        }else{
          count = result.rows[0].petfriendly - 1;
        }
        client.query('UPDATE pets SET petfriendly=$1 WHERE restaurant=$2', [count, name]).then(result => {
          allResultsObject.hh[idx].petfriendly = count;
          response.render('happy_hour.ejs', {allResultsObject: allResultsObject});
        });
      });
    }else{
      return 'NOT IN DATABASE'
    }
  })
}

// If connected, logs to the terminal which port it is on
app.listen(PORT, () => { console.log(`App is running on port ${PORT}`)})
