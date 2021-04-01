const UUID = require('uuid');
const db  = require('../model');
const Users = db.users;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');

// Create and Save a new User
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.firstname) {
    res.status(400).send({
      message: "FirstName can not be empty!"
    });
    return;
  }

  var regex = new RegExp('^[A-Za-z]+$');
  if (!regex.test(req.body.firstname)) {
    res.status(400).send({
      message: "FirstName can contain only alphabets"
    });
    return;
  }

  if (!req.body.lastname) {
    res.status(400).send({
      message: "LastName can not be empty!"
    });
    return;
  }

  var regex = new RegExp('^[A-Za-z]+$');
  if (!regex.test(req.body.lastname)) {
    res.status(400).send({
      message: "Last name can contain only alphabets"
    });
    return;
  }

  if (!req.body.username) {
    res.status(400).send({
      message: "UserName can not be empty!"
    });
    return;
  }

  if(req.body.username){
    var username = req.body.username;
    var condition = username ? { username: { [Op.like]: `%${username}%` } } : null;
    Users.findOne({ where: condition})
    .then(data => {
      if(data!=null){
        res.status(400).send({
          message: "User already exists!"
        });
        return;
      }
    }).catch(err => {
      res.status(400).send({
        message: "Error retrieving user with username=" + username
      });
    });
  }

  if (!req.body.password) {
    res.status(400).send({
      message: "Password can not be empty!"
    });
    return;
  }
  var regex = new RegExp('^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$');
  if (!regex.test(req.body.password)) {
    res.status(400).send({
      message: "Password should conatin atleat 8 characters, 3 lowercase, 2 uppercase, 1 special character (!@#$&*) and 2 numerals"
    });
    return;
  }

  /* hash the password provided by the user with bcrypt so that we are never storing plain text passwords. This is crucial
     for keeping your db clean of sensitive data */
  var salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const user = {
    id : UUID.v1(),
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    password: hash
  };

  // Create new user and save in the database
  await Users.create(user)
    .then(user => {
      res.status(200).json({
          message :  `User created successfully with username: ${user.username}`,
          user : {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
      })
    })
    .catch(err => {
      if(err.message == "Validation error: Validation isEmail on username failed"){
        res.status(400).send({
          message : "Email should be of format a@a.com"
        });
        return;
      }else{
        return res.status(400).send({
          message:
            err.message || "Error occurred while creating the user."
        });
      }
    });
};

exports.userAcc = async (req, res) => {  
  try {
    let user = await Users.authenticate(req,res);
    if(user){
      return res.status(200).json({
        user :{
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
  } catch (err) {
    return res.status(400).send('invalid username or password');
  }
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  if(!req.headers.authorization){
    return res.status(400).send({
      message : "Unauthorized User"
    });
  }
  try{
    let user = await Users.authenticate(req, res);
    if (user) {
      if(req.body.username){
        res.status(400).send({
          message: "UserName cannot be updated!"
        });
        return;
      }
      if(req.body.password){
        var regex = new RegExp('^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$');
        if (!regex.test(req.body.password)) {
          return res.status(400).send({
            message: 
            "Password should conatin atleat 8 characters, 3 lowercase, 2 uppercase, 1 special character (!@#$&*) and 2 numerals"
          });
        }
        var salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash;
      }
      
      if (req.body.firstname) {
        var regex = new RegExp('^[A-Za-z]+$');
        if (!regex.test(req.body.firstname)) {
          res.status(400).send({
            message: "FirstName can contain only alphabets"
          });
          return;
        }
      }
      if (req.body.lastname) {
        var regex = new RegExp('^[A-Za-z]+$');
        if (!regex.test(req.body.lastname)) {
          res.status(400).send({
            message: "Lastname can contain only alphabets"
          });
          return;
        }
      }
      await Users.update(req.body, { where: { username: user.username }})
      .then(num => {
          if (num == 1) {
            res.status(200).json({
              message: `User was updated successfully with username = ${user.username}`,
              user : user
            });
          } else {
            res.status(400).send({
              message: `Cannot update user with username=${user.username}. Maybe user was not found or req.body is empty!`
            });
          }
        })
      return;
    }
  }catch(err){
    res.status(400).send({ 
      message: err.message || "Username/Password is not correct"
    });
  };
};

exports.healthCheck = (res, req) => {
  res.status(200).send();
};