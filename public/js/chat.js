const socket = io();

function scrollToBottom () {
  // Selectors
  let messages = $('#messages');
  let newMessage = messages.children('li:last-child');
  // Heights
  let clientHeight = messages.prop('clientHeight');
  let scrollTop = messages.prop('scrollTop');
  let scrollHeight = messages.prop('scrollHeight');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  let params = $.deparam(window.location.search);
  params.room = params.room.toLowerCase();
  socket.emit('join', params, function (error) {
    if (error) {
      alert(error);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
  let ol = $('<ol></ol>');
  users.forEach((user) => {
    ol.append($('<li></li>').text(user));
  });

  $('#users').html(ol);
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
  let template = $('#message-template').html();
  let html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = $('#location-message-template').html();
  let html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
  
});

$('#message-form').on('submit', function (e) {
  e.preventDefault();

  let messageBox = $('[name=message]');

  socket.emit('createMessage', {
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

const soundButton = $('#toggle-sound');

soundButton.on('click', function (e) {
  if (soundButton.text() === 'Sound On') {
    soundButton.text('Sound Off');
    socket.off('messageIncoming');
  } else {
    soundButton.text('Sound On');
    socket.on('messageIncoming', function () {
      let sound = new Audio('/assets/newmessage.mp3');
      sound.play();
    });
  }
});