using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Data;
using System.Management;
using System.Security.Cryptography;
using System.IO;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.Script.Serialization;
using System.Net;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Threading;
using System.Xml;
using System.Drawing;

namespace DBUtil
{
    //^:b*[^:b#/]+.*$ --> use this expression to find out number of code lines within the project

    public enum TextDirection
    {
        None,
        RTL,
        LTR
    }
    
    public class ListMaker
    {
        protected static void _get_string_items(ref string input, ref List<string> lst, char delimiter)
        {
            if (!string.IsNullOrEmpty(input)) input = input.Trim();
            if (string.IsNullOrEmpty(input)) return;
            lst = input.Split(delimiter).ToList();
        }

        public static void get_string_items(string input, ref List<string> lst, char delimiter)
        {
            _get_string_items(ref input, ref lst, delimiter);
        }

        public static List<string> get_string_items(string input, char delimiter)
        {
            List<string> lst = new List<string>();
            _get_string_items(ref input, ref lst, delimiter);
            return lst;
        }

        public static void get_long_items(string input, ref List<long> lstLong, char delimiter)
        {
            List<string> lstString = new List<string>();
            _get_string_items(ref input, ref lstString, delimiter);
            lstLong = lstString.ConvertAll(new Converter<string, long>(Convert.ToInt64));
        }

        public static List<long> get_long_items(string input, char delimiter)
        {
            if (!string.IsNullOrEmpty(input)) input = input.Trim();
            List<long> lst = new List<long>();
            if (string.IsNullOrEmpty(input)) return lst;
            get_long_items(input, ref lst, delimiter);
            return lst;
        }
            
        public static void get_guid_items(string input, ref List<Guid> lstGuid, char delimiter)
        {
            List<string> lstString = new List<string>();

            _get_string_items(ref input, ref lstString, delimiter);

            lstGuid = lstString.ConvertAll(new Converter<string, Guid>(Guid.Parse));
        }

        public static List<Guid> get_guid_items(string input, char delimiter)
        {
            if (!string.IsNullOrEmpty(input)) input = input.Trim();
            List<Guid> lst = new List<Guid>();
            if (string.IsNullOrEmpty(input)) return lst;
            get_guid_items(input, ref lst, delimiter);
            return lst;
        }
    }

    public static class PublicConsts
    {
        public static string LoginPage = "~/login";
        public static string HomePage = "~/home";
    }

    public static class PublicMethods
    {
        public static string get_client_ip(ref HttpRequest req)
        {
            try
            {
                return (req.ServerVariables["HTTP_X_FORWARDED_FOR"] ?? req.ServerVariables["REMOTE_ADDR"]).Split(',')[0].Trim();
            }
            catch { return string.Empty; }
        }

        public static string get_client_ip(HttpContext con)
        {
            HttpRequest req = con.Request;
            return get_client_ip(ref req);
        }

        public static string get_client_host_name(ref HttpRequest req)
        {
            try { return req.UserHostName.Trim(); }
            catch { return string.Empty; }
        }

        public static string get_client_host_name(HttpContext con)
        {
            HttpRequest req = con.Request;
            return get_client_host_name(ref req);
        }

        private static bool _BackingUp = false;

        private static void _backup_database()
        {
            try
            {
                string dbName = ProviderUtil.ConnectionString.Split(';').ToList().Select(u => u.Trim().ToLower()).Where(
                    v => v.IndexOf("database") == 0).FirstOrDefault().Split('=')[1].Trim();

                string persianNow = get_persian_date(DateTime.Now);

                string backupFileName = dbName + "-Full Database Backup-" + persianNow.Replace('/', '-') + ".bak";

                string backupFolder = PublicMethods.map_path("~/App_Data/DB_Backup");
                if (!Directory.Exists(backupFolder)) Directory.CreateDirectory(backupFolder);
                string backupFilePath = backupFolder + "/" + backupFileName;

                if (!System.IO.File.Exists(backupFilePath.Replace("/", "\\")))
                {
                    string cmd = "BACKUP DATABASE [" + dbName + "] TO DISK = N'" + backupFilePath + "' " +
                        "WITH COMPRESSION, NOFORMAT, INIT, NAME = N'" + backupFileName + "', SKIP, NOREWIND, NOUNLOAD, STATS = 10";

                    System.Data.SqlClient.SqlConnection Sqlcon = new System.Data.SqlClient.SqlConnection(ProviderUtil.ConnectionString);
                    System.Data.SqlClient.SqlCommand Sqlcom = new System.Data.SqlClient.SqlCommand(cmd, Sqlcon);
                    try
                    {
                        Sqlcon.Open();
                        Sqlcom.ExecuteNonQuery();
                    }
                    catch { }
                    finally { Sqlcon.Close(); }

                    if (File.Exists(backupFilePath))
                    {
                        backupFilePath = backupFilePath.Replace("/", "\\").ToLower();

                        foreach (string bcFile in Directory.GetFiles(backupFolder))
                            if (bcFile.ToLower() != backupFilePath) File.Delete(bcFile);
                    }
                }
            }
            catch (Exception ex) { }

            _BackingUp = false;
        }

