module.exports = (sequelize, DataTypes) => {

    const AuthToken = sequelize.define('AuthToken', {
        username: {
            type: DataTypes.STRING,
            allowNull : false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {});
  
    // set up the associations so we can make queries that include
    // the related objects
    AuthToken.associate = function({ User }) {
      AuthToken.belongsTo(User);
    };
  
    // generates a random 15 character token and
    // associates it with a user
    AuthToken.generate = async function(username) {
      if (!username) {
        throw new Error('AuthToken requires a username')
      }
  
      let token = '';
  
      const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789';
  
      for (var i = 0; i < 15; i++) {
        token += possibleCharacters.charAt(
          Math.floor(Math.random() * possibleCharacters.length)
        );
      }
  
      return AuthToken.create({ token, username })
    }
  
    return AuthToken;
  };