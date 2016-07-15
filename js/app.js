//global variables
var map, geojson, bounds, southWest, northEast;

//map Layers
var districtLayer, queryLayer, MinnesotaBoundaryLayer;

//map overlay layers... used in getOverlayLayers() and removeLayers('all')
var overlayLayers =['hse2012-vtd2015-symbols','hse2012-vtd2015-line','hse2012-vtd2015-polygon',
                    'sen2012-vtd2015-symbols','sen2012-vtd2015-line', 'sen2012-vtd2015-symbols',
                    'cng2012-symbols', 'cng2012'];

//switch map to toggle overlay layers in getOvelayLayers()
var switchMap = {
	"countyonoffswitch": "cty2010", 
	"cityonoffswitch":"mcd2015", 
    "cononoffswitch":['cng2012-symbols', 'cng2012'], 
    "ssonoffswitch":['sen2012-vtd2015-symbols','sen2012-vtd2015-line'], 
    "shonoffswitch":['hse2012-vtd2015-symbols','hse2012-vtd2015-line']
};

//google geocoder
var geocoder = null;

//Set initial basemap with initialize() - called in helper.js
function initialize(){
	$("#map").height('544px');
	southWest = new mapboxgl.LngLat( -104.7140625, 41.86956);
    northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
    //bounds = new mapboxgl.LngLatBounds(southWest, northEast);
    bounds = new mapboxgl.LngLatBounds(southWest,northEast);

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaW01MGpwdDcwMWppdWZtNnoxc3pidjZhIn0.0D2UtVeOtsJFaHr8761_JQ';
	map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/ccantey/cimi2xon00022ypnhqkjob9k9',
		center: [-93.6678,46.1706],
		maxBounds:bounds,		
		zoom: 5
	});

    map.addControl(new mapboxgl.Navigation({
    	position:'top-left'
    }));
    geocoder = new google.maps.Geocoder;
}

//toggle basemap layers
function toggleBaseLayers(el, layer1, layer2){
	console.log(el, 'has been toggled');
	if (el.is(':checked')){
		map.setStyle('mapbox://styles/ccantey/cimi2xon00022ypnhqkjob9k9');
	} else {
		map.setStyle('mapbox://styles/mapbox/' + layer1 + '-v9');
	}
}

//previously fetched WMS layers - rewritten to call geojson - WMS not supported by vector tiles
function getOverlayLayers(el, switchId){

    for (layers in switchMap[switchId])	{

	    if(el.is(':checked')){	    	
	        var visibility = map.getLayoutProperty(switchMap[switchId][layers], 'visibility');
	    	if (visibility === 'visible'){     	    	
			      map.setLayoutProperty(switchMap[switchId][layers], 'visibility', 'none');
			    }	
			$('.loader').hide();
	    } else {	           
			map.setLayoutProperty(switchMap[switchId][layers], 'visibility', 'visible');
			// map.setFilter(switchMap[switchId][layers], ['has', 'name']); //show all lines (remove filter)
			$(".loader").hide();
		}
	}
}



function geoCodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('geocodeAddress').value;
  
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var precision = results[0].geometry.location_type;
      var components = results[0].address_components;
      var pos = {
        lngLat: {lng:results[0].geometry.location.lng(),lat:results[0].geometry.location.lat()},
        lat:results[0].geometry.location.lat(),
        lng:results[0].geometry.location.lng()
      };

      // console.log(pos.lat);
      // console.log(pos.lng);
      //map.setView(L.latLng(pos.lat,pos.lng),16);
      map.flyTo({
      	center:[pos.lng,pos.lat],
      	zoom:15,
      	speed:1.75
      });
      addMarker(pos);
      identifyDistrict(pos);
      geocodeFeedback(precision, components);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
      $('.loader').hide();
    }
  });
}

function geocodeFeedback(precision, components){
	//console.log(precision, 'location, center of ', components[0].types[0]);
	var message = "";
	var componentMap = {"street_number": "street", "postal_code": "zip code", "administrative_area_level_1": "state", "locality": "city", "administrative_area_level_2": "county", "route": "route", "intersection": "intersection", "political": "political division", "country": "country","administrative_area_level_3": "minor civil division", "administrative_area_level_4": 'minor civil division', "administrative_area_level_5": "minor civil division", "colloquial_area": "country", "neighborhood": "neighborhood", "premise": "building", "subpremise": "building", "natural_feature": "natural feature", "airport": "airport", "park": "park", "point_of_interest": "point of interest"};

	if (precision == "ROOFTOP"){
		message = "Address match!";
		$('#geocodeFeedback').html(message).css('color', 'green');
		$('#geocodeFeedback').show();
	} else {
		message = "Approximate location! Center of " + componentMap[components[0].types[0]];
		$('#geocodeFeedback').html(message).css('color', 'red');
		$('#geocodeFeedback').show();
	}
	slideSidebar();
	
}

