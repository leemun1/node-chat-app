var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
  console.log('New Message:', message);
});

socket.emit('createMessage', {
  from: 'David',
  text: 'Hi there'
}, function (data) {
  console.log('Got it.', data);
});

