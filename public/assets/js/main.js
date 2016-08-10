$(document).ready(function () {
    $('#test').click(test);
});

function test() {
    navigator.geolocation.getCurrentPosition(function (position) {
        sendTestRequest(position.coords.latitude, position.coords.longitude);
    });
}

function sendTestRequest(lat, lon) {
    $.post('/weather', {lat: lat, lon: lon}, function(data){
        console.log(data);
    });
}