        public static void backup_database()
        {
            if (_BackingUp) return;
            _BackingUp = true;

            new Thread(_backup_database).Start();
        }

        public static void start_db_backup(object rvThread)
        {
            while (true)
            {
                backup_database();
                Thread.Sleep(3600000);
            }
        }
        
        public static string get_persian_date(DateTime? Date, bool detail = false, bool reverse = false)
        {
            if (!Date.HasValue) return string.Empty;

            PersianCalendar PCalendar = new PersianCalendar();

            int _day = PCalendar.GetDayOfMonth(Date.Value);
            int _month = PCalendar.GetMonth(Date.Value);
            int _year = PCalendar.GetYear(Date.Value);

            string Day = (_day < 10 ? "0" : string.Empty) + _day.ToString();
            string Month = (_month < 10 ? "0" : string.Empty) + _month.ToString();
            string Year = _year.ToString();
            string PDate = reverse ? Day + "/" + Month + "/" + Year : Year + "/" + Month + "/" + Day;

            if (detail) PDate = (Date.Value.Hour < 10 ? "0" : string.Empty) + Date.Value.Hour.ToString() + ":" +
                (Date.Value.Minute < 10 ? "0" : string.Empty) + Date.Value.Minute.ToString() + " " + PDate;

            return PDate;
        }

        public static DateTime? persian_to_gregorian_date(int year, int month, int day, int? hour, int? minute, int? second)
        {
            try
            {
                return (new PersianCalendar()).ToDateTime(year, month, day, (hour.HasValue ? hour.Value : 0),
                    (minute.HasValue ? minute.Value : 0), (second.HasValue ? second.Value : 0), 0);
            }
            catch { return null; }
        }

        public static double to_unix_timestamp(DateTime time)
        {
            return time.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;
        }

        public static DateTime? from_unix_timestamp(double timestamp)
        {
            return new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddSeconds(timestamp);
        }

        public static int? parse_int(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            int retVal = 0;
            if (!int.TryParse(input, out retVal)) return null;
            return retVal;
        }

        public static long? parse_long(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            long retVal = 0;
            if (!long.TryParse(input, out retVal)) return null;
            return retVal;
        }

        public static double? parse_double(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            double retVal = 0;
            if (!double.TryParse(input, out retVal)) return null;
            return retVal;
        }

        public static bool? parse_bool(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            return input.ToLower() == "true" || input == "1";
        }

        public static Guid? parse_guid(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            Guid retVal = Guid.Empty;
            if (!Guid.TryParse(input, out retVal)) return null;
            return retVal;
        }

        public static DateTime? parse_date(string input, int days2Add = 0)
        {
            if(!string.IsNullOrEmpty(input)) input = input.Trim();
            if (string.IsNullOrEmpty(input)) return null;

            string[] strDate = (string.IsNullOrEmpty(input) ? string.Empty : input).Split('-');
            
            if (strDate.Length > 2)
            {
                try { return new DateTime(int.Parse(strDate[0]), int.Parse(strDate[1]), int.Parse(strDate[2])); }
                catch {}
            }

            try { return DateTime.Parse(input).AddDays(days2Add); }
            catch { return null; }
        }

        public static string parse_string(string input, bool decode = true)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            return decode ? Uri.UnescapeDataString(input) : input;
        }

        private static Random _RND = new Random((int)DateTime.Now.Ticks);

        public static int get_random_number(int min, int max)
        {
            return _RND.Next(min, max + 1);
        }

