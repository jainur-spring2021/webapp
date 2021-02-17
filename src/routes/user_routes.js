module.exports = app => {
    const users = require("../controller/user_controller.js");
    const books = require("../controller/books_controller.js");
    var router = require("express").Router();
  
    // Create a new user
    router.post("/users", users.create);

    // User login
    router.post("/users/login", users.login);

    // My Account (user account)
    router.get('/users/myaccount', users.myAccount);
  
    // Update a user with username
    router.put("/users/updateAccount", users.update);

    // Logout
    router.delete('/users/logout', users.logout);

    // Create new book
    router.post("/book", books.create);

    // Get book by id
    router.get('/book/{id}', books.myAccount);

    // Get all books
    router.get('/book', books.myAccount);

    // Delete book by id
    router.delete('/book/{id}', books.deleteById);


    app.use('/api/', router);
  };