//global variables
var map, geojson, switchMap ={}, bounds, districtLayer;


//map Layers
var pushPinMarker, vectorBasemap, streetsBasemap, MinnesotaBoundaryLayer;

//map overlay layers... called like overlayLayers.CongressionalBoundaryLayer
var overlayLayers ={};

//google geocoder
var geocoder = null;

//Set initial basemap with initialize() - called in helper.js
function initialize(){
	$("#map").height('544px');
	var southWest = new mapboxgl.LngLat( -105.7140625, 41.86956),
        northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
    //bounds = new mapboxgl.LngLatBounds(southWest, northEast);
    bounds = new mapboxgl.LngLatBounds();

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaW01MGpwdDcwMWppdWZtNnoxc3pidjZhIn0.0D2UtVeOtsJFaHr8761_JQ';
	map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/mapbox/emerald-v8',
		center: [-93.6678,46.1706],
		//maxBounds:bounds,		
		zoom: 5
	});


    geocoder = new google.maps.Geocoder;
}
// 	vectorBasemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g', {
// 					maxZoom: 18,
// 					minZoom: 6,
// 					 zIndex: 1,
// 					attribution: 'Basemap data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
// 						'Legislative data &copy; <a href="http://www.gis.leg.mn/">LCC-GIS</a>, ' +
// 						'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
// 					id: 'mapbox.streets'
// 					}).addTo(map);

// 	streetsBasemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g', {
// 					maxZoom: 18,
// 					minZoom: 6,
// 					 zIndex: 1,
// 					attribution: 'Basemap data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
// 						'Legislative data &copy; <a href="http://www.gis.leg.mn/">LCC-GIS</a>, ' +
// 						'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
// 					id: 'mapbox.streets-satellite'
// 					})

// 	toggleBaseLayers($('#satellitonoffswitch'),vectorBasemap,streetsBasemap);
// };

// //toggle basemap layers
// function toggleBaseLayers(el, layer1, layer2){
// 	//console.log(el, 'has been toggled');
// 	if (el.is(':checked')){
// 		map.removeLayer(layer2);
// 		map.addLayer(layer1);
// 	} else {
// 		map.removeLayer(layer1);
// 		map.addLayer(layer2);
// 	}
// }

// //fetch the overlay layers from WMS, published through FOSS mapserver (mapserver.org) - much faster than fetching large vector datasets through PGIS
// function getOverlayLayers(el, switchId){
//     $('#loading').show();

//     switchMap = {"countyonoffswitch": "cty2010", "cityonoffswitch":"mcd2015", "cononoffswitch":"cng2012", "ssonoffswitch":"sen2012_vtd2015", "shonoffswitch":"hse2012_vtd2015"}
//     // console.log(typeof switchMap[switchId]);
   
//     if(el.is(':checked')){
//     	map.removeLayer(overlayLayers[switchMap[switchId]]);
//         $('.leaflet-marker-icon.'+switchMap[switchId]).hide();
// 		$('#loading').hide();
//     } else {
//     	$('.leaflet-marker-icon.'+switchMap[switchId]).show();

//     	if(typeof overlayLayers[switchMap[switchId]] === 'undefined'){
//     		overlayLayers[switchMap[switchId]] = L.tileLayer.wms('http://www.gis.leg.mn/cgi-bin/mapserv?map=/web/gis/OpenLayers/districts/data/mapserver.map', {
// 			    format: 'image/png',
// 			    transparent: false,
// 			    minZoom: 6,
// 			    zIndex: 3,
//                 crs:L.CRS.EPSG4326,
// 			    layers: switchMap[switchId]
// 			}).addTo(map);
// 			$('#loading').hide();
// 		} else {
// 			overlayLayers[switchMap[switchId]].addTo(map);
// 			$('#loading').hide();
// 		}
//     }
// }

// function geoCodeAddress(geocoder, resultsMap) {
//   var address = document.getElementById('geocodeAddress').value;
//   $("#loading").show();
//   geocoder.geocode({'address': address}, function(results, status) {
//     if (status === google.maps.GeocoderStatus.OK) {
//       var precision = results[0].geometry.location_type;
//       var components = results[0].address_components;
//       var pos = {
//         latlng: {lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()},
//         lat:results[0].geometry.location.lat(),
//         lng:results[0].geometry.location.lng()
//       };
//       // console.log(pos.lat);
//       // console.log(pos.lng);
//       map.setView(L.latLng(pos.lat,pos.lng),16);
//       addMarker(pos);
//       identifyDistrict(pos);
//       geocodeFeedback(precision, components);
//     } else {
//       alert('Geocode was not successful for the following reason: ' + status);
//       $('#loading').hide();
//     }
//   });
// }

