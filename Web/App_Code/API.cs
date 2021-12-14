/*
 * class API is the only class that calls instagram APIs
 * in this class, for each instagram API just one method has been implemented
*/

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using DBUtil;

namespace MySocioMe.Web.Util
{
    public class API
    {
        //define variables for static information
        
        public static string ClientID = "ebffdcab93004d74b55f6d5eb9db7da5";
        public static string ClientSecret = "b25fe476a8a44832938d28de68041692";
        public static string RedirectURL = "http://localhost:20470/login";
        
        /*
        public static string ClientID = "fadc8a9fe767449597e7c6a68d2b6d69";
        public static string ClientSecret = "bea93f55acf24c9e83c5da398bd88590";
        public static string RedirectURL = "http://localhost:20470/login"; //"http://mysociome.com/login";
        */
        
        public static string AuthURL = "https://api.instagram.com/oauth/authorize";
        public static string TokenURL = "https://api.instagram.com/oauth/access_token";
        public static string APIURL = "https://api.instagram.com/v1";
        public static string CodeSessionVariableName = "insta_code";
        public static string TokenSessionVariableName = "insta_token";
        public static string UserIDSessionVariableName = "insta_user_id";
        
        //instagram searches for locations in maximum radius of 750 metes
        //and searches for media in maximum radius of 5000 meters
        public static int MAX_LOCATIONS_RADIUS = 750;
        public static int MAX_MEDIA_RADIUS = 5000;
        
        //login_request redirects the user to instagram for authentication
        public static void login_request(System.Web.UI.Page page)
        {
            //these scopes are absolutely needed for application to run
            string scope = "basic+public_content+follower_list+relationships+likes+comments";

            page.Response.Redirect(AuthURL + "?client_id=" + ClientID + 
                "&redirect_uri=" + RedirectURL + "&response_type=code&scope=" + scope);
        }

        //function is_logged_out checks if the user has revoked access
        //parameter instaResponse is extracted from exception thrown from API calls
        public static bool is_logged_out(string instaResponse)
        {
            try
            {
                Dictionary<string, object> res = PublicMethods.fromJSON(instaResponse);

                if (res.ContainsKey("meta"))
                {
                    res = (Dictionary<string, object>)res["meta"];
                    return res.ContainsKey("error_type") &&
                        ((string)res["error_type"]).ToLower() == "OAuthAccessTokenException".ToLower();
                }
                else return false;
            }
            catch {
                return false;
            }
        }

        //function rate_limit_exception checks if the exception OAuthRateLimitException has been thrown
        //parameter instaResponse is extracted from exception thrown from API calls
        public static bool rate_limit_exception(string instaResponse)
        {
            try
            {
                Dictionary<string, object> res = PublicMethods.fromJSON(instaResponse);

                bool result = res != null && res.ContainsKey("error_type") &&
                    ((string)res["error_type"]).ToLower() == "OAuthRateLimitException".ToLower();

                return result;
            }
            catch
            {
                return false;
            }
        }

        //function get_token gets token from instagram after getting the code
        public static bool get_token(ref string res, string code, ref User user)
        {
            NameValueCollection queryParams = new NameValueCollection();

            queryParams.Add("client_id", ClientID);
            queryParams.Add("client_secret", ClientSecret);
            queryParams.Add("redirect_uri", RedirectURL);
            queryParams.Add("grant_type", "authorization_code");
            queryParams.Add("code", code);

            if (!PublicMethods.web_request(ref res, TokenURL, queryParams)) return false;

            Dictionary<string, object> json = PublicMethods.fromJSON(res);

            string token = json.ContainsKey("access_token") ? (string)json["access_token"] : string.Empty;

            if (!string.IsNullOrEmpty(token) && json.ContainsKey("user"))
                user = User.parse_insta_object((Dictionary<string, object>)json["user"]);

            res = token;

            return true;
        }

        //if an accessToken expires (users can revoke access) it will be stored in this dictionary
        //to prevent next api calls that use this token, this is specially necessary for batch operations
        private static Dictionary<string, bool> ExpiredTokens = new Dictionary<string, bool>();

        //if exception OAuthRateLimit Exception occures, we will lock the accessToken for 1 hour
        //and block all api calls that use this token
        private static Dictionary<string, DateTime> UnlockTime = new Dictionary<string, DateTime>();

