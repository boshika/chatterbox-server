// TODO: Room selection doesn't work quite right
//        - pull history from room also???
//        - pull full list of rooms?? (too much?)
// TODO: Prettifying (srsly, style it up)
// TODO: Minor refactors
//        - Some duplicated code
//        - Some mixed logic
// TODO: Make room (easy)
// TODO: Potentially major UI update (overlaps w/prettifying)

var storage = [];
var app = {
  // server: 'https://api.parse.com/1/classes/chatterbox',
  server: 'http://127.0.0.1:3000/classes/chatterbox',
  // add socket to app
  socket: io.connect('http://127.0.0.1:3000/classes/chatterbox'),
  connectionType: 'socket',
  // time is initial time to try reconnecting in ms
  time: 1000,
  friends: {},
  rooms: {},
  init: function() {
    if (this.connectionType==='ajax') {
      this.fetch();
    }
    if (this.connectionType==='socket') {
      this.socket.on('new-message', function(data) {
        var addedRoom = data.results.slice(0);
        addedRoom.unshift({roomname:'View All'});
        var roomSelect = d3.select('#rooms').selectAll('option')
                          .data(addedRoom, function(d) { return d.roomname; });
        roomSelect.enter()
          .insert('option')
          .each(function(d) {
            $(this).text(d.roomname);
            app.rooms[$(this).text()] = d.roomname;
            if ( d.roomname === 'View All' ) {
              app.rooms[$(this).text()] = null;
            }
          });

        roomSelect.exit()
          .remove();

        var chat = d3.select('#chats').selectAll('div')
                    .data(data.results, function(d) { return d.objectId; });
        chat.enter()
          .insert('div')
          .attr('id',function(d) { return d.objectId; })
          .each(function(d) {
            app.addMessage({username:d.username,text:d.text,roomname:d.roomname},d.objectId);
          });
        chat.exit()
          .remove();
      });
    }
    $('#sendMessage').on('click', function(e) {
      var user = $('#username').val();
      var text = $('#chatMessage').val();
      var room = app.rooms[$('#rooms option:selected').text()];
      app.send({username: user,text: text,roomname: room});
      $('#chatMessage').val('').focus();
    });
    $('#chatMessage').on('keypress',function(e) {
      if (e.keyCode === 13) {
        var user = $('#username').val();
        var text = $('#chatMessage').val();
        var room = app.rooms[$('#rooms option:selected').text()];
        app.send({username: user,text: text,roomname: room});
        $('#chatMessage').val('').focus();
      }
    });
  },
  send: function (message) {
    if (this.connectionType==='ajax') {
      $.ajax({
        url: this.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function(data) {
          console.log(data);
          console.log('Message sent');
        },
        error: function(data) {
          console.log('Error sending');
        }
      });
    }
    if (this.connectionType === 'socket') {
      //socket.io code here
      this.socket.emit('send-message', message);
    }
  },
  fetch: function() {
    if (this.connectionType==='ajax') {
      $.ajax({
        url: this.server,
        type: 'GET',
        success: function(data) {
          if (app.time>1000) app.time=1000;
          var addedRoom = data.results.slice(0);
          addedRoom.unshift({roomname:'View All'});
          var roomSelect = d3.select('#rooms').selectAll('option')
                            .data(addedRoom, function(d) { return d.roomname; });
          roomSelect.enter()
            .insert('option')
            .each(function(d) {
              $(this).text(d.roomname);
              app.rooms[$(this).text()] = d.roomname;
              if ( d.roomname === 'View All' ) {
                app.rooms[$(this).text()] = null;
              }
            });

          roomSelect.exit()
            .remove();

          var chat = d3.select('#chats').selectAll('div')
                      .data(data.results, function(d) { return d.objectId; });
          chat.enter()
            .insert('div')
            .attr('id',function(d) { return d.objectId; })
            .each(function(d) {
              app.addMessage({username:d.username,text:d.text,roomname:d.roomname},d.objectId);
            });
          chat.exit()
            .remove();

          app.poll();
        },
        error: function(data) {
          console.log('Error fetching, trying again in '+(app.time/1000)+' secs');
          setTimeout(function(){app.fetch();},app.time);
          app.time*=2;
        }
      });
    }
  },
  addMessage: function (message,objectId) {

    var fakeRoom = document.createElement('option');
    $(fakeRoom).text(message.roomname);
    fakeRoom = $(fakeRoom).text();
    var curRoom = $('#rooms option:selected').text();
    if (curRoom !== 'View All' && curRoom!==fakeRoom ) return;

    objectId = objectId || null;
    var userClass = 'username';
    var el = document.createElement('span');
    if (app.friends.hasOwnProperty(message.username) && app.friends[message.username]===true) {
      userClass += ' friend';
    }
    $(el).addClass(userClass).text(message.username+' : ');
    $('#'+objectId).append(el);
    $(el).on('click', function() {
      app.friends[message.username] = !app.friends[message.username];
      var friend = $(this).text();
      $('.username').each(function() {
        if ($(this).text()===friend) {
          if (app.friends[message.username]) {
            $(this).addClass('friend');
          } else {
            $(this).removeClass('friend');
          }
        }
      });
    });
    el = document.createElement('span');
    $(el).addClass('message').text(message.text);
    $('#'+objectId).append(el);
  },
  clearMessages: function () {
    $('#chats').html('');
  },
  addRoom: function (roomName) {
    var el = document.createElement('div');
    $(el).text(roomName).appendTo('#roomSelect');
  },
  poll: function() {
    setTimeout(function() {
      app.fetch();
    },1500);
  }
};
