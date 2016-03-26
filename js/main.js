// TODO: refactor css ||| add more places ||| add foursquare info

//List of locations
var locations = [{
  name: "Café Piolho",
  lat: 41.146882,
  lng: -8.616246,
  type: ["Bar", "Restaurant"]
}, {
  name: "Galerias de Paris",
  lat: 41.147219,
  lng: -8.614290,
  type: ["Bar"]
}, {
  name: "We Love Porto",
  lat: 41.147304,
  lng: -8.614215,
  type: ["Club"]
}, {
  name: "Plano B",
  lat: 41.146512,
  lng: -8.613855,
  type: ["Club"]
}, {
  name: "Tendinha dos Clérigos",
  lat: 41.147454,
  lng: -8.613222,
  type: ["Club"]
}, {
  name: "Espaço 77",
  lat: 41.149607,
  lng: -8.615973,
  type: ["Bar", "Restaurant"]
}, {
  name: "Radio Bar",
  lat: 41.148473,
  lng: -8.612727,
  type: ["Bar", "Club"]
}, ];

$('.hasTooltip').each(function() { // Notice the .each() loop, discussed below
    $(this).qtip({
        content: {
            text: $(this).next('div'), // Use the "div" element next to this for the content
            title: "Info",
            button: "Close"
        },
        style: { classes: 'qtip-tipsy',
      width: "220" },
        hide: {
        event: false
      },
      show: {
        event: 'click mouseenter',
        ready: true,

    },
    hide: {
        event: 'unfocus',
        fixed: true,

    },
       position: {
          my: 'top right',  // Position my top left...
          at: 'bottom left',
          viewport: $(window), // at the bottom right of...
          target: $(this) // my target
      }
    });
});






// Constructor to build each location's object
var Location = function(data) {
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.isVisible = ko.observable(true);
  this.infoOpen = ko.observable(false);
  this.infoContent = "<img src='images/loading_icon.gif'></img>";
  this.type = data.type;
};

