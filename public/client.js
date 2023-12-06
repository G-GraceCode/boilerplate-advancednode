$(document).ready(function () {
  /* global io, Now for the client to connect */
  let socket = io();
  // client to listen for this event from server
  socket.on("user", function (data) {
    $("#num-users").text(data.currentUsers + " users online");

    let message =
      data.username +
      (data.connected ? " has joined the chat." : " has left the chat.");
    $("#messages").append($("<li>").html("<b>" + message + "</b>"));
    console.log("data", data);
  });

  // showing the messages of a user,
  socket.on("chat message", (data) => {
    console.log("socket.on 1");
    $("#messages").append($("<li>").html(`${data.username} : ${data.message}`));
  });

  // Form submittion with new message in field with id 'm'
  $("form").submit(function () {
    var messageToSend = $("#m").val();
    socket.emit("chat message", messageToSend);

    $("#m").val("");
    return false; // prevent form submit from refreshing page
  });
});
