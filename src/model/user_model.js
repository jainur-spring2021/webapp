const bcrypt = require ('bcrypt-nodejs');
const atob = require('atob');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            noUpdate: true
        },
        firstname:{
            type: Sequelize.STRING,
            allowNull: false
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });

    // set up the associations so we can make queries that include the related objects
    User.associate = function (Books) {
        User.hasMany(Books);
    };

    User.authenticate = async function(req, res) {
        const authToken = req.headers.authorization.split(" ");
        const authCode = authToken[1];
        const decodedCreds = atob(authCode);
        const creds = decodedCreds.split(":"); 
        const username = creds[0];
        const password = creds[1];
        // if username/password is missing, we use status code 400 to indicate that a bad request was made with a message
        if (!username || !password) {
            return res.status(400).send({
            status : 400,
            message: "Username/Password is missing"
            });
        }
        const user = await User.findOne({ where: {username : `${username}` }});
        if (bcrypt.compareSync(password, user.password)) {
            return user;
        }
        throw new Error('Invalid Password');
    }

    return User;
};