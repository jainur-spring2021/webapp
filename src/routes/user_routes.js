module.exports = app => {
    const users = require("../controller/user_controller.js");
    const books = require("../controller/book_controller.js");
    var router = require("express").Router();
  
    // Create a new user
    router.post("/users", users.create);

    // Get User Account
    router.get("/users/userAcc", users.userAcc);
  
    // Update a user with username
    router.put("/users/updateAccount", users.update);

    // Create new book
    router.post("/book", books.create);

    // Get book by id
    //router.get('/book/{id}', books.getById);

    // Get all books
    //router.get('/book', books.getAllBooks);

    // Delete book by id
    //router.delete('/book/{id}', books.deleteById);


    app.use('/api/', router);
  };