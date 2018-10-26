'use strict';
const express = require('express');
const passport = require('passport');
const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

const uuidv4 = require('uuid/v4');

// Post to register a new user

//1. ensure username and password are defined
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'isAdmin'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

// check that all fields are strings
  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
 
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  //set the correct length. bcrypt will trunscate passwords after 72 characters
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = '', isAdmin = false} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();
  isAdmin = isAdmin.trim();
 
  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName,
        isAdmin,
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
    
});

router.post('/createassignment/:userID', jsonParser, jwtAuth, (req, res) => {
  const userID = req.params.userID;
  const {user} = req
  console.log(`User ${user.username} is POSTing as ${user.isAdmin?'admin':'student'}`)

  if(!user.isAdmin){
    return res.status(401).json({message:'You must be a teacher'})
  }
  User
  .findById(userID)
  .then(user => {
    const assignment = {}; 
    assignment.id =  uuidv4();
    assignment.assignmentName = req.body.assignmentName;
    assignment.assignmentDate = req.body.assignmentDate;
    console.log(user);
    user.Assignments.push(assignment);
    console.log(user);
    User
    .findByIdAndUpdate(userID, user, {new: true})
    .then(updatedUser => {
      res.status(200).json(updatedUser.serialize())
    })
    
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'something went horribly awry' });
  });
   
});

router.get('/', (req, res) => {

  return User
    .find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
 
});

router.get('/:id', (req, res) => {

  return User
    .findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
    
});

//update will update ONE assignment at a time
/*router.put('/', jsonParser, (req, res) => {
  const requiredFields = ['assignmentName', 'assignmentDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const updated = {};
 /* if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  } 
  console.log(`Updating item \`${req.params.id}\``);
  User
  .updateOne(req.params.assignmentName, { $set: updated }, { new: true });
 console.log(`Updated name is ${req.body.assignmentName}!`);
  res.status(204).end();
});
*/
router.put('/:id', jsonParser, (req, res) => {
  const updated = {};
  const updateableFields = ['Assignments'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  for(let i = 0; i < req.body.Assignments.length; i++){
    console.log(req.body.Assignments[i].id)

    for(let j = 0; j < updated.Assignments.length; j++){
      console.log(updated)
      console.log(updated.Assignments[j].id)

      if(req.body.Assignments[i].id === updated.Assignments[j].id){
        User
        .findById(req.params.id)
        .findOneAndUpdate(req.params.Assignments, {$set: updated}, { new: true })
        .then(updatedPost => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Something went wrong' })); 
      }
    }

  }


    
}); 

//delete will delete ONE assignment only at a time HTTP DELETE
router.delete("/:id", jsonParser, (req, res) => {
  const deleted = {};
  const deletedFields = ['Assignments'];
  deletedFields.forEach(field => {
    if (field in req.body) {
      deleted[field] = req.body[field];
    }
  });
/*
  User
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));*/
});


// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
/* router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});  */

module.exports = {router};