// function geocodeFeedback(precision, components){
// 	//console.log(precision, 'location, center of ', components[0].types[0]);
// 	var message = "";
// 	var componentMap = {"street_number": "street", "postal_code": "zip code", "administrative_area_level_1": "state", "locality": "city", "administrative_area_level_2": "county", "route": "route", "intersection": "intersection", "political": "political division", "country": "country","administrative_area_level_3": "minor civil division", "administrative_area_level_4": 'minor civil division', "administrative_area_level_5": "minor civil division", "colloquial_area": "country", "neighborhood": "neighborhood", "premise": "building", "subpremise": "building", "natural_feature": "natural feature", "airport": "airport", "park": "park", "point_of_interest": "point of interest"};

// 	if (precision == "ROOFTOP"){
// 		message = "Address match!";
// 		$('#geocodeFeedback').html(message).css('color', 'green');
// 		$('#geocodeFeedback').show();
// 	} else {
// 		message = "Approximate location! Center of " + componentMap[components[0].types[0]];
// 		$('#geocodeFeedback').html(message).css('color', 'red');
// 		$('#geocodeFeedback').show();
// 	}
// 	slideSidebar();
	
// }

// //submit search text box - removed button for formatting space
// function keypressInBox(e) {
//     var code = (e.keyCode ? e.keyCode : e.which);
//     if (code == 13) { //Enter keycode                        
//         e.preventDefault();
//         dataLayer.push({'event': 'enterKeyGeocode'});
//         geoCodeAddress(geocoder, map);
//     }
// };

// //fetch location data from postgres on mouseclick/geocode submition
function identifyDistrict(d){
	// console.log(d.latlng); 
	var data = {
		lat: d.lngLat.lat,
		lng: d.lngLat.lng 
	};
    $("#loading").show();
	$.ajax("php/getPointData.php", {
		 data: data,
		success: function(result){			
			addMemberData(result);
		}, 
		error: function(){
			console.log('error');
		}
	});
}

//sidebar member data
function addMemberData(memberData){
	// memberData.features[0] = MN House
	// memberData.features[1] = MN Senate
	// memberData.features[2] = US House
	if (typeof memberData.features[0] !== "undefined"){
	    $('#mask').hide();
	    geojson = memberData;
		//also show hyperlinks here
	    $('.memberLink').show();
	    //add memberdata from map selection to member list
	    //ALTERNATIVE SOLUTION! Use house/senate image server: http://www.house.leg.state.mn.us/hinfo/memberimgls89/ -- but then you have issue of large image sizes, slow performance
	    $('#housephoto').attr('src', 'images/House/tn_'+memberData.features[0].properties.district+'.jpg').attr('width','auto').attr('height','auto');
		$('#housemember').html(memberData.features[0].properties.name + '<span class="party"> ('+memberData.features[0].properties.party+')</span>').delay("slow").fadeIn();
		$('#housedistrict').html('MN House - ' + memberData.features[0].properties.district).delay("slow").fadeIn();
		$('.mnhouse').attr('data-webid', 'http://www.house.leg.state.mn.us/members/members.asp?id='+ memberData.features[0].properties.memid);
		
		$('#senatephoto').attr('src', 'images/Senate/'+memberData.features[1].properties.district+'.jpg').attr('width','auto').attr('height','auto');
		$('#senatemember').html(memberData.features[1].properties.name + '<span class="party">  ('+memberData.features[1].properties.party+')</span>');
		$('#senatedistrict').html('MN Senate - ' + memberData.features[1].properties.district);
		$('.mnsenate').attr('data-webid', 'http://www.senate.leg.state.mn.us/members/member_bio.php?leg_id='+ memberData.features[1].properties.memid);
		
		$('#ushousephoto').attr('src', 'images/USHouse/US'+memberData.features[2].properties.district+'.jpg').attr('width','auto').attr('height','auto');
		$('#ushousemember').html(memberData.features[2].properties.name + ' <span class="party"> ('+memberData.features[2].properties.party+')</span>');
		$('#ushousedistrict').html('U.S. House - ' + memberData.features[2].properties.district);
		var lastname = memberData.features[2].properties.name.split(" ")[1];
		$('.ushouse').attr('data-webid', 'http://'+ lastname +'.house.gov/');
		
		$('#ussenatephoto').attr('src', 'images/USSenate/USsenate1.jpg').attr('width','auto').attr('height','auto');
		$('#ussenatemember').html('Amy Klobuchar <span class="party"> (DFL)</span>');
		$('#ussenatedistrict').html('U.S. Senate' );
		$('.ussenate1').attr('data-webid', 'http://www.klobuchar.senate.gov/');
		
		$('#ussenatephoto2').attr('src', 'images/USSenate/USsenate2.jpg').attr('width','auto').attr('height','auto');
		$('#ussenatemember2').html('Al Franken <span class="party"> (DFL)</span>');
		$('#ussenatedistrict2').html('U.S. Senate');
		$('.ussenate2').attr('data-webid', 'http://www.franken.senate.gov/');
		$("#loading").hide();
	} else { 
		$('#mask').show();
		$('#loading').hide();
	}	
}

