//List of locations
var locations = [{
  name: "Café Piolho",
  lat: 41.146882,
  lng: -8.616246
}, {
  name: "Galeria de Paris",
  lat: 41.147219,
  lng: -8.614290
}, {
  name: "We Love Porto",
  lat: 41.147304,
  lng: -8.614215
}, {
  name: "Plano B",
  lat: 41.146512,
  lng: -8.613855
}, {
  name: "Tendinha dos Clérigos",
  lat: 41.147454,
  lng: -8.613222
}, {
  name: "Espaço 77",
  lat: 41.149607,
  lng: -8.615973
}, {
  name: "Radio Bar",
  lat: 41.148473,
  lng: -8.612727
}, ];

// Constructor to build each location's object
var Location = function(data) {
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
};

var ViewModel = function() {
  var self = this;

  this.locationList = ko.observableArray([]);

  locations.forEach(function(location) {
    self.locationList.push(new Location(location));
  });
//console.log(this.locationList()[1].name());
}

var mapVM = new ViewModel();
ko.applyBindings(mapVM);


//Google Map centered around Porto's downtown (Portugal)
function initMap() {
  var baixa = new google.maps.LatLng(41.147273, -8.614370);

  var map = new google.maps.Map(document.getElementById('map'), {
    center: baixa,
    zoom: 17,
    scrollwheel: true
  });

  for (var i = 0; i < mapVM.locationList().length; i++) {
    console.log(mapVM.locationList()[i].name());

    var marker = new google.maps.Marker({
      map: map,
      position: {
        lat: mapVM.locationList()[i].lat(),
        lng: mapVM.locationList()[i].lng()
      },
      title: mapVM.locationList()[i].name()
    });

  }
};
