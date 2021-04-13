const UUID = require('uuid');
const db  = require('../model');
const Books = db.books;
const User = db.users;
const Images = db.images;
const config = require("../db_details/db.config.js");
const aws = require('aws-sdk');
aws.config.update({region: config.aws_region});
// Create publish parameters
var params = {
  Message: '',
  TopicArn: config.TOPIC_ARN,
};

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

    var regex = new RegExp('^[A-Za-z]+$');
    if (!regex.test(req.body.author)) {
      res.status(400).send({
        message: "Author name can contain only alphabets"
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
      params.Message = 'Dear '+ user.username +' <br><br> Greetings of the day!</br></br><br><br> Thank you for using BooksBuffet.me. The book with following details is created: </br></br> <br>Name: '+ book.title +'</br><br> ISBN: '+ book.isbn +'</br><br> Author: '+ book.author +'</br><br> Publish Date: '+ book.published_date +'</br><br> Hope you are enjoying using BooksBuffet.me. </br><br> <br> Best, <br> BooksBuffet </br></br><br> <br> <br> To unsubscribe click on this link </br></br></br>'
      // Create promise and SNS service object
      var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

      // Handle promise's fulfilled/rejected states
      publishTextPromise.then(
      function(data) {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.log("error in publishing");
        console.log(err, err.stack);
        console.error(err, err.stack);
      });
      res.status(200).json({
          message :  `Book created successfully with title: ${book.title}`,
          book: book
      })
    })
    .catch(err => {
      if(err.message == "Validation error"){
        return res.status(400).send({
          message : "Book with this isbn aslready exists"
        });
      }else{
        return res.status(400).send({
          message: err.message || "Error occurred while creating the user."
        });
      }
    });
};

exports.getById = async (req, res) => {  
  try {
    const book = await Books.findByPk(req.params.id);
    if(book){
      return res.status(200).json({
        book : book 
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
      const book = await Books.findOne({where: {id: id, userId: user.id}});
      if(book){
        const file = await Images.findOne({where: {bookId: book.id}});
        if(file){
            const s3 = new aws.S3();
            var s3Params = {
                Bucket: config.AWS_BUCKET_NAME,
                Key: file.file_name
            };
            s3.deleteObject(s3Params,function(err){
                if(err){
                    res.status(400).send({
                        status: 400,
                        message: "Error occured in deleting from S3"
                    });
                }else{
                    res.status(204).send();
                }
            })
            await Images.destroy({where: {bookId: book.id}});
        }
        
        params.Message = 'Dear '+ user.username +' <br><br> Greetings of the day!</br></br><br><br> Thank you for using BooksBuffet.me. The book with following details is deleted: </br></br> <br>Name: '+ book.title +'</br><br> ISBN: '+ book.isbn +'</br><br> Author: '+ book.author +'</br><br> Publish Date: '+ book.published_date +'</br><br> Hope you are enjoying using BooksBuffet.me. </br><br> <br> Best, <br> BooksBuffet </br></br><br> <br> <br> To unsubscribe click on this link </br></br></br>'
        Books.destroy({where: {id: id, userId: user.id}});
        // Create promise and SNS service object
        var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

        // Handle promise's fulfilled/rejected states
        publishTextPromise.then(
        function(data) {
          console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
          console.log("MessageID is " + data.MessageId);
        }).catch(
          function(err) {
          console.log("error in publishing");
          console.log(err, err.stack);
          console.error(err, err.stack);
        });
        res.status(204).send();
      }else{
        return res.status(404).send({
          message : "No such Book exists or the user logged in not the owner of the book with which Image is attached"
        });
      }
    }
  }catch(err){
    res.status(400).send({
      message : err.message || `Error occurred while deleting book by id: ${id}`
    });
  }
};