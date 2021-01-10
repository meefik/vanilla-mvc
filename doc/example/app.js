import route from 'router';

window.onload = function() {
  route(location.hash || '#/');
};
