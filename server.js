'use strict';

require('dotenv').config();

// Sets the port to what is specified in the .ENV file or defaults to 3000
const PORT = process.env.PORT || 3000;

// Library that has all of the GET and Set commands
const express = require('express');


const app = express();





// Middlewear - bridges between data and application
app.set('view-engine', 'ejs');




// Redirects the user to the index page
app.get('/', (request, response) => {
  response.render('index.ejs');
});




// If connected, logs to the terminal which port it is on
app.listen(PORT, () => { console.log(`App is running on port ${PORT}`)})
