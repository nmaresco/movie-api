const express = require('express');
const app = express();
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid= require('uuid')
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["The Fountain"]
  }
];

let movies = [
  {name: 'Troll 2', genre: 'horror', director: 'Claudio Fragasso'},
  {name: 'The Room', genre: 'Drama', director: 'Tommy Wiseau' },
  {name: 'Joe vs The Volcano', genre: 'adventure', director: 'John Shanley'}
];

//CREATE
app.post('/users',(req,res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('users need names');
  }
})

//UPDATE
app.put('/users/:id', (req,res) => {
  const {id} = req.param;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user){
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400)
  }
})

//CREATE
app.post('/users/:id/:movieTitle',(req,res) => {
  const {id, movieTitle} = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(user);
  }else{
    res.status(400).send('no such user');
  }
})

//DELETE
app.delete('/users/:id/:movieTitle',(req,res) => {
  const {id, movieTitle} = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send('${movieTitle} has been removed from user ${id}s array.');
  }else{
    res.status(400).send('no such user');
  }
})

//DELETE
app.delete('/users/:id',(req,res) => {
  const {id} = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send('user ${id} has been deleted');
  }else{
    res.status(400).send('no such user');
  }
})

//READ
app.get('/movies', (req,res) =>{
  res.status(200).json(movies);
})

//READ
app.get('/movies/:title', (req,res) => {
  const {title} = req.param;
  const movie = movies.find( movie => movie.Title === title);

  if(movie){
    res.status(200).json(movie);
  }else{
    res.status(400).send("no such movie")
  }
})

//READ
app.get('/movies/:genreName', (req,res) => {
  const {genreName} = req.param;
  const genre = movies.find( movie => movie.Genre === genreName).Genre;

  if(genre){
    res.status(200).json(genre);
  }else{
    res.status(400).send("no such genre")
  }
})

//READ
app.get('/movies/:directorName', (req,res) => {
  const {directorName} = req.param;
  const director = movies.find( movie => movie.Director.Name === directorName).Genre;

  if(director){
    res.status(200).json(director);
  }else{
    res.status(400).send("no such director")
  }
})

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(morgan('common'));

app.get('/movies', function routeHandler(req,res){

})
app.listen("8080", () => {
console.log("server running on 8080")
})