        public static int get_random_number(int length = 5)
        {
            return get_random_number((int)Math.Pow(10, (double)length - 1), (int)Math.Pow(10, (double)length) - 1);
        }

        public static string sha1(string input)
        {
            return Convert.ToBase64String(System.Security.Cryptography.HashAlgorithm.Create("SHA1")
                .ComputeHash(Encoding.Unicode.GetBytes(input)));
        }

        public static string fit_number_to_size(int number, int size)
        {
            string retStr = number.ToString();
            while (retStr.Length < size) retStr = "0" + retStr;
            return retStr;
        }
        
        //Arabic - Range: 0600–06FF, Arabic Supplement - Range: 0750–077F, Arabic Presentation Forms-A - Range: FB50–FDFF, Arabic Presentation Forms-B - Range: FE70–FEFF
        private static string RTLCharacters = "\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF";

        public static TextDirection text_direction(string text)
        {
            //ASCII Punctuation - Range: 0000-0020, General Punctuation - Range: 2000-200D
            string controlChars = "\u0000-\u0020\u2000-\u200D*\"'.0-9()$%^&@!#,=?/\\+-:<>|;";

            Regex reRTL = new Regex("^[" + controlChars + "]*[" + RTLCharacters + "]");
            Regex reControl = new Regex("^[" + controlChars + "]*$");

            return reRTL.IsMatch(text) ? TextDirection.RTL : 
                (reControl.IsMatch(text) ? TextDirection.None : TextDirection.LTR);
        }

        public static bool has_rtl_characters(string text)
        {
            return new Regex("[" + RTLCharacters + "]").IsMatch(text);
        }

        public static int rtl_characters_count(string text)
        {
            return new Regex("[" + RTLCharacters + "]").Matches(text).Count;
        }

        private static Dictionary<string, string> NUMBERS_DIC = new Dictionary<string, string>() {
            {"0", "۰" },{"1", "۱" },{"2", "۲" },{"3", "۳" },{"4", "۴" },
            {"5", "۵" },{"6", "۶" },{"7", "۷" },{"8", "۸" },{"9", "۹" }
        };

        public static string convert_numbers_to_persian(string input)
        {
            foreach (string key in NUMBERS_DIC.Keys)
                input = Regex.Replace(input, key, NUMBERS_DIC[key]);
            return input;
            
        }
        
        public static string toJSON(dynamic json, string defaultValue = "")
        {
            if (json == null) return defaultValue;
            try { return new JavaScriptSerializer().Serialize(json); }
            catch { return defaultValue; }
        }

