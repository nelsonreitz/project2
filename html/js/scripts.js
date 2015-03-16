// San Francisco coordinates
var sfCoords = new google.maps.LatLng(37.7489, -122.4355);

// global variables
var map;
var infowindow;
var overlays = [];

$(document).ready(function() {

    // create new Map
    var mapOptions = {
        center: sfCoords,
        zoom: 11,
        styles: [
            {
                stylers: [
                    { visibility: "simplified" },
                    { saturation: -100 }
                ]
            },
            {
                featureType: "water",
                elementType: "all",
                stylers: [
                    { hue: "#005eff" },
                    { saturation: 67 }
                ]
            }
        ]
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    $("#route_form").submit(function() {

        // clear overlays (http://apitricks.blogspot.ch/2010/02/clearoverlays-in-v3.html)
        while (overlays[0]) {
            overlays.pop().setMap(null);
        }

        var routeNumber = $("#route_select").val();

        // query route infos via Ajax
        $.ajax({
            url: "route.php",
            data: {
                route_number: routeNumber
            },
            success: function(route) {

                $.each(route.config, function(index, station){
                    addMarker(station);
                });
                addPolyline(route);
            }
        });

        return false;
    });
});

/**
 * Adds a Marker and corresponding InfoWindow.
 */
function addMarker(station) {

    // create new Marker at station location
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(station.latitude, station.longitude),
        map: map,
        title: station.name
    });

    // push Marker in overlays array
    overlays.push(marker);

    // create new InfoWindow on click on marker
    google.maps.event.addListener(marker, "click", function() {

        // close opened InfoWindows
        if (infowindow) {
            infowindow.close();
        }

        // query estimate departure time via Ajax
        $.ajax({
            url: "schedule.php",
            data: {
                station_abbr: station.abbr
            },
            success: function(schedule) {

                // create new InfoWindow
                infowindow = new google.maps.InfoWindow({
                    content: schedule
                });

                infowindow.open(map, marker);
            }
        });
    });
}

/**
 * Adds a Polyline to the map.
 */
function addPolyline(route) {

    // build an array of route config coordinates
    var routeCoords = [];
    $.each(route.config, function(index, station){
        routeCoords.push(new google.maps.LatLng(station.latitude, station.longitude));
    });

    // create new Polyline
    var polyline = new google.maps.Polyline({
        path: routeCoords,
        strokeColor: route.color,
    });

    // push Polyline to overlays array
    overlays.push(polyline);

    polyline.setMap(map);
}
