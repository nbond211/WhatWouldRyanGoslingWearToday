var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var httpreq = require('httpreq');
var fs = require('fs');
var rp = require('request-promise');
var async = require("async");
var ryanOutfits = require(__dirname + '/public/assets/ryanOutfits.json');
var apiKeys = require(__dirname + '/apiKeys.json');
var port = 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/src/views/index.html');
});

app.post('/weather', function(req, res) {
    async.waterfall([
            function(callback) {
                var location = req.body.location;

                httpreq.get('http://api.openweathermap.org/data/2.5/weather?q=' + location + '=&APPID='+ apiKeys.weatherApiKey +'&units=imperial', function(err, resp) {
                    if (err) return console.log(err);

                    var data = JSON.parse(resp.body);
                    var temperature = data.main.temp;
                    var weather = data.weather[0].main;
                    var outfit = chooseOutfit(temperature, weather);
                    var city = data.name;

                    callback(null, {
                        temperature: temperature,
                        weather: weather,
                        outfit: outfit,
                        city: city
                    });
                });
            },
            function(weatherData, callback) {
                var searchString;

                if (weatherData.weather == "Rain") {
                    searchString = "ryan gosling rain";
                } else {
                    searchString = "ryan gosling " + weatherData.outfit;
                }

                httpreq.get(
                    'https://www.googleapis.com/customsearch/v1?q='+ searchString +'&key='+ apiKeys.googleApiKey +'&cx='+ apiKeys.googleApiId +'&searchType=image',
                    function(err, resp) {
                        if (err) return console.log(err);

                        var data = JSON.parse(resp.body).items;
                        var imgUrl = getRandomElementFrom(data).link;

                        var forcastOutfitData = new forcastWithOutfit(weatherData.outfit, imgUrl, weatherData.weather, weatherData.temperature, weatherData.city);

                        callback(null, forcastOutfitData);
                    });
            }
        ],
        function(err, result) {
            res.send(result);
        });


});

function forcastWithOutfit(outfit, imgUrl, weatherDescription, temperature, cityName) {
    this.outfit = outfit;
    this.imgUrl = imgUrl;
    this.weatherDescription = weatherDescription;
    this.temperature = temperature;
    this.cityName = cityName;
    this.message = writeMessage(outfit, weatherDescription, cityName);
    // var example = new forcastWithOutfit("Sweater", "url", "Snowing", 34, Timonium);
}

function getTemperatureDescriptionFromTemp(temp) {
    if (temp <= 45) {
        return "cold";
    } else if (temp <= 60) {
        return "chilly";
    } else if (temp <= 75) {
        return "comfortable";
    } else {
        return "hot";
    }
}

function isWeatherRainCondition(weatherMain) {
    return (weatherMain == "Thunderstorm" ||
        weatherMain == "Drizzle" ||
        weatherMain == "Rain");
}

function chooseOutfit(temperature, weather) {
    var rainFlag = isWeatherRainCondition(weather);
    var temperatureDescription = getTemperatureDescriptionFromTemp(temperature);

    if (rainFlag) {
        return "Rain";
    } else {
        var outfitArray = ryanOutfits[temperatureDescription];
        return getRandomElementFrom(outfitArray);
    }
}

function writeMessage(outfit, weather, city) {
    if (isWeatherRainCondition(weather)) {
        return "It's rainy today in " + city + ". Try not to get too wet, like Ryan here."
    } else if (outfit == "shirtless") {
        return "It sure is hot out today in " + city + ", if you know what I mean."
    } else {
        var message = "The weather outside in " + city + " is " + weather + ". Ryan Gosling would wear his " + outfit + ".";
        return message;
    }
}

function getRandomElementFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

app.listen(port, function() {});