const express = require('express');
const app = express();
const http = require('http');
const morgan = require('morgan');

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Welcome to my book club!\n');
  app.get ('/test', function routeHandler(req,res){
    res.json([
      {name: 'Hitchhikers Guide to the Galaxy'}
    ]);
  });

}).listen(8080);

console.log('My first Node test server is running on Port 8080.');

app.get ('/test', function routeHandler(req,res){
  res.json([
    {name: 'Hitchhikers Guide to the Galaxy'},
    {name: 'Troll 2'},
    {name: 'The Room'},
    {name: 'Joe vs The Volcano'}
  ]);
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(morgan('common'));