//submit search text box - removed button for formatting space
function keypressInBox(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode                        
        e.preventDefault();
        geoCodeAddress(geocoder, map);
    }
};

// //fetch location data from postgres on mouseclick/geocode submition
function identifyDistrict(d){

	// console.log(d.latlng); 
	var data = {
		lat: d.lngLat.lat,
		lng: d.lngLat.lng 
	};
    $(".loader").show();
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
		$('#mnhouselink').attr('href', 'http://www.house.leg.state.mn.us/members/members.asp?id='+ memberData.features[0].properties.memid);
		
		$('#senatephoto').attr('src', 'images/Senate/'+memberData.features[1].properties.district+'.jpg').attr('width','auto').attr('height','auto');
		$('#senatemember').html(memberData.features[1].properties.name + '<span class="party">  ('+memberData.features[1].properties.party+')</span>');
		$('#senatedistrict').html('MN Senate - ' + memberData.features[1].properties.district);
        $('#mnsenlink').attr('href', 'http://www.senate.leg.state.mn.us/members/member_bio.php?leg_id='+ memberData.features[1].properties.memid);		
		
		$('#ushousephoto').attr('src', 'images/USHouse/US'+memberData.features[2].properties.district+'.jpg').attr('width','auto').attr('height','auto');
		$('#ushousemember').html(memberData.features[2].properties.name + ' <span class="party"> ('+memberData.features[2].properties.party+')</span>');
		$('#ushousedistrict').html('U.S. House - ' + memberData.features[2].properties.district);
		var lastname = memberData.features[2].properties.name.split(" ")[1];
		$('#ushouselink').attr('href', 'http://'+ lastname +'.house.gov/');
		
		$('#ussenatephoto').attr('src', 'images/USSenate/USsenate1.jpg').attr('width','auto').attr('height','auto');
		$('#ussenatemember').html('Amy Klobuchar <span class="party"> (DFL)</span>');
		$('#ussenatedistrict').html('U.S. Senate' );
		$('#ussenatelink').attr('href', 'http://www.klobuchar.senate.gov/');
		
		$('#ussenatephoto2').attr('src', 'images/USSenate/USsenate2.jpg').attr('width','auto').attr('height','auto');
		$('#ussenatemember2').html('Al Franken <span class="party"> (DFL)</span>');
		$('#ussenatedistrict2').html('U.S. Senate');
		$('#ussenate2link').attr('href', 'http://www.franken.senate.gov/');
		$(".loader").hide();
	} else { 
		$('#mask').show();
		$('.loader').hide();
	}	
}

function addMarker(e){
	// console.log([e.lngLat.lng, e.lngLat.lat]);
    // var mapclick = new mapboxgl.LngLat(e.lngLat.lng, e.lngLat.lat);
	//remove previous legislative data
	$(".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).removeClass('active');
	$('.memberLink').hide();
	$('#housemember, #senatemember, #ushousemember, #ussenatemember, #ussenatemember2').html('');
    $('#housedistrict, #senatedistrict, #ushousedistrict, #ussenatedistrict, #ussenatedistrict2').html('');
    $('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').removeAttr('src');

    //remove old pushpin and previous selected district layers 
	removeLayers('pushpin');
	removeLayers('districts');
	removeLayers('minnesota');

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
      			"title": "mouseclick",
      			"marker-symbol": "myMarker-Blue-Shadow"
    		}
  		}
	});

    map.addLayer({
        "id": "pointclick",
        type: 'symbol',
        source: 'pointclick',
        "layout": {
        	"icon-image": "{marker-symbol}",
        	"icon-size":1,
        	"icon-offset": [0, -13]
        },
        "paint": {}
    });
}