        //function call_api sends the api call request to instagram endpoints
        private static bool call_api(ref string response, string accessToken,
            string url, NameValueCollection values = null, bool post = true)
        {
            //first we must check that accessToken is not expired and rate limit exception has not been occured
            if (ExpiredTokens.ContainsKey(accessToken)) return false;
            else if(UnlockTime.ContainsKey(accessToken))
            {
                if (UnlockTime[accessToken] > DateTime.UtcNow) return false;
                else UnlockTime.Remove(accessToken);
            }

            if (PublicMethods.web_request(ref response, url, values, post)) return true;
            else if (is_logged_out(response)) ExpiredTokens[accessToken] = true;
            else if (rate_limit_exception(response))
            {
                UnlockTime[accessToken] = DateTime.UtcNow.AddHours(1).AddMinutes(1);
                response = "{\"result\":\"nok\",\"message\":\"rate limit exception\"}";
            }

            return false;
        }

        //endpoint: Users -> /users/[USER-ID] (GET)
        public static bool get_user(ref string res, string accessToken, string userId)
        {
            string url = APIURL + "/users/" + (string.IsNullOrEmpty(userId) ? "self" : userId) + 
                "/?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Users -> /users/[USER-ID]/media/recent (GET)
        public static bool user_media(ref string res, string accessToken, string userId, 
            string minId = null, string maxId = null, string count = null)
        {
            int intCount = 0;
            if (!int.TryParse(count, out intCount) || intCount < 0) intCount = 0;

            if (intCount <= 0) intCount = 1000;
            
            string url = APIURL + "/users/" + (string.IsNullOrEmpty(userId) ? "self" : userId) +
                "/media/recent/?access_token=" + accessToken +
                (!string.IsNullOrEmpty(minId) ? "&min_id=" + minId : "") +
                (!string.IsNullOrEmpty(maxId) ? "&max_id=" + maxId : "") +
                (intCount > 0 ? "&count=" + intCount.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Media -> /media/[MEDIA-ID] (GET)
        //endpoint: Media -> /media/shortcode/[SHORTCODE] (GET)
        //parameter mediaIdOrShorcode can be media-id or shortcode and the function can determine that whichone is used
        public static bool media(ref string res, string accessToken, string mediaIdOrShortcode)
        {
            //we determine that the parameter is media-id or shortcode by calculation of percentage of number characters
            int numbersCount = (new System.Text.RegularExpressions.Regex("[0-9]")).Matches(mediaIdOrShortcode).Count;
            bool isShortcode = ((float)numbersCount / (float)mediaIdOrShortcode.Length) < 0.5;

            string url = APIURL + "/media/" + (isShortcode ? "shortcode/" : string.Empty) +
                Uri.EscapeDataString(mediaIdOrShortcode) + "?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Users -> /users/search (GET)
        public static bool search_users(ref string res, string accessToken, string query, string count)
        {
            if (string.IsNullOrEmpty(query))
            {
                res = "{}";
                return true;
            }

            int intCount = 0;
            if (!int.TryParse(count, out intCount) || intCount < 0) intCount = 0;

            string url = APIURL + "/users/search?q=" +
                Uri.EscapeDataString(query) + "&access_token=" + accessToken +
                (intCount > 0 ? "&count=" + intCount.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Relationships -> /users/self/follows (GET)
        public static bool follows(ref string res, string accessToken)
        {
            string url = APIURL + "/users/self/follows?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Relationships -> /users/self/followed-by (GET)
        public static bool followed_by(ref string res, string accessToken)
        {
            string url = APIURL + "/users/self/followed-by?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Relationships -> /users/self/requested-by (GET)
        public static bool requested_by(ref string res, string accessToken)
        {
            string url = APIURL + "/users/self/requested-by?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Relationships -> /users/[USER-ID]/relationship (GET)
        public static bool relationship(ref string res, string accessToken, string userId)
        {
            string url = APIURL + "/users/" + userId + "/relationship?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Relationships -> /users/[USER-ID]/relationship (POST)
        public static bool modify_relationship(ref string res, string accessToken, string userId, string action)
        {
            string url = APIURL + "/users/" + userId + "/relationship";

            NameValueCollection queryParams = new NameValueCollection();

            queryParams.Add("access_token", accessToken);
            queryParams.Add("action", action);

            return call_api(ref res, accessToken, url, queryParams, true);
        }

        //endpoint: Media -> /media/search (GET)
        public static bool search_media(ref string res, string accessToken, 
            string latitude, string longitude, string distance)
        {
            double val = 0;

            if (string.IsNullOrEmpty(latitude) || !double.TryParse(latitude, out val)) latitude = null;
            if (string.IsNullOrEmpty(longitude) || !double.TryParse(longitude, out val)) longitude = null;

            int intDistance = 0;
            if (!int.TryParse(distance, out intDistance) || intDistance < 0) intDistance = 1000;
            if (intDistance > MAX_MEDIA_RADIUS) intDistance = MAX_MEDIA_RADIUS;

            string url = APIURL + "/media/search?access_token=" + accessToken +
                (latitude != null && longitude != null ? "&lat=" + latitude : "") +
                (latitude != null && longitude != null ? "&lng=" + longitude : "") +
                (intDistance > 0 ? "&distance=" + intDistance.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Comments -> /media/[MEDIA-ID]/comments (GET)
        public static bool comments(ref string res, string accessToken, string mediaId)
        {
            string url = APIURL + "/media/" + mediaId + "/comments?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Comments -> /media/[MEDIA-ID]/comments (POST)
        public static bool send_comment(ref string res, string accessToken, string mediaId, string text)
        {
            string url = APIURL + "/media/" + mediaId + "/comments";

            NameValueCollection queryParams = new NameValueCollection();

            queryParams.Add("access_token", accessToken);
            queryParams.Add("text", text);

            return call_api(ref res, accessToken, url, queryParams, true);
        }

        //endpoint: Users -> /users/self/media/liked (GET)
        public static bool liked(ref string res, string accessToken, string maxId, string count)
        {
            int intCount = 0;
            if (!int.TryParse(count, out intCount) || intCount < 0) intCount = 0;

            string url = APIURL + "/users/self/media/liked?access_token=" + accessToken +
                (!string.IsNullOrEmpty(maxId) ? "&max_like_id=" + maxId : "") +
                (intCount > 0 ? "&count=" + intCount.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Likes -> /media/[MEDIA-ID]/likes (GET)
        public static bool likes(ref string res, string accessToken, string mediaId)
        {
            string url = APIURL + "/media/" + mediaId + "/likes?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Likes -> /media/[MEDIA-ID]/likes (POST)
        public static bool like(ref string res, string accessToken, string mediaId)
        {
            string url = APIURL + "/media/" + mediaId + "/likes?access_token=" + accessToken;
            return call_api(ref accessToken, res, url, post: true);
        }

        //endpoint: Tags -> /tags/[TAG-NAME] (GET)
        public static bool tag(ref string res, string accessToken, string tagName)
        {
            string url = APIURL + "/tags/" + tagName + "?access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Tags -> /tags/search (GET)
        public static bool search_tags(ref string res, string accessToken, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                res = "{}";
                return true;
            }
            
            string url = APIURL + "/tags/search?q=" +
                Uri.EscapeDataString(query) + "&access_token=" + accessToken;
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Tags -> /taga/[TAG-NAME]/media/recent (GET)
        public static bool tag_media(ref string res, string accessToken, string tagName, 
            string maxTagId, string minTagId, string count)
        {
            if (string.IsNullOrEmpty(tagName))
            {
                res = "{}";
                return true;
            }

            int intCount = 0;
            if (!int.TryParse(count, out intCount) || intCount < 0) intCount = 0;

            if (intCount <= 0) intCount = 100;

            string url = APIURL + "/tags/" + tagName + "/media/recent?access_token=" + accessToken +
                (!string.IsNullOrEmpty(maxTagId) ? "&max_tag_id=" + maxTagId : "") +
                (!string.IsNullOrEmpty(minTagId) ? "&min_tag_id=" + minTagId : "") +
                (intCount > 0 ? "&count=" + intCount.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Locations -> /locations/search (GET)
        public static bool search_locations(ref string res, string accessToken, 
            string latitude, string longitude, string distance)
        {
            double val = 0;

            if (string.IsNullOrEmpty(latitude) || !double.TryParse(latitude, out val)) latitude = null;
            if (string.IsNullOrEmpty(longitude) || !double.TryParse(longitude, out val)) longitude = null;

            int intDistance = 0;
            if (!int.TryParse(distance, out intDistance) || intDistance < 0) intDistance = 500;
            if (intDistance > MAX_LOCATIONS_RADIUS) intDistance = MAX_LOCATIONS_RADIUS;

            string url = APIURL + "/locations/search?access_token=" + accessToken +
                (latitude != null && longitude != null ? "&lat=" + latitude : "") +
                (latitude != null && longitude != null ? "&lng=" + longitude : "") +
                (intDistance > 0 ? "&distance=" + intDistance.ToString() : "");
            return call_api(ref res, accessToken, url, post: false);
        }

        //endpoint: Locations -> /locations/[LOCATION-ID]/media/recent
        public static bool location_media(ref string res, string accessToken, 
            string locationId, string maxId, string minId)
        {
            string url = APIURL + "/locations/" + locationId + "/media/recent?access_token=" + accessToken +
                (!string.IsNullOrEmpty(maxId) ? "&max_id=" + maxId : "") +
                (!string.IsNullOrEmpty(minId) ? "&min_id=" + minId : "");
            return call_api(ref res, accessToken, url, post: false);
        }
    }
}