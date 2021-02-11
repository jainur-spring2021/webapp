module.exports = app => {
    const users = require("../controller/user_controller.js");
    var router = require("express").Router();
  
    // Create a new user
    router.post("/", users.create);

     // login
     router.post("/login", users.login);

     //Logout
    router.delete('/logout', users.logout);

    //My Account (user account)
    router.get('/myaccount', users.myAccount);
  
    // Retrieve all users
    router.get("/", users.findAll);
  
    // Retrieve a single user with username
    router.get("/:username", users.findOne);
  
    // Update a user with username
    router.put("/:username", users.update);
  
    // Delete a user with username
    router.delete("/:username", users.delete);
  
    // Delete all Tutorials
    router.delete("/", users.deleteAll);
  
    app.use('/api/users', router);
  };