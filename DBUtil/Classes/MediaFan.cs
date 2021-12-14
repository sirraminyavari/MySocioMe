using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class MediaFan
    {
        public string MediaID;
        public string UserID;
        public bool? Liked;
        public bool? Commented;
        
        public Dictionary<string, object> toDictionary() {
            Dictionary<string, object> dic = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(MediaID)) dic["media_id"] = MediaID;
            if (!string.IsNullOrEmpty(UserID)) dic["user_id"] = UserID;
            if (Liked.HasValue) dic["liked"] = Liked.Value;
            if (Commented.HasValue) dic["commented"] = Commented.Value;
            
            return dic;
        }
    }
}
