const mongoose = require('mongoose');
const Models= require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express');
const app = express();
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const uuid= require('uuid')
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{console.log("mongoDB is running.")})
.catch(e=>{console.log(e)});

//
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Add a user
/* We'll expect JSON in this format.
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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

app.listen(8080, () => {
console.log("server running on 8080")
})
//Hello
