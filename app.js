// PACKAGES
var createError = require('http-errors');
var express = require('express');
var fetch = require('node-fetch');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var log = require("log");
require("log-node")();

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// STATIC ASSETS
app.use(express.static("public"));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.get('/', (req, res) => {
    log.info("INCOMING REQUEST. *logs request info*");
    res.render('home', {
        "start": "",
        "end": ""
    })
});
app.get('/earthquakeData', async (req, res) => {
    log.info("INCOMING REQUEST. *logs request info*");
    // REQUEST VARIABLES
    let start = req.query.startTime;
    let end = req.query.endTime;

    // QUERY DATA
    let queryURL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start}&endtime=${end}`;
    let queryResponse = await fetch(queryURL);
    let queryData = await queryResponse.json();

    let earthquakeArr = [];
        // store values we want to diplay in an array
        // this array holds a JS object with two attributes
    for (let i = 0; i < queryData.features.length; i++) {
        earthquakeArr.push({
            "place": queryData.features[i].properties.place,
            "mag": queryData.features[i].properties.mag.toFixed(1)
                // toFixed method is used to round numbers and in this 
                // case I rounded the number to nearest tenth
        });
    }

    // RESPONSE TO BROWSER
    res.render('home', {
        start: start,
        end: end,
        countData: queryData.metadata.count,
        earthquakeArr: earthquakeArr
    })
});
app.get('/earthquakeMag', async (req, res) => {
    log.info("INCOMING REQUEST. *logs request info*");

    // REQUEST VARIABLES
    let start = req.query.startTime;
    let end = req.query.endTime;
    let minMag = req.query.minMag
    console.log(start + " " + end + " " + minMag);

    // QUERY DATA
    let queryURL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start}&endtime=${end}&minmagnitude=${minMag}`;
    let queryResponse = await fetch(queryURL);
    let queryData = await queryResponse.json();

    let earthquakeArr = [];
        // store values we want to diplay in an array
        // this array holds a JS object with two attributes
    for (let i = 0; i < queryData.features.length; i++) {
        earthquakeArr.push({
            "place": queryData.features[i].properties.place,
            "mag": queryData.features[i].properties.mag.toFixed(1)
                // toFixed method is used to round numbers and in this 
                // case I rounded the number to nearest tenth
        });
    }
    
    // RESPONSE TO BROWSER
    res.render('home', {
        start: start,
        end: end,
        countData: queryData.metadata.count,
        earthquakeArr: earthquakeArr
    })
});
app.get('/about', async (req, res) => {
    log.info("INCOMING REQUEST. *logs request info*");
    res.render('about')
});

// ERROR HANDLING
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    log.warn("failed request! *includes useful req info*");
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
    log.warn("failed request! *includes useful req info*");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// SERVER STARTUP
// by default the server listens on port 3000

module.exports = app;