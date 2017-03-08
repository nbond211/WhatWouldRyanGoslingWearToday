function AppViewModel() {
    var self = this;
    this.dataLoaded = ko.observable(false);
    this.message = ko.observable("");
    this.imgSrc = ko.observable("");
    this.temperature = ko.observable(0);
    this.weatherIcon = ko.observable("");
    this.location = ko.observable("");
    this.cityName = ko.observable("");

    this.searchWeather = function() {
        $.post('/weather', {
            location: self.location,
        }, function(data) {
            self.message(data.message);
            self.imgSrc(data.imgUrl);
            self.temperature(Math.round(data.temperature));
            self.weatherIcon(getWeatherImageName(data.weatherIcon));
            self.cityName(data.cityName);
            self.dataLoaded(true);
        });
    };
};

ko.applyBindings(new AppViewModel());

function getWeatherIconName(weather) {
    var iconName;
    if (weather == "clear") {
        var hour = new Date().getHours();
        if (hour >= 7 && hour <= 20) {
            iconName = 'day-sunny';
        } else {
            iconName = 'night-clear';
        }
    } else {
        iconName = weather;
    }
    return 'wi wi-' + iconName;
};