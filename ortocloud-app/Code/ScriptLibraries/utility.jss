/*
 * PAY ATTENTION! MANUAL SETTINGS
 * */
//var pathNSFLocalStore="PROGETTI/bluemix/store.nsf" /*change this if you want test in local environment*/
var pathNSFLocalStore=context.getProperty("store.nsfLocalPath")
function getBmEnvXPagesDataURL(){ 
	/*var europe="xpages-domino.eu-gb.bluemix.net"
    var usa="xpages-domino.ng.bluemix.net"
    var syndey="xpages-domino.syd.bluemix.net"*/
    return (context.getProperty("bluemix.xpagesDataURL.inUse"))	/*set correct host deploy server manually, unable to find automatically*/
}
/*
 * END MANUAL SETTINGS
 * */

function getBmEnvasObject(){ /*return a JSON of VCAP service Bluemix*/
	var vcap=fromJson(bluemixContext.getVCAP_SERVICES());
	return(vcap);
}
/*XPages data VCAP*/
function getBmEnvXPagesDataName(){ /*return the name of XPages Data NoSql from VCAP*/
	var vcap=getBmEnvasObject();
	return (vcap.XPagesData[0].name)
	
}
function getBmEnvXPagesDataHost(){ /*return the host/IPServer Domino of XPages Data NoSql*/
	return (bluemixContext.getDataServiceByName(getBmEnvXPagesDataName()).getHost())
	
}
function getBmEnvXPagesServerName(){ /*return the Name of Domino Server */
	return (bluemixContext.getDataServiceByName(getBmEnvXPagesDataName()).getServerName())
	
}
function getBmEnvXPagesDataPath(){ /*return the path of NSF Domino Soflayer Bluemix*/
	return (bluemixContext.getDataServiceByName(getBmEnvXPagesDataName()).getAppPath())

}
function getBmEnvXPagesDataUsername(){
	return (bluemixContext.getDataServiceByName(getBmEnvXPagesDataName()).getUserName())

}
function getBmEnvXPagesDataPassword(){
	return (bluemixContext.getDataServiceByName(getBmEnvXPagesDataName()).getPassword())
}
/*meteo VCAP*/
function getBmEnvMeteoName(){
	var vcap=getBmEnvasObject();
	return (vcap.weatherinsights[0].name)
	
}
function getBmEnvMeteoUsername(){
	return (bluemixContext.getDataServiceByName(getBmEnvMeteoName()).getUserName())
}
function getBmEnvMeteoPassword(){
	return (bluemixContext.getDataServiceByName(getBmEnvMeteoName()).getPassword())
}
function getBmEnvMeteoURL(){
	return (bluemixContext.getDataServiceByName(getBmEnvMeteoName()).getValue("url"))
	
}
function getNameXPagesDatabm(){
	var vcap=fromJson(bluemixContext.getVCAP_SERVICES());
	
}


function findDatabaseName(){
	if (bluemixContext.isRunningOnBluemix()){ // Bluemix
	   //databaseName="5.10.125.34!!bluemix/d_grillo_grydan_it/context/tododata.nsf"
		databaseName=getBmEnvXPagesDataHost() +"!!"+getBmEnvXPagesDataPath(); 
	} else {	   
	// Grydan
	databaseName=session.getCurrentDatabase().getServer()+"!!"+pathNSFLocalStore;
    } 	
	return (databaseName)
}



function wrapDocument(doc: NotesDocument): NotesXspDocument {
    return com.ibm.xsp.model.domino.wrapped.DominoDocument.wrap(doc.getParentDatabase().getFilePath(), doc, null, null, false, null);
}


function getCurrentLatAsString(){
	return (sessionScope.geoPos==null)?'45.6984251':(sessionScope.geoPos.lat).toString()
}

function getCurrentLonAsString(){
	return  (sessionScope.geoPos==null)?'9.0365349':(sessionScope.geoPos.lon).toString()
}
function getCurrentLat(){
	return (sessionScope.geoPos==null)?45.6984251:sessionScope.geoPos.lat
}

function getCurrentLon(){
	return  (sessionScope.geoPos==null)?9.0365349:sessionScope.geoPos.lon
}

function createmeteoScope(lat:String,lon:String){
	importPackage(com.grasso.bluemix.watson.weather);
	try{
		//_dump("createmeteoScope")
		//viewScope.meteook=true;
		viewScope.meteoerrormex="";
		/*_dump(sessionScope.currentObservation.status);
		//_dump(sessionScope.forecastObservation);
		//_dump("createmeteoScope2")*/
		
		if (sessionScope.geoPos!=null){ //exist the geoposition from browser
			
			if (checkstatuswether()==false){
			    var meteo=new com.grasso.bluemix.watson.weather.meteo();
				var js=meteo.GetGeoObservations( lat,lon);
				sessionScope.currentObservation=fromJson(js);

				var ms=meteo.GetGeoForecastDaily10day(lat,lon);
				sessionScope.forecastObservation=fromJson(ms);

				/*chek if weather return error 401 - in the basic plan we have 10 call in one minute*/
				if  (sessionScope.currentObservation.status!=undefined || sessionScope.forecastObservation.status!=undefined){
					//exist e error condition so show a dialog with type of error
					var message=(sessionScope.currentObservation.status!=undefined)?sessionScope.currentObservation.error:sessionScope.forecastObservation.error; 
					viewScope.meteook=false;
					viewScope.meteoerrormex=message;

				} else {viewScope.meteook=true}
			}
			
		}


	} catch(e){
		viewScope.meteoerrormex=e.toString();
		viewScope.meteook=false;
	}


}

function checkstatuswether(){
	try{
		return (viewScope.meteook==true && sessionScope.geoPos!=null)
	}catch(e){
		return false
	}
}

function isDebug(){
	var userRoles=context.getUser().getRoles()
	var userLevel=database.queryAccess(session.getUserName())
	//context.getUser().
	//print ("param debug="+param.containsKey('debug'))
	//print ("al="+database.getCurrentAccessLevel()+" "+database.queryAccess(session.getUserName()))
	if (param.get('debug')=='off'||param.get('debug')=='false') {sessionScope.debug=false; return false}
	if (sessionScope.debug) { return true}
	if (	param.containsKey('debug') 
			&& ( @IsMember("[SuperUser]",userRoles ) 
				|| @IsMember("[Debug]", userRoles )  
				|| @IsMember("[Admin]", userRoles )
				|| userLevel>=5 ) //LEVEL_DESIGNER 5, LEVEL_MANAGER 6
 
		) { 
			if (param.get('debug')=='on'||param.get('debug')=='true') {sessionScope.debug=true}
			return true 
			}
	else {
		return false
	}
    
}