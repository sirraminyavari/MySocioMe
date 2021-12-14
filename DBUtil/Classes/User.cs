using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class User
    {
        public string UserID;
        public string UserName;
        public string FullName;
        public string Biography;
        public string Website;
        public int? Media;
        public int? Follows;
        public int? Followers;
        public bool? Private;
        public string Code;
        public string Token;
        public string LocalToken;
        public string ImageURL;
        public bool? Bookmarked;
        public string Alias;
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();
            
            if (!string.IsNullOrEmpty(UserID)) dic["id"] = UserID;
            if (!string.IsNullOrEmpty(UserName)) dic["username"] = UserName;
            if (!string.IsNullOrEmpty(FullName)) dic["full_name"] = FullName;
            if (!string.IsNullOrEmpty(Biography)) dic["bio"] = Biography;
            if (!string.IsNullOrEmpty(Website)) dic["website"] = Website;
            if (Media.HasValue && Media.Value > 0) dic["media"] = Media.Value;
            if (Follows.HasValue && Follows.Value > 0) dic["follows"] = Follows.Value;
            if (Followers.HasValue && Followers.Value > 0) dic["followers"] = Followers.Value;
            if (Private.HasValue) dic["private"] = Private.Value;
            if (!string.IsNullOrEmpty(ImageURL)) dic["image_url"] = ImageURL;
            if (Bookmarked.HasValue) dic["bookmarked"] = Bookmarked.Value;
            if (!string.IsNullOrEmpty(Alias)) dic["alias"] = Alias;

            return dic;
        }

        public static User parse_insta_object(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("id") || !obj.ContainsKey("username")) return null;

                Dictionary<string, object> counts = obj.ContainsKey("counts") && obj["counts"] != null ?
                    (Dictionary<string, object>)obj["counts"] : new Dictionary<string, object>();

                string userId = (string)obj["id"];
                string username = (string)obj["username"];
                string fullname = obj.ContainsKey("full_name") ? (string)obj["full_name"] : null;
                string imageUrl = obj.ContainsKey("profile_picture") ? (string)obj["profile_picture"] : null;
                string biography = obj.ContainsKey("bio") ? (string)obj["bio"] : null;
                string website = obj.ContainsKey("website") ? (string)obj["website"] : null;

                int? media = null, follows = null, followers = null;

                if (counts.ContainsKey("media")) media = (int)counts["media"];
                if (counts.ContainsKey("follows")) follows = (int)counts["follows"];
                if (counts.ContainsKey("followed_by")) followers = (int)counts["followed_by"];
                
                User u = new DBUtil.User()
                {
                    UserID = userId,
                    UserName = username,
                    FullName = fullname,
                    Biography = biography,
                    Website = website,
                    Media = media,
                    Follows = follows,
                    Followers = followers,
                    ImageURL = imageUrl
                };
                
                return u;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramUser", ex);
                return null;
            }
        }

        public static List<User> parse_insta_response(string res)
        {
            try
            {
                List<User> ret = new List<DBUtil.User>();

                Dictionary<string, object> dic = PublicMethods.fromJSON((string)res);
                if (!dic.ContainsKey("data") || dic["data"] == null) return new List<DBUtil.User>();

                User u = null;

                if (dic["data"].GetType() == typeof(Dictionary<string, object>) &&
                    (u = parse_insta_object((Dictionary<string, object>)dic["data"])) != null) ret.Add(u);
                else if (dic["data"].GetType() == typeof(ArrayList))
                {
                    ArrayList lst = (ArrayList)dic["data"];

                    for (int i = 0; i < lst.Count; ++i)
                        if ((u = parse_insta_object((Dictionary<string, object>)lst[i])) != null) ret.Add(u);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramUsersResponse", ex);
                return new List<DBUtil.User>();
            }
        }
    }
}
