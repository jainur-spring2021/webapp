let express = require('express'),
    app = express(),
    PORT = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    routes = require('./src/routes/user_routes'),
    db = require('./src/model'),
    client = require('statsd-client'),
    counter = new client({port:8125, prefix:'api_counter'}),
    s3_execution_time = new client({port:8125, prefix:'s3_execution_time'}),
    db_execution_time = new client({port:8125, prefix:'db_execution_time'}),
    api_execution_time = new client({port:8125, prefix:'api_execution_time'});

db.sequelize.sync();

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

    counter.counter(req.url,1);

    var startTime = process.hrtime();
    res.once('finish', function() {
        console.log("Request for::",req.url);

        if(req.url.includes("/image")){
            var uploadTime = process.hrtime(startTime);
            var uploadTimeInMs = uploadTime[0] * 1e3 + uploadTime[1] * 1e-6;
            s3_execution_time.timing(req.url,uploadTimeInMs);
        }

        var dbExecutionTime = process.hrtime(startTime);
        var dbExecutionTimeInMs = dbExecutionTime[0] * 1e3 + dbExecutionTime[1] * 1e-6;
        console.log('The db processing time is %d ms.', dbExecutionTimeInMs);

        var apiExecutionTime = process.hrtime(startTime);
        var apiExecutionTimeMs = apiExecutionTime[0] * 1e3 + apiExecutionTime[1] * 1e-6;
        console.log('The api processing time is %d ms.', apiExecutionTimeMs);

        db_execution_time.timing(req.url,dbExecutionTimeInMs);
        api_execution_time.timing(req.url,apiExecutionTimeMs);
    });
    next();
});

module.exports = app;
routes(app);