// TODO: Correct insisible part of list || Make list smaller with smaller screens || Add checkboxes ||

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
  this.isVisible = ko.observable(true);
  this.infoOpen = ko.observable(false);
};

var ViewModel = function(map) {
  var self = this;

  self.googleMap = map;

  //Create a list of locations from the locations array
  this.locationList = ko.observableArray([]);

  locations.forEach(function(loc) {
    self.locationList.push(new Location(loc));
  });

  //Add a marker property to each location in locationList
  self.locationList().forEach(function(location) {
    location.marker = new google.maps.Marker({
      position: {
        lat: location.lat(),
        lng: location.lng()
      },
      map: self.googleMap,
      title: location.name()
    });
    //Create an infoWindow for each marker
    var infoWindow = new google.maps.InfoWindow({
      content: "<h1>" + location.name() + "</h1>"
    });
    //Add a short bounce animation and infoWindow on click on each marker


    location.toggleWindowOnClick = function() {

        //Toogle info window open (there are two conditions because on first click .getMap() doesn't return null yet)

        if (infoWindow.getMap() === null || typeof infoWindow.getMap() === "undefined") {
          location.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            location.marker.setAnimation(null)
          }, 750);

          infoWindow.open(self.googleMap, location.marker);
          self.googleMap.panTo(location.marker.getPosition());
          location.infoOpen(true);

        } else {
          infoWindow.close();
          location.infoOpen(false);
        }

      }
      //Add event listener to run infowindow function on marker click
    location.marker.addListener('click', location.toggleWindowOnClick);
    //Add event listener to infoWindo close button so that the highlight in the locations list toggles
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
      location.infoOpen(false);
    })
  });

  //Value for the search bar
  this.queryValue = ko.observable("");

  /*Function that runs each time a key is pressed in the search bar. It checks if the input
    is part of any of the locations name and filters everything else*/
  this.search = function(value) {

    for (var i = 0; i < self.locationList().length; i++) {
      if (self.locationList()[i].name().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        if (self.locationList()[i].isVisible() === false) {
          self.locationList()[i].marker.setMap(self.googleMap);
          self.locationList()[i].isVisible(true);
        }

      } else {
        self.locationList()[i].marker.setMap(null);
        self.locationList()[i].isVisible(false);
      }
    }
  }

  //Runs the search function everytime the query value changes
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

// Apply bindings with the map
$(window).load(function() {

  var googleMap = initMap();
  ko.applyBindings(new ViewModel(googleMap));

});
