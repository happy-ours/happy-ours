'use strict';

$('.showForm').on('click', event => {
  $('.petInformation').toggle();
});

$('.petForm').on('submit', event => {
  event.preventDefault();
  $('.petInformation').toggle();
});


