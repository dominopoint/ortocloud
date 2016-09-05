var geolocation = { lat: 44.40, lon:8.95} // genova

function getGeoLocation() {
	//var pos = location
            
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        		function(position) {
        			geolocation = {
        					lat: position.coords.latitude,
        					lon: position.coords.longitude
		          		};
        			
        			showLoc(geolocation,"loc= ")
		         
		         }, 
		        function() { 
		        	 //alert('callback error');
		        	 showLoc({ lat: 44.40, lon:8.95},"simulated");
		        	 }//error
		);	
       return geolocation;//0,0 if error
      } else {
        // Browser doesn't support Geolocation
    	//showLoc(geolocation,"error= ")  
    	  //alert('Browser does not support Geolocation');
    	  showLoc({ lat: 44.40, lon:8.95},"simulated");
        return geolocation;//0,0
      }
    }
	
function showLoc(p,msg){
	try {
	//geoRPC.setLatLon(p.lat,p.lon);
	var deferred=geoRPC.setLatLon(p.lat,p.lon);
	deferred.addCallback(function(result){
	 // terminate RPC call refresh page
		location.reload();
	});
	//location.reload();
	//alert(msg+" "+p.lat+ " "+p.lon)
	} catch(e) { 
		alert("showLoc error ")
	}
}

function loadWaitErroMeteo(){
	
	$('#errorMeteoModal').modal('show');
	console.log("show modal dialog error weather API")
}

function getGeoLocationXAgent(db) {
	//var pos = location
            
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        		function(position) {
        			geolocation = {
        					lat: position.coords.latitude,
        					lon: position.coords.longitude
		          		};
        			
        			showLocXAgent(geolocation,db);
		         
		         }, 
		        function() { console.log("callback error, if you use iOS please activate GPS");
		                     /*set Genoa as default coordinate*/
		                     geolocation = {
    					        lat: 44.4164994,
    					        lon: 8.9389484
	          		          };
		                     showLocXAgent(geolocation,db);
		         }//error
		);	
       return geolocation;//0,0 if error
      } else {
        // Browser doesn't support Geolocation
    	//showLoc(geolocation,"error= ")  
    	  alert('Browser does not support Geolocation');
        return geolocation;//0,0
      }
    }
function showLocXAgent(p,pathdb){
	var xhrArgs = {
		    url: pathdb+"/xgeoloc.xsp?open",
		    handleAs: "json",
		    content: {
		      lat: p.lat,
		      lon: p.lon
		 	      
		    },
		    load: function(data){
		      console.log(data.result);
		      $('#myPleaseWait').modal('hide');
		      location.reload();
		    },
		    error: function(error){
		      console.log(error)
		    }
		  }

		  // Call the asynchronous xhrGet
		  var deferred = dojo.xhrGet(xhrArgs);
}
