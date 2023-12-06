$(document).ready(function () {
  /* global io, Now for the client to connect */
  let socket = io();
  // client to listen for this event from server
  socket.on("user count", function (data) {
    console.log("data", data);
  });
  // Form submittion with new message in field with id 'm'
  $("form").submit(function () {
    var messageToSend = $("#m").val();

    $("#m").val("");
    return false; // prevent form submit from refreshing page
  });
});
