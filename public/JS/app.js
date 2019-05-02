'use strict';

$('#showForm').on('click', event => {
  $('.petInformation').toggle();
});

$('.petForm').on('submit', event => {
  event.preventDefault();
  $('.petInformation').toggle();
});


// $('#Yes').on('click', event => {
//   event.preventDefault();
//   console.log(event.target.id);
// });

// $('#No').on('click', event => {
//   event.preventDefault();
//   console.log(event.target.id);
// });

