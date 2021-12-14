using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class IPGLog
    {
        public string Action;
        public string UserID;
        public string DeviceID;
        public string DeviceModel;
        public string TargetUserID;
        public DateTime? Time;

        private static List<IPGLog> _parse_bulk(string userId, string data, ref List<User> users) {
            try
            {
                List<IPGLog> lst = new List<IPGLog>();

                Dictionary<string, object> dic = PublicMethods.fromJSON(Base64.decode(data));
                ArrayList items = dic != null && dic.ContainsKey("items") ? (ArrayList)dic["items"] : new ArrayList();

                for (int i = 0, lnt = items.Count; i < lnt; ++i)
                {
                    Dictionary<string, object> obj = (Dictionary<string, object>)items[i];

                    string action = obj.ContainsKey("action") ? (string)obj["action"] : null;
                    string deviceId = obj.ContainsKey("device_id") ? (string)obj["device_id"] : null;
                    string deviceModel = obj.ContainsKey("device_model") ? Base64.decode((string)obj["device_model"]) : null;
                    string usersParam = obj.ContainsKey("users") ? Base64.decode((string)obj["users"]) : string.Empty;
                    DateTime? time = null;

                    string unixTime = obj.ContainsKey("time") ? (string)obj["time"] : null;
                    if (!string.IsNullOrEmpty(unixTime))
                    {
                        double dtime = 0;
                        if (double.TryParse(unixTime, out dtime)) time = PublicMethods.from_unix_timestamp(dtime);
                    }

                    if (!time.HasValue) time = DateTime.UtcNow;

                    if (string.IsNullOrEmpty(action)) continue;
                    if (string.IsNullOrEmpty(deviceId)) deviceId = null;
                    if (string.IsNullOrEmpty(deviceModel)) deviceModel = null;

                    List<User> usersList = User.parse_insta_response(usersParam);
                    if (usersList.Count > 0)
                    {
                        foreach (User u in usersList)
                            if (!users.Any(x => x.UserID == u.UserID)) users.Add(u);
                    }

                    if (usersList.Count == 0)
                    {
                        lst.Add(new IPGLog()
                        {
                            Action = action,
                            UserID = userId,
                            DeviceID = deviceId,
                            DeviceModel = deviceModel,
                            Time = time.Value
                        });
                    }
                    else
                    {
                        foreach (User u in usersList)
                        {
                            lst.Add(new IPGLog()
                            {
                                Action = action,
                                UserID = userId,
                                DeviceID = deviceId,
                                DeviceModel = deviceModel,
                                TargetUserID = u.UserID,
                                Time = time.Value
                            });
                        }
                    }
                }

                return lst;
            }
            catch { return new List<DBUtil.IPGLog>(); }
        }

        public static List<IPGLog> parse_request(string userId, NameValueCollection p, ref List<User> users)
        {
            try
            {
                List<IPGLog> lst = new List<DBUtil.IPGLog>();

                if (string.IsNullOrEmpty(userId)) userId = null;

                if (!string.IsNullOrEmpty(p["data"])) return _parse_bulk(userId, p["data"], ref users);

                string action = p["action"];
                string deviceId = p["device_id"];
                string deviceModel = Base64.decode(p["device_model"]);
                string usersParam = Base64.decode(p["users"]);
                DateTime? time = null;

                string unixTime = p["time"];
                if (!string.IsNullOrEmpty(unixTime)) {
                    double dtime = 0;
                    if (double.TryParse(unixTime, out dtime)) time = PublicMethods.from_unix_timestamp(dtime);
                }
                
                if (!time.HasValue) time = DateTime.UtcNow;

                if (string.IsNullOrEmpty(action)) return lst;
                if (string.IsNullOrEmpty(deviceId)) deviceId = null;
                if (string.IsNullOrEmpty(deviceModel)) deviceModel = null;

                users = User.parse_insta_response(usersParam);

                if (users.Count == 0)
                {
                    lst.Add(new IPGLog()
                    {
                        Action = action,
                        UserID = userId,
                        DeviceID = deviceId,
                        DeviceModel = deviceModel,
                        Time = time.Value
                    });
                }
                else
                {
                    foreach (User u in users)
                    {
                        lst.Add(new IPGLog()
                        {
                            Action = action,
                            UserID = userId,
                            DeviceID = deviceId,
                            DeviceModel = deviceModel,
                            TargetUserID = u.UserID,
                            Time = time.Value
                        });
                    }
                }

                return lst;
            }
            catch { return new List<DBUtil.IPGLog>(); }
        }
    }
}
