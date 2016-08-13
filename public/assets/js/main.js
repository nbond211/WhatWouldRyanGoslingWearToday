function AppViewModel() {
    var self = this;
    this.message = ko.observable("");
    this.imgSrc = ko.observable("");
    this.temperature = ko.observable(0);
    this.weatherIcon = ko.observable("");
    this.dataLoaded = ko.observable(false);

    navigator.geolocation.getCurrentPosition(function(position) {
        $.post('/weather', {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }, function(data) {
            console.log(data);
            self.message(data.message);
            self.imgSrc(data.imgUrl);
            self.temperature(Math.round(data.temperature));
            self.weatherIcon(getWeatherImageName(data.weatherDescription));
            self.dataLoaded(true);
        });
    });
};

ko.applyBindings(new AppViewModel());

function getWeatherImageName(weather) {
    if (weather == "Clear") {
        var hour = new Date().getHours();
        if (hour >= 7 && hour <= 20) {
            return "/assets/img/Clear_AM.svg";
        } else {
            return "/assets/img/Clear_PM.svg";
        }
    } else {
        return "/assets/img/" + weather + ".svg";
    }
};