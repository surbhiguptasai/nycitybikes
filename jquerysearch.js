var myURL="https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
var stationResultUrl="https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
var stationId=0;
var stations=[];
var stationsMap;
var stationResults=[];
var stationResultsMap;


function getDataFromApi(callback) {
  $.ajaxSetup({
  crossOrigin: true
});

  var query = {
  }
  $.getJSON(myURL, query, callback);
}

function displayStationData(results) {
  var resultElement = '';
  stations=results.data.stations;
  stationsMap = new Map(stations.map((station) => [station.station_id, station]));
//   for (var [key, value] of stationsMap) {
//   console.log(key + ' = ' + value.name);
// }
//   alert("Station Map "+stationsMap.get("72").name);
  if (results.data.stations) {

   results.data.stations.forEach(function(station) {
      resultElement+="<option value='"+station.station_id+"'>"+station.name+"</option>";
    });
  }
  $('.stationList').html(resultElement);
}


function getStationResultFromApi(callback)
{

 var query = {

  }
  $.getJSON(stationResultUrl, query, callback);
}
function displayStationResults(results)
{
  stationResults=results.data.stations;
  stationResultsMap= new Map(stationResults.map((stationResult) => [stationResult.station_id, stationResult]));
//     for (var [key, value] of stationResultsMap) {
//   console.log(key + ' = ' + value.num_bikes_available);
// }
// //   alert("Station Map "+stationsMap.get("72").name);
}

function showStationResults(){
        var stationDetails=stationsMap.get(stationId);
        var stationResult=stationResultsMap.get(stationId);
        var displayResultHtml="<h2>Station Selected: "+stationDetails.name+"</h2>";
        displayResultHtml+="<br>";
        displayResultHtml+="<p>Total Number of bikes available:  "+stationResult.num_bikes_available+"</p>";
        displayResultHtml+="<br>";
        displayResultHtml+="<p>Total Number of Docks available:  "+stationResult.num_docks_available+"</p>";
        $(".js-search-results").html(displayResultHtml);
     
}

function userSubmit() {
  getDataFromApi( displayStationData);
  getStationResultFromApi(displayStationResults);

  $('.stationList').change(function(){
    stationId=$(this).val();
    showStationResults();
    var latitude=stationsMap.get(stationId).lat;
    var longitude=stationsMap.get(stationId).lon;
    createMap(latitude,longitude);
    //geolocationSuccess(latitude,longitude);
     
});

}

// This function will iterate over markersData array
// creating markers with createMarker function
function displayMarkers(){

   // this variable sets the map bounds and zoom level according to markers position
   var bounds = new google.maps.LatLngBounds();
 

   // For loop that runs through the info on markersData making it possible to createMarker function to create the markers
   for (var i = 0; i < stations.length; i++){


      var latlng = new google.maps.LatLng(stations[i].lat, stations[i].lon);
      var stationId = stations[i].station_id;
      var name = stations[i].name;
      var numBikesAvailable = stationResultsMap.get(stationId).num_bikes_available;
      var numDocksAvailable = stationResultsMap.get(stationId).num_docks_available;
      var label=numBikesAvailable+"";

      createMarker(latlng, name, numBikesAvailable, numDocksAvailable,label);

      // Marker’s Lat. and Lng. values are added to bounds variable
      bounds.extend(latlng); 
   }

   // Finally the bounds variable is used to set the map bounds
   // with API’s fitBounds() function
   map.fitBounds(bounds);
}

// This function creates each marker and sets their Info Window content
function createMarker(latlng, name, numBikesAvailable, numDocksAvailable,label){
    // var pinColor = "FE7569";
    // var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    //     new google.maps.Size(21, 34),
    //     new google.maps.Point(0,0),
    //     new google.maps.Point(10, 34));

   var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      label:label,
      title: name
   });

   // This event expects a click on a marker
   // When this event is fired the infowindow content is created
   // and the infowindow is opened
   google.maps.event.addListener(marker, 'click', function() {
      
      // Variable to define the HTML content to be inserted in the infowindow
      var iwContent = '<div id="iw_container">' +
      '<div class="iw_title">' + name + '</div>' +
      '<div class="iw_content"> Bikes:' + numBikesAvailable + '<br />' +"Docks:"+
      numDocksAvailable + '</div></div>';
      
      // including content to the infowindow
      infoWindow.setContent(iwContent);

      // opening the infowindow in the current map and at the current marker location
      infoWindow.open(map, marker);
   });
}

function createMap(latitude,longitude) {
   var mapOptions = {
      center: new google.maps.LatLng(latitude,longitude),
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
   };

   map = new google.maps.Map(document.getElementById('map'), mapOptions);

   // a new Info Window is created
   infoWindow = new google.maps.InfoWindow();

   // Event that closes the InfoWindow with a click on the map
   google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
   });

   // Finally displayMarkers() function is called to begin the markers creation
   displayMarkers();
}

function geolocationSuccess(latitude,longitude) {
        var userLatLng = new google.maps.LatLng(latitude, longitude);
        var label1=stationResultsMap.get(stationId).num_bikes_available+"";
        // Write the formatted address
        // writeAddressName(userLatLng);

        var myOptions = {
          zoom : 16,
          center : userLatLng,
          mapTypeId : google.maps.MapTypeId.ROADMAP
        };
        // Draw the map
        var mapObject = new google.maps.Map(document.getElementById("map"), myOptions);
        // Place the marker
        new google.maps.Marker({
          map: mapObject,
          label:label1,
          position: userLatLng
        });
        // Draw a circle around the user position to have an idea of the current localization accuracy
        var circle = new google.maps.Circle({
          center: userLatLng,
          map: mapObject,
          fillColor: '#0000FF',
          fillOpacity: 0.5,
          strokeColor: '#0000FF',
          strokeOpacity: 1.0
        });
        mapObject.fitBounds(circle.getBounds());
      }

$(function(){
	userSubmit();
});