var ViewModel = function(map) {
  var self = this;
  self.googleMap = map;

// Make it so if screen is small, list starts collapsed. JS instead of CSS so that jquery's animate gets used.
  if ( $(window).width() > 739) {
    this.listIsHidden = ko.observable(false);
  }
  else {
    this.listIsHidden = ko.observable(true);

  }
  //Add funcionality to toogle the list's visibility

    this.toggleListVisible = function() {
    $(".collapsableList").animate(
      {height: "toggle"}, 200);
    self.listIsHidden(!self.listIsHidden());
  }

  //Create a list of locations from the locations array
  this.locationList = ko.observableArray([]);

  locations.forEach(function(loc) {
    self.locationList.push(new Location(loc));
  });
  self.locationList.sort(function(l, r) {
    return l.name > r.name ? 1 : -1
  });

  //Add a marker property to each location in locationList
  self.locationList().forEach(function(location) {
    location.marker = new google.maps.Marker({
      position: {
        lat: location.lat,
        lng: location.lng
      },
      map: self.googleMap,
      title: location.name
    });
    //Create an infoWindow for each marker

    //this.queryValue.subscribe(this.search);
    var infoWindow = new google.maps.InfoWindow({
      content: location.infoContent,
    });




    // Get the infoWindow html ready depending on wether the data from foursquare exists
    var getWindowHTML = function(icon, name, photo, hours, schedule, rating, url, phone, street, city, country) {

      var iconHTML = icon ? "<img width='25' class='iconHTML' src='" + icon + "'></img>" : "";
      var nameHTML = name ? "<h3 class='nameHTML'>" + name + "</h3>" : "";
      var photoHTML = photo ? "<img class='photoHTML' src='" + photo + "'>" : "";
      var ratingHTML = rating ? "<h5 class='ratingHTML'>Foursquare Rating: " + "<a href='" + url + "'target='_blank'>" + rating + "/10</a></h4>" : "<h4>Foursquare Rating: " + "<a href='" + url + "'target='_blank'>" + "-" + rating + "/10</a></h5>";
      var hoursHTML = "<h5 class='hoursHTML'>" + (hours ? hours + "<br>" : "") + (schedule ? schedule + "<br>" : "") + "</h5>";
      var addressPhoneHTML = "<p class='addressHTML'>" + (street ? street + "<br>" : "") + (city ? city + ", ": "") + (country ? country +"<br>" : "") + (phone ? phone : "") + "</p>";


      return "<div style='display: flex;'>" + photoHTML + "<div>" + iconHTML + nameHTML + ratingHTML + addressPhoneHTML + hoursHTML + "</div>" + "</div>";
    };

    location.toggleWindowOnClick = function() {
        //Toogle info window open (there are two conditions because on first click .getMap() doesn't return null yet)
        if (infoWindow.getMap() === null || typeof infoWindow.getMap() === "undefined") {
          //Add a short bounce animation and infoWindow on click on each marker
          location.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            location.marker.setAnimation(null)
          }, 750);

          infoWindow.open(self.googleMap, location.marker);
          self.googleMap.panTo(location.marker.getPosition());
          location.infoOpen(true);

          //Request info from foursquare for the clicked location only if data doesn't exist yet (loading icon playing)
          //A nested ajax request was necessary as the first returns the basic venue info including its ID and the second returns its details using the ID
          if (location.infoContent === "<img src='images/loading_icon.gif'></img>") {
            $.ajax({
              url: "https://api.foursquare.com/v2/venues/search?client_id=CHNBXXBO4XIC24AAH3JY3ZI4A1G0WBM24U3SEVDIKAFWKFDR&client_secret=FKC5XJA0JJVKFCQNEDABMH1GWSVPOES2GE0PVEVIQK4XK43X&v=20130815&limit=1&ll=" + location.lat + "," + location.lng + "&query=" + location.name,
              cache: true,
              dataType: 'json',
              success: function(searchResult) {
                $.ajax({
                  url: "https://api.foursquare.com/v2/venues/" + searchResult.response.venues[0].id + "?client_id=CHNBXXBO4XIC24AAH3JY3ZI4A1G0WBM24U3SEVDIKAFWKFDR&client_secret=FKC5XJA0JJVKFCQNEDABMH1GWSVPOES2GE0PVEVIQK4XK43X&v=20130815",
                  cache: true,
                  dataType: 'json',
                  success: function(venueData) {

                    var venueIcon = "";
                    var venueName = "";
                    var venuePhoto = "";
                    var venueHours = "";
                    var venueSchedule = "";
                    var venueRating = "";
                    var venueUrl = "";
                    var venuePhone = "";
                    var venueStreet = "";
                    var venueCity = "";
                    var venueCountry = "";
                    //test each property to avoid unexisting properties
                    if (venueData.response.venue.categories[0].icon.prefix) {
                      venueIcon = venueData.response.venue.categories[0].icon.prefix + "bg_32" + venueData.response.venue.categories[0].icon.suffix;
                    }
                    if (venueData.response.venue.name) {
                      venueName = venueData.response.venue.name;
                    }
                    if (venueData.response.venue.bestPhoto) {
                      venuePhoto = venueData.response.venue.bestPhoto.prefix + "300x200" + venueData.response.venue.bestPhoto.suffix;
                    }
                    if (venueData.response.venue.hours) {
                      venueHours = venueData.response.venue.hours.status;
                    }
                    if (venueData.response.venue.hours) {
                      venueSchedule = venueData.response.venue.hours.timeframes[0].days + " - " + venueData.response.venue.hours.timeframes[0].open[0].renderedTime;
                    }
                    if (venueData.response.venue.rating) {
                      venueRating = venueData.response.venue.rating;
                    }
                    if (venueData.response.venue.canonicalUrl) {
                      venueUrl = venueData.response.venue.canonicalUrl;
                    }
                    if (venueData.response.venue.contact.formattedPhone) {
                      venuePhone = venueData.response.venue.contact.formattedPhone;
                    }
                    if (venueData.response.venue.location.formattedAddress[0]) {
                      venueStreet = venueData.response.venue.location.formattedAddress[0];
                    }
                    if (venueData.response.venue.location.formattedAddress[1]) {
                      venueCity = venueData.response.venue.location.formattedAddress[1];
                    }
                    if (venueData.response.venue.location.formattedAddress[2]) {
                      venueCountry = venueData.response.venue.location.formattedAddress[2];
                    }

                    location.infoContent = getWindowHTML(venueIcon, venueName, venuePhoto, venueHours, venueSchedule, venueRating, venueUrl, venuePhone, venueStreet, venueCity, venueCountry);
                    infoWindow.setContent(location.infoContent);
                  },
                  error: function() {
                    location.infoContent("<h2>" + location.name() + "</h2>" + "<h3>Unable to retrieve info from Foursquare.</h3>");
                  }
                });
              },
              error: function() {
                location.infoContent("<h2>" + location.name() + "</h2>" + "<h3>Unable to retrieve info from Foursquare.</h3>");
              }
            });
          }
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
  this.barShow = ko.observable(true);
  this.clubShow = ko.observable(true);
  this.restaurantShow = ko.observable(true);

  /*Function that runs each time a key is pressed in the search bar. It checks if the input
    is part of any of the locations name and filters everything else*/

  this.filter = function() {
    // Here the value parameter that gets passed into the function will adopt either the input value or true/false depending on the filter mode.
    // Because of that, we don't end up using it, and fetch the actual values instead.

    var filteredName = $(".search").val();

    for (var i = 0; i < self.locationList().length; i++) {
      var filterByTypeBar = self.locationList()[i].type.indexOf("Bar") >= 0 && self.barShow();
      var filterByTypeClub = self.locationList()[i].type.indexOf("Club") >= 0 && self.clubShow();
      var filterByTypeRestaurant = self.locationList()[i].type.indexOf("Restaurant") >= 0 && self.restaurantShow();
      var filterByName = self.locationList()[i].name.toLowerCase().indexOf(filteredName.toLowerCase()) >= 0;

      //console.log(filterByTypeRestaurant);
      if (filterByName && (filterByTypeBar || filterByTypeClub || filterByTypeRestaurant) ) {
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
  this.queryValue.subscribe(this.filter);
  this.barShow.subscribe(this.filter);
  this.clubShow.subscribe(this.filter);
  this.restaurantShow.subscribe(this.filter);



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
