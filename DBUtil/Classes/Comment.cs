using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class Comment
    {
        public string CommentID;
        public string Text;
        public DateTime? CreationTime;
        public User Sender;

        public Comment() {
            Sender = new DBUtil.User();
        }
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();
            
            if (!string.IsNullOrEmpty(CommentID)) dic["id"] = CommentID;
            if (!string.IsNullOrEmpty(Text)) dic["text"] = Text;
            if (CreationTime.HasValue) dic["creation_time"] = PublicMethods.to_unix_timestamp(CreationTime.Value);
            if (Sender != null && !string.IsNullOrEmpty(Sender.UserID)) dic["sender"] = Sender.toDictionary();
            
            return dic;
        }

        public static Comment parse_insta_object(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("id") || !obj.ContainsKey("text")) return null;

                Dictionary<string, object> sender = obj.ContainsKey("from") && obj["from"] != null ?
                    (Dictionary<string, object>)obj["from"] : new Dictionary<string, object>();

                string commentId = (string)obj["id"];
                string text = (string)obj["text"];

                string userId = (string)sender["id"];
                string username = (string)sender["username"];
                string fullname = sender.ContainsKey("full_name") ? (string)sender["full_name"] : string.Empty;
                string imageUrl = sender.ContainsKey("profile_picture") ? (string)sender["profile_picture"] : string.Empty;

                double timeStamp = 0;
                DateTime? creationTime = null;
                if (obj.ContainsKey("created_time") && double.TryParse((string)obj["created_time"], out timeStamp))
                    creationTime = PublicMethods.from_unix_timestamp(timeStamp);
                if (!creationTime.HasValue) return null;

                Comment c = new DBUtil.Comment()
                {
                    CommentID = commentId,
                    Text = text,
                    CreationTime = creationTime,
                    Sender = new User()
                    {
                        UserID = userId,
                        UserName = username,
                        FullName = fullname,
                        ImageURL = imageUrl
                    }
                };
                
                return c;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramComment", ex);
                return null;
            }
        }

        public static List<Comment> parse_insta_response(string res)
        {
            try
            {
                List<Comment> ret = new List<DBUtil.Comment>();

                Dictionary<string, object> dic = PublicMethods.fromJSON((string)res);
                if (!dic.ContainsKey("data") || dic["data"] == null) return new List<DBUtil.Comment>();

                Comment c = null;

                if (dic["data"].GetType() == typeof(Dictionary<string, object>) &&
                    (c = parse_insta_object((Dictionary<string, object>)dic["data"])) != null) ret.Add(c);
                else if (dic["data"].GetType() == typeof(ArrayList))
                {
                    ArrayList lst = (ArrayList)dic["data"];

                    for (int i = 0; i < lst.Count; ++i)
                        if ((c = parse_insta_object((Dictionary<string, object>)lst[i])) != null) ret.Add(c);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramCommentsResponse", ex);
                return new List<DBUtil.Comment>();
            }
        }
    }
}
