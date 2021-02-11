let express = require('express'),
    app = express(),
    PORT = process.env.PORT || 3000,
    //Sequelize = require ('sequelize'),
    bodyParser = require('body-parser'),
    routes = require('./src/routes/user_routes'),
    db = require('./src/model'),
    authMiddleware = require('./src/authMiddleware/authMiddleware'),
    cookieParser = require('cookie-parser');

db.sequelize.sync();

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(authMiddleware);

app.get('/', (req, res) =>
    res.send(`Node and express server is running on port ${PORT}`)
);

app.listen(PORT, () =>
    console.log(`your server is running on port ${PORT}`)
);

//Enabling CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

routes(app);