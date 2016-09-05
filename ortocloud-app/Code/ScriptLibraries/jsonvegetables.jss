import utility;
import jsonutils;


/* This function return a list of URL images of the vegetables 
 * rtName= Name of richtext of NSF NoSQL datastore
   docxsp = wrapping domino document
   db= serverdomino!!pathdbNSF
   
*/
function listImageURL(RTname,docXSP:NotesXspDocument,db:String,prefixURL:String){
	try{
		var listImg=[];	
		var before:String=prefixURL;  
		var nameattach,tmp,url:String="";
		var i:double;
		var attach;


		var rtImage:java.util.List=docXSP.getAttachmentList(RTname); // read all attachments in RTfield
		for(i=0;i<rtImage.size();i++){
			attach=rtImage.get(i);
			tmp=@ReplaceSubstring(@Right(db,"!!"),"\\","/");
			url=prefixURL+"/xsp/.ibmmodres/domino/OpenAttachment/"+tmp+"/"+docXSP.getDocument().getUniversalID()+"/"+RTname+"/"+attach.getName();	
			listImg.push(url);		
		}
	    return (listImg);
	} catch(e){
		return (e.toString())
	}

}
/*retun the URL for the la<st image only*/
function lastImageURL (RTname,docXSP:NotesXspDocument,db:String,prefixURL:String){
	try{
		var listImg="";	
		var before:String=prefixURL;  
		var nameattach,tmp,url:String="";
		var i:double;
		var attach;


		var rtImage:java.util.List=docXSP.getAttachmentList(RTname); // read all attachments in RTfield
		for(i=0;i<rtImage.size();i++){
			attach=rtImage.get(i);
			tmp=@ReplaceSubstring(@Right(db,"!!"),"\\","/");
			url=prefixURL+"/xsp/.ibmmodres/domino/OpenAttachment/"+tmp+"/"+docXSP.getDocument().getUniversalID()+"/"+RTname+"/"+attach.getName();	
			listImg=url;		
		}
	    return (listImg);
	} catch(e){
		return (e.toString())
	}
	
}

/* This function process a Domino Document and call listImageURL() functions, for non BlueMix variable...we need a path of 
 * store.nsf not local
   
*/

function processImageURL(doc:NotesDocument){
	try{
		var docXSP:NotesXspDocument=wrapDocument(doc);
	    var RTname:String="Photo";
	     var db,prefix:String=""

		if (bluemixContext.isRunningOnBluemix()){
		    db=getBmEnvXPagesServerName()+"!!"+getBmEnvXPagesDataPath();
	        // the access to store.nsf have Anonymous with Manager access 
		    //prefix="https://"+getBmEnvXPagesDataUsername()+":"+getBmEnvXPagesDataPassword()+"@"+getBmEnvXPagesDataURL()+"/"+getBmEnvXPagesDataPath();
	        prefix="https://"+getBmEnvXPagesDataURL()+"/"+getBmEnvXPagesDataPath();
	        } else {
			    db=session.getCurrentDatabase().getServer()+"!!"+pathNSFLocalStore;
			   var url = context.getUrl();
			   prefix=url.getScheme() + "://" + url.getHost()+"/"+@ReplaceSubstring(session.getCurrentDatabase().getFilePath(),"\\","/");
		}
	    //return listImageURL(RTname,docXSP,db,prefix); 
	     return lastImageURL(RTname,docXSP,db,prefix); 
	} catch(e){
		return (e.toString())
	}
}

/*
 * Return a JSON in this format
 * { 

    location:{lat:44.4,lon:8.21},
    almanac:[ {month:'01',tempMax:20,tempMin:4}...{month:'01',tempMax:20,tempMin:4} ],
    garden:{title:'il mio giardino'},
    biolist:[ { name:'artichoke',id:'<universalid>',tempMax:20,tempMin:10,minhavest:30,harvestMax:160,description:'<text>',image:'<imageurl>',score:<punteggio>    } ]      
 }*/



