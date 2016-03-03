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

var ViewModel = function(map) {
  var self = this;
  var markers = [];
  self.googleMap = map;

  this.locationList = ko.observableArray([]);

  locations.forEach(function(loc) {
    self.locationList.push(new Location(loc));
  });


  self.locationList().forEach(function(location) {
    location.marker = new google.maps.Marker({
      position: {
        lat: location.lat(),
        lng: location.lng()
      },
      map: self.googleMap,
      title: location.name()
    });
  })


  this.removeMarkers = function() {
    self.locationList().forEach(function(location) {
      location.marker.setMap(null);
    })
  }



  console.log(self.locationList()[0].marker);

  this.queryValue = ko.observable("");

  this.search = function(value) {

    for (var i = 0; i < locations.length; i++) {
      if (locations[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        if (self.locationList()[i].marker.map === null) {
          self.locationList()[i].marker.setMap(self.googleMap);
          self.locationList()[i].name(locations[i].name);
        }

      } else {
        self.locationList()[i].marker.setMap(null);
        self.locationList()[i].name(null);
      }
    }

  }


  this.queryValue.subscribe(this.search);

}


//Google Map centered around Porto's downtown (Portugal)

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(41.147273, -8.614370),
    zoom: 17,
    scrollwheel: true
  })

};

$(window).load(function() {

  var googleMap = initMap();
  ko.applyBindings(new ViewModel(googleMap));

});