function addMarker(e){
	//console.log([e.lngLat.lng, e.lngLat.lat]);
    var mapclick = new mapboxgl.LngLat(e.lngLat.lng, e.lngLat.lat);
	//remove sidebar formatting
	$(".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).removeClass('active');
	$('.memberLink').hide();
	$('#housemember, #senatemember, #ushousemember, #ussenatemember, #ussenatemember2').html('');
    $('#housedistrict, #senatedistrict, #ushousedistrict, #ussenatedistrict, #ussenatedistrict2').html('');
    $('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').removeAttr('src');

    //remove old pushpin and previous selected district layers 
	if (typeof map.getSource('pointclick') !== "undefined" ){ 
		console.log('remove previous marker');
		map.removeSource('pointclick');		
	}
	if (typeof map.getLayer('mapDistrictsLayer') !== "undefined" ){ 		
		map.removeLayer('mapDistrictsLayer')
		map.removeSource('district');	
	}
	//add marker
	 map.addSource("pointclick", {
  		"type": "geojson",
  		"data": {
    		"type": "Feature",
    		"geometry": {
      			"type": "Point",
      			"coordinates": [e.lngLat.lng, e.lngLat.lat]
    		},
    		"properties": {
      			"title": "Mapbox DC",
      			"marker-symbol": "monument"
    		}
  		}
	});

    map.addLayer({
        "id": "pointclick",
        type: 'symbol',
        source: 'pointclick',
        "layout": {
        	"icon-image": "{marker-symbol}-15",
            "icon-allow-overlap": true
        },
        "paint": {}
    });
}

// //Show the district on the map
function showDistrict(div){
	slideSidebar();
	$("#loading").show();

	//div is the class name of the active member
	divmap = {"mnhouse active":0, "mnsenate active":1, "ushouse active":2};

	//remove preveious district layers.
	if (typeof map.getLayer('mapDistrictsLayer') !== "undefined" ){ 		
		map.removeLayer('mapDistrictsLayer')
		map.removeSource('district');	
	}
    
    //polygon overlay styling
	var myStyle = {
    	"color": "#991a36",
    	"weight": 2,
    	"opacity": 0.65
	};
	
	districtLayer = geojson.features[divmap[div]];

    console.log(districtLayer);
     map.addSource("district", {
        "type": "geojson",
        "data": districtLayer
    });
	//.addTo(map);
	map.addLayer({
        'id': 'mapDistrictsLayer',
        'type': 'fill',
        'source': 'district',
        'layout': {},
        'paint': {
            'fill-color': '#991a36',
            'fill-opacity': 0.65
        }
	});    
    
	//zoom to selection
	map.fitBounds(geojsonExtent(districtLayer), {padding:'100'});

	$("#loading").hide();
}

// function showSenateDistrict(div){
// 	slideSidebar();
//     $("#loading").show();

// 	//remove preveious district layers.
// 	if (typeof mapDistrictsLayer !== "undefined" ){ 
// 		map.removeLayer(mapDistrictsLayer);			
// 	}
    
//     mapDistrictsLayer = MinnesotaBoundaryLayer.addTo(map);
// 	map.fitBounds(mapDistrictsLayer.getBounds());
// 	$("#loading").hide();
// }

function slideSidebar(){
	if ($('#sidebar').hasClass('animate')){
			$('#sidebar').removeClass('animate');
			try{
			   $('#sidebar').animate({ 'left': '-100%' }, 500, 'easeOutQuad');
			}
			catch(err){}
		} else {
			try{
			    $('#sidebar').addClass('animate');
			    $('#sidebar').animate({ 'left': '0px' }, 500, 'easeInQuad');
		    } catch(err){}} // Firebug throws a typeerror here - it doesn't break the app, 'easeInQuad' needs jQuery UI, but it forces the animation in desktop app... just ignore
}

// function zoomToGPSLocation() {
// // Try HTML5 geolocation.
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = {
//         latlng: {lat:position.coords.latitude,lng:position.coords.longitude},
//         lat:position.coords.latitude,
//         lng:position.coords.longitude
//       };

//       addMarker(pos);
// 	  identifyDistrict(pos);
// 	  map.setView(L.latLng(pos.lat, pos.lng),13);

//     });
//   } else {
//     // Browser doesn't support Geolocation
//     handleLocationError(false, infoWindow, map.getCenter());
//   }
// }
// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//  alert('Geocode was not successful - Your browser does not support Geolocation');
//       $('#loading').hide();

// }

// function toggleLayerSwitches (){
//     var inputs = $(".onoffswitch-checkbox");
//     for (var i = 0, il = inputs.length; i < il; i++) {
//     	var inputsID = '#'+ inputs[i].id;
//         if($(inputsID).not(':checked')){
//         	$(inputsID).prop('checked', true);
//         }         
//     }	
// }
