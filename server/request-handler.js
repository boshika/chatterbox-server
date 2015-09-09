/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// adding objectId because client needs it
var storage = [];
var fs = require('fs');
var requestHandler = function(request, response) {
  
  var sendResponse = function(response, data, statusCode) {
    statusCode = statusCode || 200;
    response.writeHead(statusCode, defaultCorsHeaders);    
    response.end(JSON.stringify(data));
  }
  
  console.log("Serving request type " + request.method + " for url " + request.url);

  if(request.url.match( /^\/classes\// )) {

    // These can just be separate IFs - easier to read

    if (request.method === 'GET') {
      sendResponse(response, { results: storage } );
    }

    if (request.method === 'POST') {
      var body = "";
      request.on('data', function(pieces) {
       body+=pieces;      
      });

      request.on('end', function() {
        var post = JSON.parse(body);
        post.objectId = storage.length.toString();
        storage[post.objectId] = post; 
        sendResponse(response, "This is a post",201);
      });
    }

    if (request.method === 'OPTIONS') {
      sendResponse(response, "for CORS");
    }

  // If we aren't expressly routing to AJAX handler above,
  // then try to load the file
  } else {

    // setup our fileName
    var ROOT_DIR = '../client';
    var fileName = request.url;
    if(fileName === '/') fileName = '/index.html';

    // read our file WARNING: UNSAFE!!!!
    fs.readFile(ROOT_DIR+fileName, function(err, data){
      // if there's an error loading the file this exists
      // as a Node Error object
      if (err) {

        // this means the file doesn't exist
        if (err.code==='ENOENT') {
          response.writeHead(404);
          response.end('404: File not found');

        // in all other cases we'll return 500: Internal Server Error
        } else {
          response.writeHead(500);
          response.end('500: Error loading');
        }
        // and for good measure log the entire error to the console
        console.log(err);
      }

      // leave out headers for now
      // we'd have to detect the file type to serve them correctly
      response.writeHead(200);
      response.end(data);
    });
  }
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "application/json"
};

module.exports = requestHandler;
