const bcrypt = require ('bcrypt-nodejs')

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
            unique: {
                args: true
            },
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
        },
    });

    // set up the associations so we can make queries that include
    // the related objects
    User.associate = function ({ AuthToken }) {
        User.hasMany(AuthToken);
    };

    // This is a class method, it is not called on an individual
    // user object, but rather the class as a whole.
    // e.g. User.authenticate('user1', 'password1234')
    User.authenticate = async function(username, password) {
        const user = await User.findOne({ where: { username } });
    // bcrypt is a one-way hashing algorithm that allows us to
    // store strings on the database rather than the raw
    // passwords. Check out the docs for more detail
        if (bcrypt.compareSync(password, user.password)) {
            return user.authorize();
        }
        throw new Error('invalid password');
  }

    // in order to define an instance method, we have to access
    // the User model prototype. This can be found in the
    // sequelize documentation
    User.prototype.authorize = async function () {
        const { AuthToken } = sequelize.models;
        const user = this

        // create a new auth token associated to 'this' user
        // by calling the AuthToken class method we created earlier
        // and passing it the user id
        const authToken = await AuthToken.generate(this.username);

        // addAuthToken is a generated method provided by
        // sequelize which is made for any 'hasMany' relationships
       // await user.addAuthToken(authToken);
        return { user, authToken }
    };


    User.prototype.logout = async function (token) {
        // destroy the auth token record that matches the passed token
        sequelize.models.AuthToken.destroy({ where: { token } });
    };
    return User;
};