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

exports.getById = async (req, res) => {  
  try {
    const book = await Books.findByPk(req.params.id);
    if(book){
      return res.status(200).json({
        book :{
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          published_date : book.published_date,
          book_created: book.createdAt,
          userId: book.userId
        }
      });
    }else{
      return res.status(404).send(`No Book found for this id ${book.userId}`);
    }
  } catch (err) {
    return res.status(400).send('Error while extracting books.');
  }
};

exports.getAllBooks = async (req, res) => {  
  try {
    const book = await Books.findAll();
    if(book){
      return res.status(200).json(book);
    }else{
      return res.status(404).send(`No Books found`);
    }
  } catch (err) {
    return res.status(400).send('Error while extracting books.');
  }
};

exports.deleteById = async (req, res) => {
  try{
    const id = req.params.id;
    if(!req.headers.authorization){
      return res.status(401).send({
        message : "Unauthorized Access"
      })
    }
    const user = await User.authenticate(req, res);
    if(user){
      const book = await Books.findOne(
        {where: {id : id, userId: "2"}});
      if(book){
        await Books.destroy(
          {where: {id : id, userId: user.id}});
        return res.status(200).send({
          message : "Book deleted successfully!!"
        });
      }else{
        return res.status(404).send({
          message : "No such Book exists."
        });
      }
    }
  }catch(err){
    res.status(400).send({
      message : err.message || `Error occurred while deleting book by id: ${id}`
    });
  }
};