//function renderJSONmeteo(lat:String, lon:String){
function vegScoreAsObject(lat:String, lon:String) {
	try{
	importPackage(com.grasso.bluemix.watson.weather);
	if (viewScope.vegs==null){
	var wt= new com.grasso.bluemix.watson.weather.meteo();
	var wtalmanac=wt.GetGeoAlmanacMonthly(lat,lon,"01","12");// generate JSON from weather almanac monthly
	var jsonAlmanac=fromJson(wtalmanac);
	var dbstore:NotesDatabase=null;
	var score:int=0;
	var biolist=[];
	var almanaclist=[];
	var bioName,bioDescr,biotempMax,biotempMin,bioharvestMax,bioharvestMin,bioImage,bioScore="";
	var elem={};
	
	for (i=0;i<jsonAlmanac.almanac_summaries.length;i++){
    	elem={"month":i+1,"tempMax":jsonAlmanac.almanac_summaries[i].avg_hi,"tempMin":jsonAlmanac.almanac_summaries[i].avg_lo}
    	almanaclist.push(elem);
    }
	
	if (bluemixContext.isRunningOnBluemix()){
	    var dbstore=session.getDatabase(getBmEnvXPagesDataHost(),getBmEnvXPagesDataPath())
		
	} else {
		var dbstore=session.getDatabase(session.getCurrentDatabase().getServer(),pathNSFLocalStore)
	}
	var v:NotesView=dbstore.getView("byTemperature");
	v.setAutoUpdate(false); 
	var d:Date = new Date();
	var currentMonth = d.getMonth(); //0=January, 1=February etc.
	
	var doc:NotesDocument=v.getFirstDocument();
	var temp:NotesDocument = null; 
	while (doc!=null){
		
		score=checkScoreVegetables(jsonAlmanac, doc, currentMonth );
		bioName=doc.getItemValueString("PlantName");
		//_dump(bioName+" "+score)
		bioDescr=doc.getItemValueString("Descriptions");
		biotempMax=doc.getItemValueInteger("TempMax");
		biotempMin=doc.getItemValueInteger("TempMin");
		bioharvestMax=doc.getItemValueInteger("HarvestMax");
		bioharvestMin=doc.getItemValueInteger("HarvestMin");
		bioImage=processImageURL(doc); // return an array of string
		bioScore=score;
		elem={name:bioName,id:doc.getUniversalID(),tempMax:biotempMax,tempMin:biotempMin,harvestMin:bioharvestMin,harvestMax:bioharvestMax,description:bioDescr,image:bioImage,score:bioScore}
		biolist.push(elem) // aggiunge l'elemento all'array
		temp=v.getNextDocument(doc);  
		doc.recycle();
		doc=temp;
	}
	
	var jsonfull={location:{"lat":lat,"lon":lon},
	"almanac":almanaclist,		
	"biolist":biolist		
	}
	viewScope.vegs=jsonfull;
	return(jsonfull);
	} else{ return viewScope.vegs}
	//return(toJson(jsonfull));
	} catch(e){
		_dump(e.toString())
	}
}

function vegScoreAsString(lat:String, lon:String) {
	return(toJson(vegScoreAsObject(lat, lon)));
}

function renderJSONmeteo(lat:String, lon:String) {
	 return vegScoreAsString(lat,lon)
}

