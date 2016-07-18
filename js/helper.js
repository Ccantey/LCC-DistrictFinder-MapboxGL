$( document ).ready(function() {
	//kickoff map logic
    initialize();

    map.on('click', function(e){
    	addMarker(e);
  //       $('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').attr('src',"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=").attr('width',0).attr('height',0);;
		identifyDistrict(e);
		$('#geocodeFeedback').hide();
		$("#geocodeAddress").val('');
		slideSidebar();
	});     

    // on small screens
	$('#toggleSidebar').click(function(e){
		e.preventDefault();
		slideSidebar();
	});
    
    // on small screens
	$('#pull-out').click(function(e){
		slideSidebar();
	});

	// on small screens
	$('#pull-in').click(function(e){
		slideSidebar();
	});

    $('.mapboxgl-ctrl-compass').click(function(){
    	if ($(this).hasClass('rotated')){
            map.easeTo({pitch: 0});
            $('.arrow').css({transform: 'rotate(0deg)'});
    	} else{
    		map.easeTo({pitch: 60});
    		$('.arrow').css({transform: 'rotate(180deg)'});
    	}    	
    	$(this).toggleClass('rotated');

    })
    // on small screens allow geolocation
    $('#gpsButton').click(function(e){
    	e.preventDefault();
    	zoomToGPSLocation();
    });

    // enter key event
    $("#geocodeAddress").bind("keypress", {}, keypressInBox);
    
    // both key and enter fire geoCodeAddress
    $('#searchButton').click(function(e){
    	e.preventDefault();
    	geoCodeAddress(geocoder, map);
    })
	
	// hide links - format is off until results come back
    $('.memberLink').hide();

    $( ".mnhouse, .mnsenate, .ushouse" ).click(function(e) {
          $(this).addClass('active').siblings().removeClass('active');
          $(this).find(".geo_hint").css("color","rgba(100,100,100,0)");
	      showDistrict($(this).attr('class'));
    });

    // $(".geo_hint").css("color","rgba(0,0,0,0)");
    $( ".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).on("mouseenter",function(e){
        if ($(this).hasClass('active') == false){
            $(this).find(".geo_hint").css("color","rgba(255,255,255,.60)");
        }
    }).on("mouseleave", function(){
    	$(".geo_hint").css("color","rgba(0,0,0,0)");
    })

	// Members UI click turn red with 'active' class
	//get static minnesota geojson (faster than php)
	$( ".ussenate1, .ussenate2" ).click(function() {
	 	 $(this).addClass('active').siblings().removeClass('active');
         $(this).find(".geo_hint").css("color","rgba(100,100,100,0)");
	  	if(typeof MinnesotaBoundaryLayer === 'undefined'){
			$.getJSON("./data/Minnesota2015.json", function(data) {
						MinnesotaBoundaryLayer = data;
						// console.log(data);
						map.addSource("minnesotaGeojson", {
					        "type": "geojson",
					        "data": MinnesotaBoundaryLayer
					    });
						//.addTo(map);

		  			}).done(function(){		  				
  				       showSenateDistrict();
  			        });
  		} else {
  			showSenateDistrict();
  		}	  	

	});

	//Open layers tab
	$('#triangle-topright').click(function(){
  		$(this).animate({right:'-100px'},250, function(){
    		$('#map_layers').animate({right:0},250);
    		dataLayer.push({'event': 'openLayers'});
  		});  
	});

    //Close layers tab
	$('#map_layers_toggle').click(function(){
  		$('#map_layers').animate({right:'-225px'},250, function(){
    		$('#triangle-topright').animate({right:0},250);
  		});  
	});
	
	//Toggle basemap
	$('#satellitonoffswitch').click(function(){
		toggleBaseLayers($('#satellitonoffswitch'),'satellite');
	});

    //fetch overlay layers
	$('#countyonoffswitch, #cononoffswitch, #ssonoffswitch, #shonoffswitch, #cityonoffswitch').click(function(){
		$('.loader').show();
		var elementName = $(this).attr('id');
        getOverlayLayers($(this), $(this).attr('id'));
        dataLayer.push({'event': 'layerToggle_'+ elementName});

	});

	//map reset
	$('#map_reset').click(function(){
		map.flyTo({center: [-93.6678,46.1706], zoom: 5, pitch: 0, speed:3});
		$('.arrow').css({transform: 'rotate(0deg)'});
		$('#mask').show();
		$('#geocodeFeedback').hide();
		$("#geocodeAddress").val('');
		$(".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).removeClass('active');
		$('.memberLink').hide();
		$('#housemember, #senatemember, #ushousemember, #ussenatemember, #ussenatemember2').html('');
		$('#housedistrict, #senatedistrict, #ushousedistrict, #ussenatedistrict, #ussenatedistrict2').html('');
		$('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').attr('src',"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=").attr('width',0).attr('height',0);;
        

		//Toggle basemap when you reset 
		if($('#satellitonoffswitch').is(':checked')){
				//:checked = true -> leave it ... when I copied the switches I had initial states backwards
		} else {
			//:checked = false -> toggle map
			map.setStyle('mapbox://styles/ccantey/cimi2xon00022ypnhqkjob9k9');
			//$('#satellitonoffswitch').prop('checked', true);
		}
		//toggle all layer switches
		resetLayerSwitches();
		//Remove all layers except the basemap -- down here because its an asychronous thead apparently
		removeLayers('all');
	});

	//----- OPEN Modal
    $('[data-popup-open]').on('click', function(e)  {
        var targeted_popup_class = $(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350); 
        e.preventDefault();
    });
 
    //----- CLOSE Modal
    $('[data-popup-close]').on('click', function(e)  {
        var targeted_popup_class = $(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350); 
        e.preventDefault();
    });

    //attach a hover method to layers ribbon
    $('#triangle-topright').on('mouseenter', function(){
    	$('.fa-map').css('color', '#8d8d8d'); 
    }).on('mouseleave', function(){
    	$('.fa-map').css('color', '#e6e6e6');
    });    

	 $('.loader').hide();

	console.log("Welcome to the 'Who Represents Me?' legislative district finder application, developed by the MN State Legislative Coordinating Commission. The application's responsive web design(RWD), open-source code can be found at 'https://github.com/Ccantey/LCC-DistrictFinder'.")

});//end ready()

