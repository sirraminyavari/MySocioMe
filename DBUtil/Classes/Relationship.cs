using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class Relationship
    {
        public string UserID;
        public string OutgoingStatus;
        public string IncomingStatus;
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(UserID)) dic["user_id"] = UserID;
            if (!string.IsNullOrEmpty(OutgoingStatus)) dic["outgoing_status"] = OutgoingStatus;
            if (!string.IsNullOrEmpty(IncomingStatus)) dic["incoming_status"] = IncomingStatus;
            
            return dic;
        }

        public static Relationship parse_insta_object(Dictionary<string, object> obj)
        {
            try
            {
                if (obj == null || !obj.ContainsKey("outgoing_status")) return null;
                
                string outgoingStatus = obj.ContainsKey("outgoing_status") ? (string)obj["outgoing_status"] : null;
                string incomingStatus = obj.ContainsKey("incoming_status") ? (string)obj["incoming_status"] : null;

                Relationship r = new DBUtil.Relationship() {
                    OutgoingStatus = outgoingStatus,
                    IncomingStatus = incomingStatus
                };
                
                return r;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramRelationship", ex);
                return null;
            }
        }

        public static List<Relationship> parse_insta_response(string res)
        {
            try
            {
                List<Relationship> ret = new List<DBUtil.Relationship>();

                Dictionary<string, object> dic = PublicMethods.fromJSON((string)res);
                if (!dic.ContainsKey("data") || dic["data"] == null) return new List<DBUtil.Relationship>();

                Relationship r = null;

                if (dic["data"].GetType() == typeof(Dictionary<string, object>) &&
                    (r = parse_insta_object((Dictionary<string, object>)dic["data"])) != null) ret.Add(r);
                else if (dic["data"].GetType() == typeof(ArrayList))
                {
                    ArrayList lst = (ArrayList)dic["data"];

                    for (int i = 0; i < lst.Count; ++i)
                        if ((r = parse_insta_object((Dictionary<string, object>)lst[i])) != null) ret.Add(r);
                }

                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, "ParseInstagramRelationshipsResponse", ex);
                return new List<DBUtil.Relationship>();
            }
        }
    }
}