/*this function check in almanac json the temperature of vegetables and harvest time*/
function checkScoreVegetables (json, doc:NotesDocument, m:int){
	var deb=false;
	//deb=(doc.getItemValueString('PlantName')=='Chicory')
	//_dump(doc.getItemValueString('PlantName')+" "+deb) 
	var min:int=doc.getItemValueInteger("TempMin");
	var max:int=doc.getItemValueInteger("TempMax");
	
    var harv:int=parseInt((doc.getItemValueInteger("HarvestMax")/30)+1);
    var score=0;
    var idxAlmanac:int=m;
    var arr=json.almanac_summaries; //arrays of month almanac
    /*ciclo per il numero di mesi trovato*/
    for (i=0;i<harv;i++){
    /*	if (   parseFloat(min)>=parseFloat(arr[idxAlmanac].avg_lo) 
    		&& parseFloat(max)<=parseFloat(arr[idxAlmanac].avg_hi)){
    		score++;
    		score++; //two points
       	} else if (   parseFloat(min)>=parseFloat(arr[idxAlmanac].avg_lo) 
    		|| parseFloat(max)<=parseFloat(arr[idxAlmanac].avg_hi)){
    		//score++; //one point
       	}*/ 
    	if (    parseFloat(min)>=parseFloat(arr[idxAlmanac].avg_lo) && 
        		 parseFloat(max)<=parseFloat(arr[idxAlmanac].avg_hi)){
        		score++;
        		score++; //two points: vegetable good range inside almanac range 
           	} else if (  parseFloat(min)<= parseFloat(arr[idxAlmanac].avg_lo) 
        			    && parseFloat(max)>=parseFloat(arr[idxAlmanac].avg_hi)){
        		score++;
        		score++; //two points: almanac range inside vegetable good range
           	} else 
           		if (   parseFloat(max)>=parseFloat(arr[idxAlmanac].avg_lo) && 
           		       parseFloat(max)<=parseFloat(arr[idxAlmanac].avg_hi)){
        		score++; //one point, partially in range
           	}else 
           		if (   parseFloat(min)>=parseFloat(arr[idxAlmanac].avg_lo) && 
           			   parseFloat(min)<=parseFloat(arr[idxAlmanac].avg_hi)){
            	   score++; //one point, partially in range
               	}
       		
    	idxAlmanac=(idxAlmanac+1)>11?0:idxAlmanac+1; // repeat 12 month of array return
    	if (deb) { _dump(i+" "+doc.getItemValueString('PlantName')+": "+min+"-"+max+" m"+idxAlmanac +" " +arr[idxAlmanac].avg_lo+"-"+arr[idxAlmanac].avg_hi+" "+(   parseFloat(min)>=parseFloat(arr[idxAlmanac].avg_lo) && parseFloat(max)<=parseFloat(arr[idxAlmanac].avg_hi))+" "+(score/2)+"/"+harv )}
    	
    }
    
    return (parseInt( (score/2) /harv*100)) // return the percentage of score
    

}

function addVegetablesMyGarden(veg,doc:NotesXspDocument){
	/**/
	try {
	importPackage(com.grasso.bluemix.watson.weather);
	var biolist=(sessionScope.myGarden!=""&&sessionScope.myGarden!=null)?sessionScope.myGarden.biolist:[];
	el={ "name":veg.name,
		 "id":veg.id,
		 "description":veg.description,
		 "image":veg.image,
		 "harvestMin":veg.harvestMin,
		 "harvestMax":veg.harvestMax,
		 "tempMin":veg.tempMin,
		 "tempMax":veg.tempMax,
		 "score":veg.score,
		 "seeded":dateToJson(new Date())
		 }
	biolist.push(el);
	/*verify if in backend is clear add other information*/
	var backjson=doc.getItemValueString("json");
	if (backjson=="") {
		var wt= new com.grasso.bluemix.watson.weather.meteo();
		var lat=getCurrentLatAsString();
		var lon=getCurrentLonAsString();
		var wtalmanac=wt.GetGeoAlmanacMonthly(lat,lon,"01","12");// generate JSON from weather almanac monthly
		var jsonAlmanac=fromJson(wtalmanac);
		var almanaclist=[];
		var elem,coord;
		for (i=0;i<jsonAlmanac.almanac_summaries.length;i++){
		    	elem={"month":i+1,"tempMax":jsonAlmanac.almanac_summaries[i].avg_hi,"tempMin":jsonAlmanac.almanac_summaries[i].avg_lo}
		    	almanaclist.push(elem);
		    }
		var mygarden={location:{"lat":lat,"lon":lon},
				"name":"my garden in "+sessionScope.currentObservation.observation.obs_name,
				"almanac":almanaclist,		
				"biolist":biolist,
				"backend":{"universalid":doc.getDocument().getUniversalID(),"noteid":doc.getDocument().getNoteID()}
				}
	} else {
		var mygarden=fromJson(backjson)
		mygarden.biolist=biolist;
	}
	mygarden.backend={"universalid":doc.getDocument().getUniversalID(),"noteid":doc.getDocument().getNoteID()}
	doc.replaceItemValue("json",toJson(mygarden))
	sessionScope.myGarden=mygarden;
	}catch(e){
		_dump('addVegetablesMyGarden error '+e)
	}
}
