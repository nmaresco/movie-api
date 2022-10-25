const mongoose = require('mongoose');
const Models= require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express');
const app = express();
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
require('dotenv').config()
const uuid= require('uuid')
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{console.log("mongoDB is running.")})
.catch(e=>{console.log(e)});

//get list of movies
app.get('/movies', (req, res) => {
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
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
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
app.get('/users', passport.authenticate('jwt',{session: false}) ,(req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', {session: false}) ,(req, res) => {
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
app.delete('/users/:Username', passport.authenticate('jwt',{session:false}) ,(req, res) => {
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

//UPDATE
app.put('/users/:id', passport.authenticate('jwt', {session:false}) ,(req,res) => {
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
app.post('/users/:id/:movieTitle', passport.authenticate('jwt',{session:false}) ,(req,res) => {
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
app.delete('/users/:id/:movieTitle', passport.authenticate('jwt',{session:false}) ,(req,res) => {
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
app.delete('/users/:id',passport.authenticate('jwt',{session:false}) ,(req,res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
