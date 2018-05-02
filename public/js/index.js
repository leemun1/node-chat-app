const socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newUser', function () {
  let sound = new Audio('/assets/join.mp3');
  sound.play();
});

socket.on('messageIncoming', function () {
  let sound = new Audio('/assets/newmessage.mp3');
  sound.play();
});

socket.on('newMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let li = $('<li></li>');
  li.text(`${message.from} ${formattedTime}: ${message.text}`);

  $('#messages').append(li);
});

socket.on('newLocationMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let li = $('<li></li>');
  let a = $('<a target="_blank">My current location</a>');

  li.text(`${message.from} ${formattedTime}: `);
  a.attr('href', message.url);

  li.append(a);
  $('#messages').append(li);
});

$('#message-form').on('submit', function (e) {
  e.preventDefault();

  let messageBox = $('[name=message]');

  socket.emit('createMessage', {
    from: 'User',
    text: messageBox.val()
  }, function () {
    messageBox.val('');
  });
});

const locationButton = $('#send-location');

locationButton.on('click', function (e) {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