// //Show the district on the map
function showDistrict(div){
	console.log(div)
	slideSidebar();
	$(".loader").show();

	//div is the class name of the active member
	divmap = {"mnhouse active": [0,'hse2012-vtd2015-polygon', 'hse2012-vtd2015-line', 'hse2012-vtd2015-symbols'], 
	         "mnsenate active": [1, 'sen2012-vtd2015-polygon', 'sen2012-vtd2015-line', 'sen2012-vtd2015-symbols'], 
	         "ushouse active":  [2, 'cng2012-symbols', 'cng2012']
	        };

    // need to remove here for change in member selection
	removeLayers('districts');
	removeLayers('minnesota');
    
	districtLayer = geojson.features[divmap[div][0]];
	queryLayer  = [divmap[div][1], divmap[div][2], divmap[div][3]];
    console.log(queryLayer)
    //clear previous selection
    
    var selectedDistrict = String(districtLayer.properties.district);

    //show current selection (!= selected district #figure/ground)
    map.setFilter(queryLayer[0], ['!=', 'district', selectedDistrict]);
    map.setLayoutProperty(queryLayer[0], 'visibility', 'visible');
    //show current selection district label
    map.setFilter(queryLayer[2], ['==', 'district', selectedDistrict]);
    map.setLayoutProperty(queryLayer[2], 'visibility', 'visible');
    console.log(String(districtLayer.properties.district));

    // map.setLayoutProperty(queryLayer[1], 'visibility', 'visible');
    // map.setLayoutProperty(queryLayer[2], 'visibility', 'visible');
    
    //TOGGLE APPROPIATE SWITCH IF TURNING ON ALL LAYERS
    // TO FILTER LINES AROUND SHADOW USE THIS 
    // map.setFilter(queryLayer[1], ['==', 'district', String(districtLayer.properties.district)]);


    // console.log(districtLayer);
 //     map.addSource("district", {
 //        "type": "geojson",
 //        "data": districtLayer
 //    });
	// //.addTo(map);
	// map.addLayer({
 //        'id': 'mapDistrictsLayer',
 //        'type': 'fill',
 //        'source': 'district',
 //        'layout': {},
 //        'paint': {
 //            'fill-color': '#f26c4f',
 //            'fill-opacity': 0.65
 //        }
	// },"pointclick"); //important! add before 'pointclick' - this is how you control order of layers.
    
	//zoom to selection
	map.fitBounds(geojsonExtent(districtLayer), {padding:'100'});
	$(".loader").hide();	
}

function removeLayers(c){

	switch (c){
		case'all':
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}
		if (typeof map.getLayer('mapDistrictsLayer') !== "undefined" ){ 		
			map.removeLayer('mapDistrictsLayer')
			map.removeSource('district');	
		}
		if (typeof map.getLayer('minnesotaGeojson') !== "undefined" ){ 		
			map.removeLayer('minnesotaGeojson')
			map.removeSource('minnesotaGeojson');	
		}
		for (layers in overlayLayers)	{
		    map.setLayoutProperty(overlayLayers[layers], 'visibility', 'none');
		    // map.setFilter(overlayLayers[layers], ['!=', 'district', String(overlayLayers[layers]]);//hse2012-vtd2015-polygon
		    map.setFilter(overlayLayers[layers], ['has', 'district'])
		}
		break;
		case 'districts':
		if (typeof districtLayer !== "undefined" ){ 
		    //remove opacity mask		
			map.setFilter(queryLayer[0], ['!has', 'district']);
            // map.setFilter(queryLayer[1], ['!has', 'district']);

            //remove label	
            // map.setFilter(queryLayer[2], ['!has', 'district']);

    //         map.setFilter(queryLayer[0], ['!=', 'district', String(districtLayer.properties.district)]);
    // map.setLayoutProperty(queryLayer[0], 'visibility', 'visible');
    // //show current selection district label
    // map.setFilter(queryLayer[2], ['==', 'district', String(districtLayer.properties.district)]);
    // map.setLayoutProperty(queryLayer[2], 'visibility', 'visible');


		} 
		break;
		case 'minnesota':
		if (typeof map.getLayer('minnesotaGeojson') !== "undefined" ){ 		
			map.removeLayer('minnesotaGeojson')
			map.removeSource('minnesotaGeojson');	
		}
		break;
		case 'pushpin':
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}

	}    
}

function showSenateDistrict(div){
	slideSidebar();
    $(".loader").show();
	//remove preveious district layers.
	removeLayers('districts');
    removeLayers('minnesotaGeojson');
    map.addLayer({
        'id': 'minnesotaGeojson',
        'type': 'fill',
        'source': 'minnesotaGeojson',
        'layout': {},
        'paint': {
            'fill-color': '#f26c4f',
            'fill-opacity': 0.65
        }
	});  	
    
    // mapDistrictsLayer = MinnesotaBoundaryLayer.addTo(map);
	// map.fitBounds(mapDistrictsLayer.getBounds());
	map.fitBounds(geojsonExtent(MinnesotaBoundaryLayer), {padding:'100'});
	$(".loader").hide();
	
}

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

function zoomToGPSLocation() {
// Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lngLat: {lat:position.coords.latitude,lng:position.coords.longitude},
        lat:position.coords.latitude,
        lng:position.coords.longitude
      };

      addMarker(pos);
	  identifyDistrict(pos);
	  map.flyTo({
      	center:[pos.lng,pos.lat],
      	zoom:15,
      	speed:1.75
      });

    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
 alert('Geocode was not successful - Your browser does not support Geolocation');
      $('.loader').hide();

}

function resetLayerSwitches (){
    var inputs = $(".onoffswitch-checkbox");
    for (var i = 0, il = inputs.length; i < il; i++) {
    	var inputsID = '#'+ inputs[i].id;
        if($(inputsID).not(':checked')){
        	$(inputsID).prop('checked', true);
        }         
    }	
}

