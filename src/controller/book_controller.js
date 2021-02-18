const UUID = require('uuid');
const db  = require('../model');
const Books = db.books;
const User = db.users;

// Create a new book
exports.create = async (req, res) => {
    if(!req.headers.authorization){
      res.status(400).send({
        message: "User is not authorized to create book"
      });
      return;
    }

    const user = await User.authenticate(req, res);

    // Validate request
    if (!req.body.title) {
      res.status(400).send({
        message: "Title can not be empty!"
      });
      return;
    }

    if (!req.body.author) {
      res.status(400).send({
        message: "Author can not be empty!"
      });
      return;
    }

    if (!req.body.isbn) {
      res.status(400).send({
        message: "ISBN can not be empty!"
      });
      return;
    }
  
    if (!req.body.published_date) {
      res.status(400).send({
        message: "Published Date can not be empty!"
      });
      return;
    }

    const book = {
      id : UUID.v1(),
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      published_date: req.body.published_date,
      userId : user.id
    };
    
    Books.create(book)
    .then(book => {
      res.status(200).json({
          message :  `Book created successfully with title: ${book.title}`
      })
    })
    .catch(err => {
      res.status(400).send({
        message:
          err.message || "Error occurred while creating the book."
      });
    });
};