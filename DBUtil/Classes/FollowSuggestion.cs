using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class FollowSuggestion
    {
        public User User;
        public User Suggested;
        public long? LocationID;

        public FollowSuggestion()
        {
            User = new DBUtil.User();
            Suggested = new DBUtil.User();
        }
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (User != null && !string.IsNullOrEmpty(User.UserID)) dic["user"] = User.toDictionary();
            if (Suggested != null && !string.IsNullOrEmpty(Suggested.UserID)) dic["suggested"] = Suggested.toDictionary();
            if (LocationID.HasValue) dic["location_id"] = LocationID.Value;
            
            return dic;
        }
    }
}
