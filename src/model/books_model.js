module.exports = (sequelize, Sequelize) => {
    const Book = sequelize.define("book", {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            noUpdate: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        author: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isbn: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        published_date: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    });

    // set up the associations so we can make queries that include the related objects
    Book.associate = function (images) {
        Book.hasOne(images);
    };

    return Book;
};

