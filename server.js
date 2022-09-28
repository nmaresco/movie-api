//imports the http module and listens for requests on port 8080.
const url = require('url');
const http = require('http');
let addr = 'http://localhost:8080/default.html?year=2017&month=february';
let q = url.parse('documentation', true);

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Documentation.html');
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
