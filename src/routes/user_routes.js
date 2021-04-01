module.exports = app => {
    const users = require("../controller/user_controller.js");
    const books = require("../controller/book_controller.js");
    const images = require("../controller/image_controller.js");
    var router = require("express").Router();
  
    // Create a new user
    router.post("/users", users.create);

    // Get User Account
    router.get("/users/userAcc", users.userAcc);
  
    // Update a user with username
    router.put("/users/updateAccount", users.update);

    // Create new book
    router.post("/books", books.create);

    // Get book by id
    router.get('/books/:id', books.getById);

    // Get all books
    router.get('/books', books.getAllBooks);

    // Delete book by id
    router.delete('/books/:id', books.deleteById);

    // Post an image 
    router.post("/books/:id/image", images.uploadImage);

    //Delete an image
    router.delete("/books/:bookId/image/:imageId", images.deleteImage);

    //Delete an image
    router.post("/health", users.healthCheck);
    
    app.use('/', router);
  };