/**
 * 
 */
package com.grasso.bluemix.watson.weather;

import java.net.URL;
import java.io.BufferedReader;
import org.apache.commons.codec.binary.Base64;
import com.google.gson.*; 
 

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.MalformedURLException;

import javax.faces.context.FacesContext;
import javax.net.ssl.HttpsURLConnection;

import com.ibm.xsp.designer.context.XSPContext;

import com.ibm.xsp.bluemix.util.context.BluemixContext;


/**
 * @author Giuseppe Grasso & Daniele Grillo
 *
 */
public class meteo {

	private String BM_W_USR = "";
	private String BASE_URL = "";
	private  String BM_W_PWD = "";
	
	private static final String PAR_UNITS = "units=m";
	
	
	public  meteo() {
		FacesContext facesContext = FacesContext.getCurrentInstance();
		XSPContext context = XSPContext.getXSPContext(facesContext);
		BluemixContext bc=(BluemixContext)facesContext.getApplication().getVariableResolver().resolveVariable(facesContext, "bluemixContext");
		
		if (bc.isRunningOnBluemix()) {
			/*read the parameter from Bluemix directly*/
			JsonElement jelement = new JsonParser().parse(bc.getVCAP_SERVICES());
			JsonObject  jobject = jelement.getAsJsonObject();
			JsonArray jarray = jobject.getAsJsonArray("weatherinsights");
			jobject = jarray.get(0).getAsJsonObject();
			jobject = jobject.getAsJsonObject("credentials");
			
			this.BASE_URL="https://"+jobject.get("host").getAsString()+"/api/weather";
			this.BM_W_USR=jobject.get("username").getAsString();
			this.BM_W_PWD=jobject.get("password").getAsString();
			
			
			
		} else {
			this.BASE_URL=context.getProperty("bluemix.weather.BASE_URL");
			this.BM_W_USR=context.getProperty("bluemix.weather.BM_W_USR");
			this.BM_W_PWD=context.getProperty("bluemix.weather.BM_W_PWD");
		}
	}
		/**
		 *
		 * @return json string from watson wheater api 
		 */
	private String GetWeatherJson( String myUrlStr ) {
		StringBuffer buffer = new StringBuffer();
		try{
			URL myUrl = new URL(myUrlStr);
			//URLConnection urlCon = myUrl.openConnection();
			HttpsURLConnection urlCon =  (HttpsURLConnection) myUrl.openConnection();
			urlCon.setRequestProperty("Method", "GET");
			urlCon.setRequestProperty("Accept", "application/json");
			urlCon.setConnectTimeout(5000);
			urlCon.addRequestProperty("Authorization", GetAuth() );
			urlCon.connect();
			int respcode=urlCon.getResponseCode();
			switch (respcode) {
			  case 200:
				  InputStream is = urlCon.getInputStream();
				  InputStreamReader isR = new InputStreamReader(is);
					BufferedReader reader = new BufferedReader(isR);

					String line = "";
					while( (line = reader.readLine()) != null ){
						buffer.append(line);
					}
					reader.close();
			        break;
			  case 400: 
				  buffer.append("{status:400,error:\"Bad request. The request could not be understood by the server because of malformed syntax. This is implemented for all APIs. The API rejects the request if any invalid parameters are supplied\"}");
			        break;
			  case 401:
				  buffer.append("{status:401,error:\"Unauthorized. The request requires authentication.\"}");
				   break;
			  case 403:        
				  buffer.append("{status:403,error:\"Forbidden request. Limit reached.\"}");
			        break;
			  case 404:
			         buffer.append("{status:404,error:\"Not found. Any required parameter that is not present in the API request results in a MissingParameterException being thrown with a status of 404 returned\"}");
			        break;
			  case 500:
			         buffer.append("{status:500,error:\"Internal server error. The server encountered an unexpected condition that prevented it from fulfilling the request.\"}");
			        break; 
			  default:
				  buffer.append("{error:\"Generic error\"}");
				   break;
			}
			
			return buffer.toString();
			
		}catch( MalformedURLException e ){
			e.printStackTrace();
			buffer.append("error: "+ e.toString()+" "+GetAuth());
			return buffer.toString();
		}catch( IOException e ){
			e.printStackTrace();
			buffer.append("error: "+ e.toString()+" "+GetAuth());
			return buffer.toString();
		}
	}
	public void SetGeoParameter(String username,String password, String host){
		this.BM_W_USR=username;
		this.BM_W_PWD=password;
		this.BM_W_USR=host;
	}
	
