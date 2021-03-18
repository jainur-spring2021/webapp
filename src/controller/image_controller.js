const db = require("../model");
const config = require("../db_details/db.config.js");
const Images = db.images;
const User = db.users;
const Book = db.books;
const Op = db.Sequelize.Op;
const uuid = require("uuid");
const aws = require('aws-sdk');

const upload = require('../services/imageServices.js');
const singleUpload = upload.array('image', 10);

exports.uploadImage = async (req, res) => {
    if(!req.headers.authorization){
        return res.status(401).send({
            message : "Unauthorized Access"
        })
    }
    const user = await User.authenticate(req, res);
    if(user){
        const book = await Book.findOne({where: {id: req.params.id, userId: user.id}});
        if(book){
            
            singleUpload(req, res, function (err, data) {
                if (err) {
                    return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }]});
                }else{
                    var image = {
                        file_name: req.files[0].metadata.fileName,
                        s3_object_name: req.files[0].metadata.s3_object_name,
                        file_id: uuid.v1(),
                        bookId: req.params.id,
                    }
                    Images.create(image)
                    .then(data => {
                        res.status(200).send({
                            message: "Image Successfully added ",
                            data: req.files,
                            iamge : image
                        })
                    })
                    .catch(err => {
                        res.status(400).send({
                            message:
                            err.message || "Some error occurred while creating the Users."
                        });
                    })
                }
            });
        }else{
            res.status(400).send({
                message: "User is not the owner of the book"
            });
        }
    }else{
        res.status(400).send({
            message: "User not authenticated"
        });
    }
}

exports.deleteImage = async (req,res) => {
    if(!req.headers.authorization){
        return res.status(401).send({
            message : "Unauthorized Access"
        })
    }
    const user = await User.authenticate(req, res);
    const bookId = req.params.bookId;
    const imageId = req.params.imageId;
    try{
        if(user){
            const book = await Book.findOne({where: {id: bookId, userId: user.id}});
            if(book){
                const file = await Images.findOne({where: {file_id: imageId, bookId: book.id}});
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
                    await Images.destroy({where: {file_id: imageId, bookId: book.id}});
                    return res.status(204);
                }else{
                    return res.status(404).send({
                        message : "No such File exists."
                    });
                }
            }else{
                return res.status(404).send({
                    message : "No such Book exists Or hte user logged in not the owner of the book with which Image is attached"
                });
            }
        }else{
            return res.status(404).send({
                message : "No such User exists."
            });
        }
    }catch(err){
        res.status(400).send({
            message : err.message || `Error occurred while deleting Image by id: ${imageId}`
        });
    }
}