        public static string image_to_base64(Image image, System.Drawing.Imaging.ImageFormat format) {
            if (image == null) return string.Empty;

            using (MemoryStream ms = new MemoryStream())
            {
                image.Save(ms, format);
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        public static Dictionary<string, object> fromJSON(string json)
        {
            if (string.IsNullOrEmpty(json)) return new Dictionary<string, object>();
            try { return new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json); }
            catch { return new Dictionary<string, object>(); }
        }

        public static Dictionary<string, string> json2dictionary(string json)
        {
            if (string.IsNullOrEmpty(json)) return new Dictionary<string, string>();
            try { return new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(json); }
            catch { return new Dictionary<string, string>(); }
        }
        
        public static bool is_email(string emailAddress)
        {
            try
            {
                new System.Net.Mail.MailAddress(emailAddress);
                return true;
            }
            catch { return false; }
        }

        public static bool send_email(string email, string emailSubject, string body,
            string senderEmail, string senderPassword, string senderName, string smtpAddress, int? smtpPort, bool? useSSL)
        {
            try
            {
                if (!is_email(email) || !is_email(senderEmail)) return false;

                using (System.Net.Mail.MailMessage mailObj = new System.Net.Mail.MailMessage())
                {
                    mailObj.From = new System.Net.Mail.MailAddress(senderEmail, senderName);
                    mailObj.To.Add(email);
                    mailObj.Subject = emailSubject;
                    mailObj.Body = body;
                    mailObj.IsBodyHtml = true;
                    mailObj.DeliveryNotificationOptions = System.Net.Mail.DeliveryNotificationOptions.OnSuccess;

                    using (System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient(smtpAddress, smtpPort.Value))
                    {
                        smtp.Credentials = new NetworkCredential(senderEmail, senderPassword);
                        smtp.EnableSsl = useSSL.Value;
                        smtp.Timeout = 20000;
                        smtp.Send(mailObj);
                    }
                }
            }
            catch (Exception ex) { return false; }

            return true;
        }

        public static bool send_email(string email, string emailSubject, string body)
        {
            return send_email(email, emailSubject, body, null, null, null, null, null, null);
        }

        public static bool send_email(string email, string body)
        {
            return send_email(email, null, body);
        }
        
        public static string map_path(string path)
        {
            return System.Web.Hosting.HostingEnvironment.MapPath(path);
        }
        
        public static string get_exception(Exception ex)
        {
            return ex == null ? string.Empty :
                (ex.InnerException == null || ex.InnerException.Message == null ?
                (string.IsNullOrEmpty(ex.Message) ? ex.ToString() : ex.Message) : ex.InnerException.Message);
        }
        
        public static bool web_request(ref string response, string url, 
            NameValueCollection values = null, bool post = true)
        {
            if (string.IsNullOrEmpty(url)) return false;
            if (values == null) values = new NameValueCollection();

            try
            {
                if (post)
                    response = Encoding.Default.GetString((new WebClient()).UploadValues(url, post ? "POST" : "GET", values));
                else
                {
                    WebRequest request = WebRequest.Create(url);

                    using (Stream objStream = request.GetResponse().GetResponseStream())
                    using (StreamReader objReader = new StreamReader(objStream))
                        response = objReader.ReadToEnd();
                }
            }
            catch (WebException ex)
            {
                try
                {
                    if (ex.Response != null)
                    {
                        using (HttpWebResponse errorResponse = (HttpWebResponse)ex.Response)
                        using (StreamReader reader = new StreamReader(errorResponse.GetResponseStream()))
                            response = reader.ReadToEnd();
                    }
                }
                catch { }

                return false;
            }

            return true;
        }

        public static PageType page_type(User user)
        {
            if (user == null) return PageType.Useless;

            int follows = !user.Follows.HasValue ? 0 : user.Follows.Value;
            int followers = !user.Followers.HasValue ? 0 : user.Followers.Value;
            int mediaCount = !user.Media.HasValue ? 0 : user.Media.Value;

            if (follows > 1000)
                return mediaCount > 10 && followers > (2 * follows) ? PageType.Commercial : PageType.Useless;
            else if (followers > 2000)
                return mediaCount > 10 ? PageType.Commercial : PageType.Useless;
            else
                return PageType.Personal;
        }

        public static string local_token(string token)
        {
            return Base64.encode(PublicMethods.sha1(token)).Replace("/", "").Replace("=", "").Replace("+", "");
        }
    }

    public static class Base64
    {
        public static bool encode(string sourceString, ref string returnString)
        {
            if (string.IsNullOrEmpty(sourceString))
            {
                returnString = string.Empty;
                return true;
            }

            try
            {
                UTF8Encoding encoder = new UTF8Encoding();
                byte[] bytes = encoder.GetBytes(sourceString);
                returnString = Convert.ToBase64String(bytes, 0, bytes.Length);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool encode(ref string returnString)
        {
            return encode(returnString, ref returnString);
        }

        public static string encode(string returnString)
        {
            encode(returnString, ref returnString);
            return returnString;
        }

        public static bool decode(string sourceString, ref string returnString)
        {
            try
            {
                sourceString = sourceString.Replace(' ', '+');

                UTF8Encoding encoder = new UTF8Encoding();
                Decoder utf8Decode = encoder.GetDecoder();

                byte[] toDecodeByte = Convert.FromBase64String(sourceString);
                int charCount = utf8Decode.GetCharCount(toDecodeByte, 0, toDecodeByte.Length);
                char[] decodeChar = new char[charCount];
                utf8Decode.GetChars(toDecodeByte, 0, toDecodeByte.Length, decodeChar, 0);

                returnString = new String(decodeChar);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool decode(ref string returnString)
        {
            return decode(returnString, ref returnString);
        }

        public static string decode(string returnString)
        {
            if (string.IsNullOrEmpty(returnString)) return string.Empty;
            decode(returnString, ref returnString);
            return returnString;
        }
    }
}
