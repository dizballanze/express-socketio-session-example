$(document).ready(function() {
  console.log(123);
  var socket = io.connect('/');

  socket.on('connect', function() {
    console.log('connected');
  });

  socket.on('message', function(data) {
    var chat_message = data['user'] + ': ' + data['message'];
    $('#log').val($('#log').val() + '\n' + chat_message);
    $('#log').scrollTop(100000);
  });

  $('#send').click(function() {
    var msg = $('#message').val();
    socket.emit('message', {'message': msg});
    $('#message').val('');
  });
});