	/**
	 *
	 * @return The ten-day forecast API returns the geocode weather forecasts for the current day up to ten days.
	 */
	public String GetGeoForecastDaily10day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/daily/10day.json?"+PAR_UNITS);
		}
	/**
	 *
	 * @return The ten-day intraday forecast API returns the geocode weather forecasts in 6-hour periods for the current day up to ten days.
	 */
	public String GetGeoForecastIntraday10day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/intraday/10day.json?"+PAR_UNITS);
		}
	
	/**
	 *
	 * @return The five-day forecast API returns the geocode weather forecasts for the current day up to five days.
	 */
	public String GetGeoForecastDaily5day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/daily/3day.json?"+PAR_UNITS);
	}
	/**
	 *
	 * @return The five-day intraday forecast API returns the geocode weather forecasts in 6-hour periods for the current day up to five days.
	 */
	public String GetGeoForecastIntraday5day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/intraday/5day.json?"+PAR_UNITS);
	}
	
	/**
	 *
	 * @return The three-day forecast API returns the postal code weather forecasts for the current day up to three days.
	 */
	public String GetGeoForecastDaily3day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/daily/3day.json?"+PAR_UNITS);
	}
	/**
	 *
	 * @return The three-day intraday forecast API returns the geocode weather forecasts in 6-hour periods for the current day up to three days.
	 */
	public String GetGeoForecastIntraday3day( String lat , String lon) {
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/forecast/intraday/3day.json?"+PAR_UNITS);
	}
	
	/**
	 *
	 * @return Use this operation to retrieve Weather Alert Headlines by specifying the Geocode location. This API returns a key that uniquely identifies an alert event that is active for a given area.
	 */
	
	public String GetGeoAlertHeadlines( String lat , String lon, String lang) { //
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/alerts.json?language="+lang);
	} //https://twcservice.eu-gb.mybluemix.net/api/weather/v1/geocode/33.40/-83.42/alerts.json?language=en-US
	

	
	/**
	 *
	 * @return 	The Monthly Almanac API returns the monthly almanac for the location identified by the geocode. The almanac information for this API is sourced from National Weather Service observations stations from a time period spanning 10 to 30 years or more. The information is gathered and provided by the National Climatic Data Center (NCDC).
	 */
	public String GetGeoAlmanacMonthly( String lat , String lon, String mstart, String mend) { //
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/almanac/monthly.json?start="+mstart+"&end="+mend+"&"+PAR_UNITS);
	}
	
	/**
	 *
	 * @return 	The time series observations API returns the latest weather time series observations for the location identified by the geocode.
	 */
	
	public String GetGeoTimeSeriesObservations( String lat , String lon, String hours) { //23 hours max
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/observations/timeseries.json?hours="+hours+"&"+PAR_UNITS);
	} //https://twcservice.eu-gb.mybluemix.net/api/weather/v1/geocode/33.40/-83.42/observations/timeseries.json?hours=5&units=m
	
	
	/**
	 *
	 * @return 	Use this operation to retrieve Current Conditions forecast by specifying the Geocode location.
	 */
	
	public String GetGeoObservations( String lat , String lon) { 
		return GetWeatherJson(BASE_URL+"/v1/geocode/"+lat+"/"+lon+"/observations.json?"+""+PAR_UNITS);
	} //
	
	/**
	 *
	 * @return basic http header string for authentication 
	 */
	private String GetAuth () {
		
	
		String up= BM_W_USR+":"+BM_W_PWD ;
		String auth = new String( Base64.encodeBase64(up.getBytes()) );
		//String auth = Base64.encodeBase64String(up.getBytes());
		return "Basic "+auth;
		
	}
	
}
