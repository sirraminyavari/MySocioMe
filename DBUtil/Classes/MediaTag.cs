using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class MediaTag
    {
        public string MediaID;
        public long? TagID;
        public string Name;
        public int? MediaCount;
        public bool? Bookmarked;

        public Dictionary<string, object> toDictionary()
        {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (TagID.HasValue) dic["id"] = TagID.Value;
            if (!string.IsNullOrEmpty(MediaID)) dic["media_id"] = MediaID;
            if (!string.IsNullOrEmpty(Name)) dic["name"] = Name;
            if (MediaCount.HasValue) dic["media_count"] = MediaCount.Value;
            if (Bookmarked.HasValue) dic["bookmarked"] = Bookmarked.Value;
            
            return dic;
        }

        public static MediaTag parse_insta_object(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("name")) return null;
                
                string name = (string)obj["name"];
                int mediaCount = obj.ContainsKey("media_count") ? (int)obj["media_count"] : 0;

                MediaTag t = new DBUtil.MediaTag
                {
                    Name = name,
                    MediaCount = mediaCount
                };

                if (obj.ContainsKey("id")) t.TagID = long.Parse(obj["id"].ToString());

                return t;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramTag", ex);
                return null;
            }
        }

        public static List<MediaTag> parse_insta_response(string res)
        {
            try
            {
                List<MediaTag> ret = new List<DBUtil.MediaTag>();

                Dictionary<string, object> dic = PublicMethods.fromJSON((string)res);
                if (!dic.ContainsKey("data") || dic["data"] == null) return new List<DBUtil.MediaTag>();

                MediaTag t = null;

                if (dic["data"].GetType() == typeof(Dictionary<string, object>) &&
                    (t = parse_insta_object((Dictionary<string, object>)dic["data"])) != null) ret.Add(t);
                else if (dic["data"].GetType() == typeof(ArrayList))
                {
                    ArrayList lst = (ArrayList)dic["data"];

                    for (int i = 0; i < lst.Count; ++i)
                        if ((t = parse_insta_object((Dictionary<string, object>)lst[i])) != null) ret.Add(t);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramTagsResponse", ex);
                return new List<DBUtil.MediaTag>();
            }
        }
    }
}
