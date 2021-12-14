using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class Category
    {
        public long? ID;
        public string UserID;
        public string Name;
        public int? LikesMin;
        public bool? SimilarTags;
        public List<MediaTag> Tags;
        public List<BookmarkedLocation> Locations;

        public Category() {
            Tags = new List<MediaTag>();
            Locations = new List<BookmarkedLocation>();
        }
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (ID.HasValue && ID.Value > 0) dic["id"] = ID.Value;
            if (!string.IsNullOrEmpty(UserID)) dic["user_id"] = UserID;
            if (!string.IsNullOrEmpty(Name)) dic["name"] = Name;
            if (LikesMin.HasValue && LikesMin.Value > 0) dic["likes_min"] = LikesMin.Value;
            if (SimilarTags.HasValue) dic["similar_tags"] = SimilarTags.Value;
            if(Tags != null) dic["tags"] = new ArrayList(Tags.Select(u => u.toDictionary()).ToList());
            if (Locations != null) dic["locations"] = new ArrayList(Locations.Select(u => u.toDictionary()).ToList());
            
            return dic;
        }

        public static Category parse_dictionary(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("name")) return null;

                Category cat = new DBUtil.Category() {
                    Name = (string)obj["name"]
                };

                if (obj.ContainsKey("id")) cat.ID = long.Parse(obj["id"].ToString());
                if (obj.ContainsKey("user_id")) cat.UserID = (string)obj["user_id"];
                if (obj.ContainsKey("likes_min")) cat.LikesMin = (int)obj["likes_min"];
                if (obj.ContainsKey("similar_tags")) cat.SimilarTags = (bool)obj["similar_tags"];

                if (obj.ContainsKey("tags"))
                {
                    foreach (Dictionary<string, object> itm in (ArrayList)obj["tags"])
                    {
                        MediaTag tg = MediaTag.parse_insta_object(itm);
                        if (tg != null) cat.Tags.Add(tg);
                    }
                }

                if (obj.ContainsKey("locations"))
                {
                    foreach (Dictionary<string, object> itm in (ArrayList)obj["locations"])
                    {
                        BookmarkedLocation loc = BookmarkedLocation.parse_dictionary(itm);
                        if (loc != null) cat.Locations.Add(loc);
                    }
                }

                return cat;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseCategory", ex);
                return null;
            }
        }
    }
}
