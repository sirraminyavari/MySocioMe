using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class BookmarkedLocation
    {
        public long? ID;
        public string UserID;
        public string Name;
        public string Alias;
        public double? Latitude;
        public double? Longitude;
        public int? Radius;
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (ID.HasValue && ID.Value > 0) dic["id"] = ID.Value;
            if (!string.IsNullOrEmpty(UserID)) dic["user_id"] = UserID;
            if (!string.IsNullOrEmpty(Name)) dic["name"] = Name;
            if (!string.IsNullOrEmpty(Alias)) dic["alias"] = Alias;
            if (Latitude.HasValue) dic["latitude"] = Latitude.Value;
            if (Longitude.HasValue) dic["longitude"] = Longitude.Value;
            if (Radius.HasValue && Radius.Value > 0) dic["radius"] = Radius.Value;

            return dic;
        }

        public static BookmarkedLocation parse_dictionary(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("latitude") || !obj.ContainsKey("longitude")) return null;

                BookmarkedLocation location = new BookmarkedLocation() {
                    Latitude = double.Parse(obj["latitude"].ToString()),
                    Longitude = double.Parse(obj["longitude"].ToString())
                };

                if (obj.ContainsKey("id")) location.ID = long.Parse(obj["id"].ToString());
                if (obj.ContainsKey("name")) location.Name = (string)obj["name"];
                if (obj.ContainsKey("alias")) location.Alias = (string)obj["alias"];
                if (obj.ContainsKey("radius")) location.Radius = (int)obj["radius"];

                return location;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseBookmarkedLocation", ex);
                return null;
            }
        }
    }
}
