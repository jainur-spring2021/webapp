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
  if (!req.body.lastname) {
    res.status(400).send({
      message: "LastName can not be empty!"
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
      res.status(500).send({
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

  // hash the password provided by the user with bcrypt so that
  // we are never storing plain text passwords. This is crucial
  // for keeping your db clean of sensitive data
  var salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  // Create a User
  const user = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    password: hash
  };

  // Create new user and save in the database
  await Users.create(user)
    .then(user => {
      user.authorize();
      res.status(200).json({
          message :  `User created successfully with username: ${user.username}`
    })
  })
    .catch(err => {
      if(err.message == "Validation error: Validation isEmail on username failed"){
        res.status(400).send({
          message : "Email should be of format a@a.com"
        });
        return;
      }
      res.status(500).send({
        message:
          err.message || "Error occurred while creating the user."
      });
    });
};

// Retrieve all Users from the database.
// exports.findAll = (req, res) => {
//     Users.findAll()
//       .then(data => {
//         res.status(200).json({
//           id: data[0].id,
//           firstname: req.body.firstname,
//           lastname: req.body.lastname,
//           username: req.body.username,
//           createdAt: data[0].createdAt,
//           updatedAt: data[0].updatedAt
//         });
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Error occurred while retrieving users."
//         });
//       });
// };

exports.login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // if the username / password is missing, we use status code 400
  // indicating a bad request was made and send back a message
  if (!username || !password) {
    return res.status(400).send(
      'Request missing username or password param'
    );
  }

  try {
    let user = await Users.authenticate(username, password)
     res.cookie("auth_token", user.authToken);
    return res.status(200).json({
      user :{
        id: user.user.id,
        firstname: user.user.firstname,
        lastname: user.user.lastname,
        username: user.user.username,
        createdAt: user.user.createdAt,
        updatedAt: user.user.updatedAt
      },
      authToken: {
        id: user.authToken.id,
        token: user.authToken.token,
        createdAt: user.authToken.createdAt
      }
    });
  } catch (err) {
    return res.status(400).send('invalid username or password');
  }
};

exports.logout = async (req, res) => {

  // because the logout request needs to be send with
  // authorization we should have access to the user
  // on the req object, so we will try to find it and
  // call the model method logout
  const { user, cookies: { auth_token: authToken } } = req

  // we only want to attempt a logout if the user is
  // present in the req object, meaning it already
  // passed the authentication middleware. There is no reason
  // the authToken should be missing at this point, check anyway
  if (user && authToken) {
    await req.user.logout(authToken);
    res.clearCookie("auth_token");
    return res.status(200).send({
      message: "User logged out successfully!"
    })
  }

  // if the user missing, the user is not logged in, hence we
  // use status code 400 indicating a bad request was made
  // and send back a message
  return res.status(400).send(
    { errors: [{ message: 'not authenticated' }] }
  );
};

//User Account Details
exports.myAccount = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      id : req.user.id,
      firstname : req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      account_created : req.user.createdAt,
      account_updated : req.user.updatedAt
    });
  }
  res.status(404).send(
    { errors: [{ message: 'No user is logged in.' }] }
  );
};

// Find a single user with a username
exports.findOne = (req, res) => {
  const username = req.params.username;
  Users.findByPk(username)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving user with username=" + username
      });
    });
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  if (req.user) {
    const username = req.user.username;
    if(req.body.username){
      res.status(400).send({
        message: "UserName cannot be updated!"
      });
      return;
    }
    var salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash
    await Users.update(req.body, {
      where: { username: username }
    }).then(num => {
        if (num == 1) {
          res.status(200).json({
            message: `User was updated successfully with username=${username}`,
          });
        } else {
          res.send({
            message: `Cannot update user with username=${username}. Maybe user was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating User with username=" + username
        });
      });
  }
  res.status(404).send(
    { errors: [{ message: 'User must login to update details' }] }
  );
};

// Delete a User with the specified username
exports.delete = (req, res) => {
  const username = req.params.username;
  Users.destroy({
    where: { username: username }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with username=${username}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete user with username=" + username
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  Users.destroy({
    where: {},
    truncate: false
  }).then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error occurred while removing all users."
      });
    });
};