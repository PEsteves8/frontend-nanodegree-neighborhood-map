// The locations data is in a separate file in "data/locations.js"

// Simple solution for normalizing accents when using the filter
String.prototype.removeAccents = function(){
    var t = this,
    a = {
        '[ÀÁÂÃÄÅĀĂǍẠẢẤẦẨẪẬẮẰẲẴẶǺĄ]' : 'A',
        '[àáâãäåāăǎạảấầẩẫậắằẳẵặǻą]' : 'a',
        '[ÇĆĈĊČ]' : 'C',
        '[çćĉċč]' : 'c',
        '[ÈÉÊËĒĔĖĘĚẸẺẼẾỀỂỄỆ]' : 'E',
        '[èéêëēĕėęěẹẻẽếềểễệ]' : 'e',
        '[ÌÍÎÏĨĪĬĮİǏỈỊ]' : 'I',
        '[ìíîïĩīĭįıǐỉị]' : 'i',
        '[ÒÓÔÕÖØŌŎŐƠǑǾỌỎỐỒỔỖỘỚỜỞỠỢ]' : 'O',
        '[òóôõöøōŏőơǒǿọỏốồổỗộớờởỡợð]' : 'o',
        '[ÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛỤỦỨỪỬỮỰ]' : 'U',
        '[ùúûüũūŭůűųưǔǖǘǚǜụủứừửữự]' : 'u',
    };
    for(var i in a){
        t = t.replace(new RegExp(i, "g"), a[i]);
    }
    return t;
};

// Code for the tooltip creation using the qTip2 library
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

// The loading icon to be used while waiting for the AJAX requests
var loadingIcon =  "<div class='uil-ring-css' style='transform:scale(0.41);'><div>";

// Constructor to build each location's object
var Location = function(data) {
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.isVisible = ko.observable(true);
  this.infoOpen = ko.observable(false);
  this.infoContent = loadingIcon;
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
    $(".collapsable").animate(
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
          if (location.infoContent === loadingIcon) {
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
                    var venue = {
                      icon : "",
                      name : "",
                      photo : "",
                      hours : "",
                      schedule : "",
                      rating : "",
                      comments : [],
                      url : "",
                      phone : "",
                      street : "",
                      city : "",
                      country : ""
                    };

                    //test each property to avoid unexisting properties
                    if (venueData.response.venue.categories[0].icon.prefix) {
                      venue.icon = venueData.response.venue.categories[0].icon.prefix + "bg_32" + venueData.response.venue.categories[0].icon.suffix;
                    }
                    if (venueData.response.venue.name) {
                      venue.name = venueData.response.venue.name;
                    }
                    if (venueData.response.venue.bestPhoto) {
                      venue.photo = venueData.response.venue.bestPhoto.prefix + "300x200" + venueData.response.venue.bestPhoto.suffix;
                    }
                    if (venueData.response.venue.hours) {
                      venue.hours = venueData.response.venue.hours.status;
                    }
                    if (venueData.response.venue.hours) {
                      venue.schedule = venueData.response.venue.hours.timeframes[0].days + " - " + venueData.response.venue.hours.timeframes[0].open[0].renderedTime;
                    }
                    if (venueData.response.venue.rating) {
                      venue.rating = venueData.response.venue.rating;
                    }

                    if (venueData.response.venue.phrases) {
                      venueData.response.venue.phrases.forEach(function(phrasesData) {
                        venue.comments.push(phrasesData.sample.text);
                      });
                    }

                    if (venueData.response.venue.canonicalUrl) {
                      venue.url = venueData.response.venue.canonicalUrl;
                    }
                    if (venueData.response.venue.contact.formattedPhone) {
                      venue.phone = venueData.response.venue.contact.formattedPhone;
                    }
                    if (venueData.response.venue.location.formattedAddress[0]) {
                      venue.street = venueData.response.venue.location.formattedAddress[0];
                    }
                    if (venueData.response.venue.location.formattedAddress[1]) {
                      venue.city = venueData.response.venue.location.formattedAddress[1];
                    }
                   if (venueData.response.venue.location.formattedAddress[2]) {
                      venue.country = venueData.response.venue.location.formattedAddress[2];
                    }

                    var iwtemplate = $('#infoWindowTpl').html();
                    var iwHTML = Mustache.to_html(iwtemplate, venue);
                    infoWindow.setContent(iwHTML);
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
      });
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
      var filterByName = self.locationList()[i].name.toLowerCase().removeAccents().indexOf(filteredName.toLowerCase()) >= 0;

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
    mapTypeControl: false,
    zoom: 17,
    scrollwheel: true
  })

}

// Apply bindings with the map
$(window).load(function() {
  var googleMap = initMap();
  ko.applyBindings(new ViewModel(googleMap));
});

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
  type: ["Bar"]
}, {
  name: "Taskinha do Alex",
  lat: 41.151329,
  lng: -8.613903,
  type: ["Bar", "Restaurant"]
}, {
  name: "Á Grande e à Francesa",
  lat: 41.146955,
  lng: -8.616548,
  type: ["Bar", "Restaurant"]
}, {
  name: "RendezVous Bar",
  lat: 41.147085,
  lng: -8.614045,
  type: ["Bar"]
}, {
  name: "MaoMaria",
  lat: 41.147008,
  lng: -8.613821,
  type: ["Bar"]
}, {
  name: "The Gin Club",
  lat: 41.146890,
  lng: -8.613869,
  type: ["Bar"]
}, {
  name: "Confeitaria Tamisa",
  lat: 41.148347,
  lng: -8.612828,
  type: ["Food"]
}, {
  name: "Casa do Livro",
  lat: 41.147408,
  lng: -8.614355,
  type: ["Bar"]
}, {
  name: "Destilaria",
  lat: 41.147402,
  lng: -8.613844,
  type: ["Bar"]
}, {
  name: "MoreClub",
  lat: 41.147230,
  lng: -8.614256,
  type: ["Club"]
}, {
  name: "The Wall",
  lat: 41.147078,
  lng: -8.613828,
  type: ["Bar"]
}, {
  name: "Boulevard",
  lat: 41.147452,
  lng: -8.610863,
  type: ["Club"]
}, {
  name: "Villa Porto",
  lat: 41.147602,
  lng: -8.610070,
  type: ["Club"]
}, {
  name: "Pitch Club",
  lat: 41.147203,
  lng: -8.608140,
  type: ["Club"]
}, {
  name: "Bar Baixa",
  lat: 41.146742,
  lng: -8.613894,
  type: ["Bar"]
}, {
  name: "Café Candelabro",
  lat: 41.149952,
  lng: -8.613048,
  type: ["Bar", "Food"]
}, {
  name: "Armazém do Chá",
  lat: 41.149500,
  lng:-8.614054,
  type: ["Bar", "Club"]
}, {
  name: "Costa Coffee",
  lat: 41.145940,
  lng: -8.614749,
  type: ["Restaurant"]
}, {
  name: "Adega Leonor",
  lat: 41.146409,
  lng: -8.616800,
  type: ["Bar"]
}, {
  name: "Baixaria",
  lat: 41.148307,
  lng: -8.612094,
  type: ["Bar"]
}, {
  name: "Pausa Bar",
  lat: 41.148638,
  lng: -8.614260,
  type: ["Bar"]
}, ];
