![Alt text](public/assets/readme.pictures.png "Happy Ours")

# Happy-Ours
 
So lets say you got stuck at work and now you have to wait for traffic to clear, use Happy ours. Happy Ours is a fun way of finding happy hours near you. With our amazing team we are able create this amazing app, that finds the closet resturant and bar near you with a price estimate and even out door seating incase you have a your furry friend with you. It doesnt stop there either! Wondering how long it will take to get to your, BAM! Our state of the art technology will tells you the distance of the bar, and EVEN give you a sunset meter, incase you and your puppy wanna grab a drink on the patio for sunset!


# Our Team 

Williams Argenal - Developer

Evan Pettie - Developer

Melissa Stock - Developer

Krisjanis Cerbulis - Developer


# Problem Domain 

An app that finds just more than a bar.

Having  a application that shows bar information and informs the user/clinet with not only the resturants information, they could also get outdoor seating, weather condition along with a route on how to get there and a estimate distance, and the daily sunset so anyone intersested in catching the sunset and grabbing a good deal on a drink 

 # Semantic versioning

  0.0.1 - Planning stage 
    0.0.2 - block (API)
    0.0.3 - Fixed bugs / running 
    

 #  Application requirements 

Libaries - Places Libary , Jquery 
framework - Java script, gitHub 


Packages - express, ejs , superagent, google map API, 

# Instructions to run app at home

Checkout out our deploy page www.happyours.net

# API endpoints

searchGeocodeData - URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GOOGLE_API_KEY}`;

getMap - URL = `https://maps.googleapis.com/maps/api/staticmap?center=${allResultsObject.originLat},${allResultsObject.originLng}&zoom=13&size=600x300&maptype=roadmap&key=${process.env.GOOGLE_API_KEY}`;

searchWeatherData - URL = `https://api.darksky.net/forecast/776a7b4b172c83e5eaf765414951b01e/${allResultsObject.originLat},${allResultsObject.originLng}`;

searchPlacesData - URL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchTerm}&location=${allResultsObject.originLat},${allResultsObject.originLng}&radius=1600&key=${process.env.GOOGLE_API_KEY}`;

searchPlacesData - URL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchTerm}&location=${allResultsObject.originLat},${allResultsObject.originLng}&radius=1600&key=${process.env.GOOGLE_API_KEY}`;

whenIsTheSunset - URL = `https://api.sunrise-sunset.org/json?lat=${allResultsObject.originLat}&lng=${allResultsObject.originLng}&date=${time}`;

searchRouteData - superagent.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${allResultsObject.userInput}&destination=${dest0}&key=${process.env.GOOGLE_API_KEY}`)

searchUberData - superagent.get(`https://api.uber.com/v1.2/estimates/price?start_latitude=${allResultsObject.originLat}&start_longitude=${allResultsObject.originLng}&end_latitude=${allResultsObject.hh[0].destLat}&end_longitude=${allResultsObject.hh[0].destLng}`)


# Database Schemas

is the skeleton structure that represents the logical view of the entire database.


