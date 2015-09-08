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
var requestHandler = function(request, response) {
   // var headers = defaultCorsHeaders;
  
   var sendResponse = function(response, data, statusCode) {
    statusCode = statusCode || 200;
    response.writeHead(statusCode, defaultCorsHeaders);    
    response.end(JSON.stringify(data));
   }

   
   console.log("Serving request type " + request.method + " for url " + request.url);
   // request.url.substr(0,9) === '/classes/'
   if(request.url.match( /^\/classes\// )) {

     if(request.method === 'GET') {
       sendResponse(response, { results: storage } );
     } else if(request.method === 'POST') {      
       var body = "";
       request.on('data', function(pieces) {
        body+=pieces;      
       });

       request.on('end', function() {
         var post = JSON.parse(body);
         post.objectId = storage.length;
         storage[post.objectId] = post; 
        sendResponse(response, "This is a post",201);
       })
      } else if (request.method === 'OPTIONS') 
      {
        sendResponse(response, "for CORS");
      }

    } else {
      sendResponse(response,'Not found',404);
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

// var fs = require("fs");
// var ROOT_DIR = '../client';

// var requestHandler = function(request, response) {
 
//   var fileName = request.url;
//   console.log("Serving request type " + request.method + " for url " + request.url);
//   if(fileName === '/') fileName = '/index.html';

//   // The outgoing status.
//   // var statusCode = 200;
//   var headers = defaultCorsHeaders;

//   if (fileName==='/chatterbox') {

//     // chatterboxAPI
//     // return {results: [array of message]}
//     // each message is 
//     // {
//     //  createdAt: 'date'
//     // }

//   } else {

//     fs.exists(ROOT_DIR+fileName, function(exists) {
//       if (!exists) {
//         response.writeHead(404);
//         response.end('Not here');
//       }
//     });

//     fs.readFile(ROOT_DIR+fileName, function(err, data){
//       if (err) console.log(err);
//       // response.write(data);
//       response.writeHead(200, headers);
//       response.end(data);
//     });

//   } 

// };


 // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = "text/html";
  // These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
