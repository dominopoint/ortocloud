
/* from json string to javascript Date
 * sdt string returns Date
 * */
function jsonToDate(sdt){
	try {
		//'2015-11-06T10:45:42.333Z'
		st=sdt.split('T').join(' ').split('.')[0]
		var dt=I18n.parseDate(st,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
		//logInfo('da '+st+' a '+dt)
		return dt
		}catch(e){
			logError('JsonToDate '+e);
		}
}
/* from javascript Date to json string 
 * dt Date @returns string */
function dateToJson(dt){
	try{
	var s = I18n.toString(dt,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
	return s
	}
	catch(e){
		logError("dateToJson "+e)
	}
}