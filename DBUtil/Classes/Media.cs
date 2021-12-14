using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class Media
    {
        public string MediaID;
        public User Sender;
        public string Type;
        public DateTime? CreationTime;
        public int? Likes;
        public int? Comments;
        public string LocationID;
        public string LocationName;
        public double? Latitude;
        public double? Longitude;
        public string Caption;
        public string ImageURL;
        public string VideoURL;
        public List<string> TagNames;

        public Media() {
            Sender = new DBUtil.User();
            TagNames = new List<string>();
        }

        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(MediaID)) dic["media_id"] = MediaID;
            if (Sender != null && !string.IsNullOrEmpty(Sender.UserID)) dic["sender"] = Sender.toDictionary();
            if (!string.IsNullOrEmpty(Type)) dic["type"] = Type;
            if (CreationTime.HasValue) dic["creation_time"] = PublicMethods.to_unix_timestamp(CreationTime.Value);
            if (Likes.HasValue && Likes.Value > 0) dic["likes_count"] = Likes.Value;
            if (Comments.HasValue && Comments.Value > 0) dic["comments_count"] = Comments.Value;
            if (!string.IsNullOrEmpty(Caption)) dic["caption"] = Caption;
            if (!string.IsNullOrEmpty(ImageURL)) dic["image_url"] = ImageURL;
            if (!string.IsNullOrEmpty(VideoURL)) dic["video_url"] = VideoURL;

            if (!string.IsNullOrEmpty(LocationID))
            {
                Dictionary<string, object> location = new Dictionary<string, object>();

                location["id"] = LocationID;
                if (!string.IsNullOrEmpty(LocationName)) location["name"] = LocationName;
                if (Latitude.HasValue) location["latitude"] = Latitude.Value;
                if (Longitude.HasValue) location["longitude"] = Longitude.Value;

                dic["location"] = location;
            }

            if (TagNames != null && TagNames.Count > 0) {
                ArrayList tags = new ArrayList();
                foreach (string t in TagNames) tags.Add(t);
                dic["tags"] = tags;
            }
            
            return dic;
        }

        public static Media parse_insta_object(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("id") || !obj.ContainsKey("type")) return null;


                User user = obj.ContainsKey("user") && obj["user"] != null ?
                    User.parse_insta_object((Dictionary<string, object>)obj["user"]) : new User();

                if (user == null || string.IsNullOrEmpty(user.UserID)) return null;

                Dictionary<string, object> likes = obj.ContainsKey("likes") && obj["likes"] != null ?
                    (Dictionary<string, object>)obj["likes"] : new Dictionary<string, object>();

                Dictionary<string, object> comments = obj.ContainsKey("comments") && obj["comments"] != null ?
                    (Dictionary<string, object>)obj["comments"] : new Dictionary<string, object>();

                Dictionary<string, object> location = obj.ContainsKey("location") && obj["location"] != null ?
                    (Dictionary<string, object>)obj["location"] : new Dictionary<string, object>();

                Dictionary<string, object> caption = obj.ContainsKey("caption") && obj["caption"] != null ?
                    (Dictionary<string, object>)obj["caption"] : new Dictionary<string, object>();

                Dictionary<string, object> image = obj.ContainsKey("images") && obj["images"] != null ?
                    (Dictionary<string, object>)obj["images"] : new Dictionary<string, object>();
                image = image.ContainsKey("standard_resolution") && image["standard_resolution"] != null ?
                    (Dictionary<string, object>)image["standard_resolution"] : new Dictionary<string, object>();

                Dictionary<string, object> video = obj.ContainsKey("videos") && obj["videos"] != null ?
                    (Dictionary<string, object>)obj["videos"] : new Dictionary<string, object>();
                video = video.ContainsKey("standard_resolution") && video["standard_resolution"] != null ?
                    (Dictionary<string, object>)video["standard_resolution"] : new Dictionary<string, object>();

                string mediaId = (string)obj["id"];
                string type = (string)obj["type"];

                double timeStamp = 0;
                DateTime? creationTime = null;
                if (obj.ContainsKey("created_time") && double.TryParse((string)obj["created_time"], out timeStamp))
                    creationTime = PublicMethods.from_unix_timestamp(timeStamp);
                if (!creationTime.HasValue) return null;

                int likesCount = likes.ContainsKey("count") ? (int)likes["count"] : 0;
                int commentsCount = comments.ContainsKey("count") ? (int)comments["count"] : 0;
                string locationId = location.ContainsKey("id") ? location["id"].ToString() : null;
                string locationName = location.ContainsKey("name") ? location["name"].ToString() : null;
                double? latitude = null, longitude = null;
                double d = 0;
                if (location.ContainsKey("latitude") && double.TryParse(location["latitude"].ToString(), out d))
                    latitude = d;
                if (location.ContainsKey("longitude") && double.TryParse(location["longitude"].ToString(), out d))
                    longitude = d;
                string captionText = caption.ContainsKey("text") ? (string)caption["text"] : null;
                string imageUrl = image.ContainsKey("url") ? (string)image["url"] : null;
                string videoUrl = video.ContainsKey("url") ? (string)video["url"] : null;

                Media m = new DBUtil.Media()
                {
                    MediaID = mediaId,
                    Sender = user,
                    Type = type,
                    CreationTime = creationTime.Value,
                    Likes = likesCount,
                    Comments = commentsCount,
                    LocationID = locationId,
                    LocationName = locationName,
                    Latitude = latitude,
                    Longitude = longitude,
                    Caption = captionText,
                    ImageURL = imageUrl,
                    VideoURL = videoUrl
                };

                if (obj.ContainsKey("tags"))
                    m.TagNames = ((ArrayList)obj["tags"]).ToArray().Select(u => (string)u).ToList();

                return m;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramMedia", ex);
                return null;
            }
        }

        public static List<Media> parse_insta_response(string res, ref string nextMinId, ref string nextMaxId)
        {
            try
            {
                nextMinId = nextMaxId = string.Empty;

                List<Media> ret = new List<DBUtil.Media>();

                Dictionary<string, object> dic = PublicMethods.fromJSON((string)res);

                if (dic.ContainsKey("pagination") && dic["pagination"] != null)
                {
                    Dictionary<string, object> pagination = (Dictionary<string, object>)dic["pagination"];
                    if (pagination.ContainsKey("next_min_id")) nextMinId = (string)pagination["next_min_id"];
                    if (pagination.ContainsKey("next_max_id")) nextMaxId = (string)pagination["next_max_id"];
                }

                if (!dic.ContainsKey("data") || dic["data"] == null) return new List<DBUtil.Media>();

                Media m = null;

                if (dic["data"].GetType() == typeof(Dictionary<string, object>) &&
                    (m = parse_insta_object((Dictionary<string, object>)dic["data"])) != null) ret.Add(m);
                else if (dic["data"].GetType() == typeof(ArrayList))
                {
                    ArrayList lst = (ArrayList)dic["data"];

                    for (int i = 0; i < lst.Count; ++i)
                        if ((m = parse_insta_object((Dictionary<string, object>)lst[i])) != null) ret.Add(m);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramMediaResponse", ex);
                return new List<DBUtil.Media>();
            }
        }

        public static List<Media> parse_insta_response(string res)
        {
            string nextMinId = string.Empty, nextMaxId = string.Empty;
            return parse_insta_response(res, ref nextMinId, ref nextMaxId);
        }
    }
}
