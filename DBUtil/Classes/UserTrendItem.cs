using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class UserTrendItem
    {
        public string UserID;
        public DateTime? Time;
        public int? Media;
        public int? Follows;
        public int? Followers;
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();
            
            if (!string.IsNullOrEmpty(UserID)) dic["id"] = UserID;
            if (Time.HasValue) dic["time"] = PublicMethods.to_unix_timestamp(Time.Value);
            if (Media.HasValue && Media.Value > 0) dic["media"] = Media.Value;
            if (Follows.HasValue && Follows.Value > 0) dic["follows"] = Follows.Value;
            if (Followers.HasValue && Followers.Value > 0) dic["followers"] = Followers.Value;

            return dic;
        }
    }
}
