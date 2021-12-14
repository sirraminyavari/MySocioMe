using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class Follow
    {
        public User Followed;
        public User Following;

        public Follow()
        {
            Followed = new DBUtil.User();
            Following = new DBUtil.User();
        }
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (Followed != null && !string.IsNullOrEmpty(Followed.UserID)) dic["followed"] = Followed.toDictionary();
            if (Following != null && !string.IsNullOrEmpty(Following.UserID)) dic["following"] = Following.toDictionary();
            
            return dic;
        }
    }
}
