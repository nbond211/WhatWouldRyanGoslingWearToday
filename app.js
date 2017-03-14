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
var port = 4000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/src/views/index.html');
});

app.post('/weather', function (req, res) {
    async.waterfall([
            function (callback) {
                var location = req.body.location;

                httpreq.get('http://api.openweathermap.org/data/2.5/weather?q=' + location + '=&APPID=' + apiKeys.weatherApiKey + '&units=imperial', function (err, resp) {
                    var data = JSON.parse(resp.body);
                    if (data.cod == 404) {
                        res.send('error');
                        return;
                    }
                    var temperature = data.main.temp;
                    var weather = data.weather[0].main;
                    var outfit = chooseOutfit(temperature, weather);
                    var city = data.name;
                    var weatherCode = data.weather[0].id;

                    callback(null, {
                        temperature: temperature,
                        weather: weather,
                        outfit: outfit,
                        city: city,
                        weatherIcon: getWeatherIconName(weatherCode)
                    });
                });
            },
            function (weatherData, callback) {
                var searchString;

                if (weatherData.weather == "Rain") {
                    searchString = "ryan gosling rain";
                } else {
                    searchString = "ryan gosling " + weatherData.outfit;
                }

                httpreq.get(
                    'https://www.googleapis.com/customsearch/v1?q=' + searchString + '&key=' + apiKeys.googleApiKey + '&cx=' + apiKeys.googleApiId + '&searchType=image',
                    function (err, resp) {
                        if (err) return console.log(err);

                        var data = JSON.parse(resp.body).items;
                        var imgUrl = getRandomElementFrom(data).link;

                        var forcastOutfitData = new forcastWithOutfit(weatherData.outfit, imgUrl, weatherData.weather, weatherData.temperature, weatherData.city, weatherData.weatherIcon);

                        callback(null, forcastOutfitData);
                    });
            }
        ],
        function (err, result) {
            res.send(result);
        });


});

function forcastWithOutfit(outfit, imgUrl, weatherDescription, temperature, cityName, weatherIcon) {
    this.outfit = outfit;
    this.imgUrl = imgUrl;
    this.weatherDescription = weatherDescription;
    this.temperature = temperature;
    this.cityName = cityName;
    this.weatherIcon = weatherIcon;
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
        var message = "Ryan Gosling would wear his " + outfit + ".";
        return message;
    }
}

function getRandomElementFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function getWeatherIconName(code) {
    switch (code) {
        case 200:
        case 201:
        case 202:
        case 230:
        case 231:
        case 232:
        case 960:
            return 'thunderstorm';

        case 210:
        case 211:
        case 212:
        case 221:
            return 'lightning';

        case 300:
        case 301:
        case 321:
        case 500:
            return 'sprinkle';

        case 302:
        case 311:
        case 312:
        case 314:
        case 501:
        case 502:
        case 503:
        case 504:
            return 'rain';

        case 310:
        case 511:
        case 611:
        case 612:
        case 615:
        case 616:
        case 620:
            return 'rain-mix';

        case 313:
        case 520:
        case 521:
        case 522:
        case 701:
            return 'showers';

        case 531:
        case 901:
            return 'storm-showers';
            
        case 600:
        case 601:
        case 621:
        case 622:
            return 'snow';

        case 602:
            return 'sleet';

        case 711:
            return 'smoke';

        case 721:
            return 'day-haze';

        case 731:
        case 751:
        case 761:
        case 762:
            return 'dust';

       case 741:
            return 'fog';

        case 801:
        case 802:
        case 803:
        case 771:
            return 'cloudy-gusts';

        case 804:
            return 'cloudy';

        case 781:
        case 900:
            return 'tornado';

        case 902:
        case 961:
            return 'hurricane';

        case 903:
            return 'snowflake-cold';

        case 904:
            return 'hot';

        case 905:
            return 'windy';

        case 906:
            return 'hail';

        case 957:
        case 958:
        case 959:
            return 'strong-wind';

        default:
            return 'clear';                          
    }
}

app.listen(port, function () {});