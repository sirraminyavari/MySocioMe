using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;

namespace DBUtil
{
    class DataProvider
    {
        private static string GetFullyQualifiedName(string name)
        {
            return "[dbo]." + "[" + name + "]"; //'[dbo].' is database owner and 'CN_' is module qualifier
        }
        
        private static List<User> _parse_users(IDataReader reader)
        {
            List<User> ret = new List<DBUtil.User>();

            while (reader.Read())
            {
                try
                {
                    User u = new User();
                    
                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) u.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["UserName"].ToString())) u.UserName = (string)reader["UserName"];
                    if (!string.IsNullOrEmpty(reader["FullName"].ToString())) u.FullName = (string)reader["FullName"];
                    if (!string.IsNullOrEmpty(reader["Biography"].ToString())) u.Biography = (string)reader["Biography"];
                    if (!string.IsNullOrEmpty(reader["Website"].ToString())) u.Website = (string)reader["Website"];
                    if (!string.IsNullOrEmpty(reader["Media"].ToString())) u.Media = (int)reader["Media"];
                    if (!string.IsNullOrEmpty(reader["Follows"].ToString())) u.Follows = (int)reader["Follows"];
                    if (!string.IsNullOrEmpty(reader["Followers"].ToString())) u.Followers = (int)reader["Followers"];
                    if (!string.IsNullOrEmpty(reader["Private"].ToString())) u.Private = (bool)reader["Private"];
                    if (!string.IsNullOrEmpty(reader["ImageURL"].ToString())) u.ImageURL = (string)reader["ImageURL"];
                    if (!string.IsNullOrEmpty(reader["Alias"].ToString())) u.Alias = (string)reader["Alias"];
                    if (!string.IsNullOrEmpty(reader["Code"].ToString())) u.Code = (string)reader["Code"];
                    if (!string.IsNullOrEmpty(reader["Token"].ToString())) u.Token = (string)reader["Token"];
                    if (!string.IsNullOrEmpty(reader["LocalToken"].ToString())) u.LocalToken = (string)reader["LocalToken"];

                    ret.Add(u);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<Media> _parse_media(IDataReader reader)
        {
            List<Media> ret = new List<DBUtil.Media>();
            
            while (reader.Read())
            {
                try
                {
                    Media m = new Media();

                    if (!string.IsNullOrEmpty(reader["MediaID"].ToString())) m.MediaID = (string)reader["MediaID"];
                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) m.Sender.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["Type"].ToString())) m.Type = (string)reader["Type"];
                    if (!string.IsNullOrEmpty(reader["CreationTime"].ToString()))
                        m.CreationTime = (DateTime)reader["CreationTime"];
                    if (!string.IsNullOrEmpty(reader["Likes"].ToString())) m.Likes = (int)reader["Likes"];
                    if (!string.IsNullOrEmpty(reader["Comments"].ToString())) m.Comments = (int)reader["Comments"];
                    if (!string.IsNullOrEmpty(reader["LocationID"].ToString()))
                        m.LocationID = (string)reader["LocationID"];
                    if (!string.IsNullOrEmpty(reader["LocationName"].ToString()))
                        m.LocationName = (string)reader["LocationName"];
                    if (!string.IsNullOrEmpty(reader["Latitude"].ToString())) m.Latitude = (double)reader["Latitude"];
                    if (!string.IsNullOrEmpty(reader["Longitude"].ToString())) m.Longitude = (double)reader["Longitude"];
                    if (!string.IsNullOrEmpty(reader["Caption"].ToString())) m.Caption = (string)reader["Caption"];
                    if (!string.IsNullOrEmpty(reader["ImageURL"].ToString())) m.ImageURL = (string)reader["ImageURL"];
                    if (!string.IsNullOrEmpty(reader["VideoURL"].ToString())) m.VideoURL = (string)reader["VideoURL"];

                    ret.Add(m);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();
            
            return ret;
        }

        private static List<MediaTag> _parse_media_tag(IDataReader reader)
        {
            List<MediaTag> ret = new List<DBUtil.MediaTag>();

            while (reader.Read())
            {
                try
                {
                    MediaTag m = new MediaTag();

                    if (!string.IsNullOrEmpty(reader["MediaID"].ToString())) m.MediaID = (string)reader["MediaID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) m.Name = (string)reader["Name"];
                    
                    ret.Add(m);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<MediaTag> _parse_tags(IDataReader reader)
        {
            List<MediaTag> ret = new List<DBUtil.MediaTag>();

            while (reader.Read())
            {
                try
                {
                    MediaTag t = new MediaTag();

                    if (!string.IsNullOrEmpty(reader["TagID"].ToString())) t.TagID = (long)reader["TagID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) t.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["MediaCount"].ToString())) t.MediaCount = (int)reader["MediaCount"];

                    ret.Add(t);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static SortedList<long, List<MediaTag>> _parse_category_tags(IDataReader reader)
        {
            SortedList<long, List<MediaTag>> ret = new SortedList<long, List<MediaTag>>();

            while (reader.Read())
            {
                try
                {
                    MediaTag t = new MediaTag();

                    long categoryId = string.IsNullOrEmpty(reader["CategoryID"].ToString()) ? 0 :
                        (long)reader["CategoryID"];

                    if (!string.IsNullOrEmpty(reader["TagID"].ToString())) t.TagID = (long)reader["TagID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) t.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["MediaCount"].ToString())) t.MediaCount = (int)reader["MediaCount"];

                    if (categoryId > 0)
                    {
                        if (!ret.ContainsKey(categoryId)) ret.Add(categoryId, new List<DBUtil.MediaTag>());
                        ret[categoryId].Add(t);
                    }
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<BookmarkedUser> _parse_bookmarked_users(IDataReader reader)
        {
            List<BookmarkedUser> ret = new List<BookmarkedUser>();

            while (reader.Read())
            {
                try
                {
                    BookmarkedUser usr = new BookmarkedUser(); ;

                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) usr.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["BookmarkedUserID"].ToString()))
                        usr.BookmarkedUserID = (string)reader["BookmarkedUserID"];
                    if (!string.IsNullOrEmpty(reader["Alias"].ToString())) usr.Alias = (string)reader["Alias"];

                    ret.Add(usr);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<BookmarkedTag> _parse_bookmarked_tags(IDataReader reader)
        {
            List<BookmarkedTag> ret = new List<DBUtil.BookmarkedTag>();

            while (reader.Read())
            {
                try
                {
                    BookmarkedTag t = new DBUtil.BookmarkedTag();

                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) t.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["TagID"].ToString())) t.Tag.TagID = (long)reader["TagID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) t.Tag.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["MediaCount"].ToString())) t.Tag.MediaCount = (int)reader["MediaCount"];

                    ret.Add(t);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }
        
        private static List<BookmarkedLocation> _parse_bookmarked_locations(IDataReader reader)
        {
            List<BookmarkedLocation> ret = new List<DBUtil.BookmarkedLocation>();

            while (reader.Read())
            {
                try
                {
                    BookmarkedLocation item = new BookmarkedLocation();
                    
                    if (!string.IsNullOrEmpty(reader["ID"].ToString())) item.ID = (long)reader["ID"];
                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) item.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) item.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["Alias"].ToString())) item.Alias = (string)reader["Alias"];
                    if (!string.IsNullOrEmpty(reader["Latitude"].ToString())) item.Latitude = (double)reader["Latitude"];
                    if (!string.IsNullOrEmpty(reader["Longitude"].ToString())) item.Longitude = (double)reader["Longitude"];
                    if (!string.IsNullOrEmpty(reader["Radius"].ToString())) item.Radius = (int)reader["Radius"];

                    ret.Add(item);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static SortedList<long, List<BookmarkedLocation>> _parse_category_locations(IDataReader reader)
        {
            SortedList<long, List<BookmarkedLocation>> ret = new SortedList<long, List<DBUtil.BookmarkedLocation>>();

            while (reader.Read())
            {
                try
                {
                    BookmarkedLocation item = new BookmarkedLocation();

                    long categoryId = string.IsNullOrEmpty(reader["CategoryID"].ToString()) ? 0 :
                        (long)reader["CategoryID"];

                    if (!string.IsNullOrEmpty(reader["ID"].ToString())) item.ID = (long)reader["ID"];
                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) item.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) item.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["Alias"].ToString())) item.Alias = (string)reader["Alias"];
                    if (!string.IsNullOrEmpty(reader["Latitude"].ToString())) item.Latitude = (double)reader["Latitude"];
                    if (!string.IsNullOrEmpty(reader["Longitude"].ToString())) item.Longitude = (double)reader["Longitude"];
                    if (!string.IsNullOrEmpty(reader["Radius"].ToString())) item.Radius = (int)reader["Radius"];

                    if (categoryId > 0)
                    {
                        if (!ret.ContainsKey(categoryId)) ret.Add(categoryId, new List<DBUtil.BookmarkedLocation>());
                        ret[categoryId].Add(item);
                    }
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<UserTrendItem> _parse_user_trend_items(IDataReader reader)
        {
            List<UserTrendItem> ret = new List<DBUtil.UserTrendItem>();

            while (reader.Read())
            {
                try
                {
                    UserTrendItem t = new UserTrendItem();

                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) t.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["Time"].ToString())) t.Time = (DateTime)reader["Time"];
                    if (!string.IsNullOrEmpty(reader["Media"].ToString())) t.Media = (int)reader["Media"];
                    if (!string.IsNullOrEmpty(reader["Follows"].ToString())) t.Follows = (int)reader["Follows"];
                    if (!string.IsNullOrEmpty(reader["Followers"].ToString())) t.Followers = (int)reader["Followers"];

                    ret.Add(t);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static List<Category> _parse_categories(IDataReader reader)
        {
            List<Category> ret = new List<DBUtil.Category>();

            while (reader.Read())
            {
                try
                {
                    Category c = new DBUtil.Category();

                    if (!string.IsNullOrEmpty(reader["ID"].ToString())) c.ID = (long)reader["ID"];
                    if (!string.IsNullOrEmpty(reader["UserID"].ToString())) c.UserID = (string)reader["UserID"];
                    if (!string.IsNullOrEmpty(reader["Name"].ToString())) c.Name = (string)reader["Name"];
                    if (!string.IsNullOrEmpty(reader["LikesMin"].ToString())) c.LikesMin = (int)reader["LikesMin"];
                    if (!string.IsNullOrEmpty(reader["SimilarTags"].ToString()))
                        c.SimilarTags = (bool)reader["SimilarTags"];

                    ret.Add(c);
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static Dictionary<string, object> _parse_insight(IDataReader reader, string type)
        {
            Dictionary<string, object> ret = new Dictionary<string, object>();

            while (reader.Read())
            {
                try
                {
                    string colValue = "0";
                    Dictionary<string, object> dic = new Dictionary<string, object>();

                    switch (type)
                    {
                        case "hourly":
                            if (!string.IsNullOrEmpty(reader["Hour"].ToString()))
                                colValue = reader["Hour"].ToString();
                            break;
                        case "daily":
                            if (!string.IsNullOrEmpty(reader["DayOfWeek"].ToString()))
                                colValue = reader["DayOfWeek"].ToString();
                            break;
                        case "monthly":
                            if (!string.IsNullOrEmpty(reader["Year"].ToString()))
                                colValue = reader["Year"].ToString();
                            if (!string.IsNullOrEmpty(reader["Month"].ToString()))
                                colValue += "-" + reader["Month"].ToString();
                            break;
                        case "tags":
                            if (!string.IsNullOrEmpty(reader["Name"].ToString()))
                                colValue = reader["Name"].ToString();
                            break;
                    }

                    if (!string.IsNullOrEmpty(reader["MediaCount"].ToString()))
                        dic["media_count"] = (int)reader["MediaCount"];
                    if (!string.IsNullOrEmpty(reader["LikesCountAvg"].ToString()))
                        dic["likes_count_avg"] = (double)reader["LikesCountAvg"];
                    if (!string.IsNullOrEmpty(reader["CommentsCountAvg"].ToString()))
                        dic["comments_count_avg"] = (double)reader["CommentsCountAvg"];

                    ret[colValue] = dic;
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        private static Dictionary<string, object> _parse_follow_requests(IDataReader reader)
        {
            Dictionary<string, object> ret = new Dictionary<string, object>();

            ArrayList lst = new ArrayList();

            ret["Items"] = lst;

            while (reader.Read())
            {
                try
                {
                    if(!string.IsNullOrEmpty(reader["UserID"].ToString()) && 
                        !string.IsNullOrEmpty(reader["TargetUserID"].ToString()))
                    {
                        Dictionary<string, object> item = new Dictionary<string, object>();
                        item["UserID"] = (long)reader["UserID"];
                        item["TargetUserID"] = (long)reader["TargetUserID"];

                        lst.Add(item);
                    }
                }
                catch (Exception e) { string s = e.ToString(); }
            }

            if (!reader.IsClosed) reader.Close();

            return ret;
        }

        public static bool SaveErrorLog(string userId, string subject, string description)
        {
            string spName = GetFullyQualifiedName("SaveErrorLog");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, subject, description, DateTime.UtcNow));
            }
            catch (Exception ex) { string strEx = ex.ToString(); return false; }
        }
        
        public static bool UpdateUsers(List<User> users, bool overrideData)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Users
            DataTable usersTable = new DataTable();
            
            usersTable.Columns.Add("UserID", typeof(string));
            usersTable.Columns.Add("UserName", typeof(string));
            usersTable.Columns.Add("FullName", typeof(string));
            usersTable.Columns.Add("Biography", typeof(string));
            usersTable.Columns.Add("Website", typeof(string));
            usersTable.Columns.Add("Media", typeof(int));
            usersTable.Columns.Add("Follows", typeof(int));
            usersTable.Columns.Add("Followers", typeof(int));
            usersTable.Columns.Add("ImageURL", typeof(string));

            foreach (User u in users)
            {
                usersTable.Rows.Add(u.UserID, u.UserName, u.FullName, u.Biography, u.Website,
                    u.Media, u.Follows, u.Followers, u.ImageURL);
            }

            SqlParameter usersParam = new SqlParameter("@Users", SqlDbType.Structured);
            usersParam.TypeName = "[dbo].[UserTableType]";
            usersParam.Value = usersTable;
            //end of Add Users
            
            cmd.Parameters.Add(usersParam);
            cmd.Parameters.AddWithValue("@Override", overrideData);

            string spName = GetFullyQualifiedName("UpdateUsers");

            string sep = ", ";
            string arguments = "@Users" + sep + "@Override";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static List<Media> UserMedia(string userId, int? count, int? lowerBoundary, bool? asc)
        {
            string spName = GetFullyQualifiedName("UserMedia");

            try
            {
                return _parse_media(ProviderUtil.execute_reader(spName, userId, count, lowerBoundary, asc));
                
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.Media>();
            }
        }

        public static bool ActivateUser(string userId, string username, string fullname, 
            string code, string token, string localToken, string invitedByUserId, string imageUrl)
        {
            string spName = GetFullyQualifiedName("ActivateUser");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, username, fullname,
                    code, token, localToken, invitedByUserId, imageUrl));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<User> GetUsers(string currentUserId, List<string> userIds)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add UserIDs
            DataTable userIdsTable = new DataTable();

            userIdsTable.Columns.Add("Value", typeof(string));

            foreach (string id in userIds)
                userIdsTable.Rows.Add(id);

            SqlParameter userIdsParam = new SqlParameter("@UserIDs", SqlDbType.Structured);
            userIdsParam.TypeName = "[dbo].[KeyLessStringTableType]";
            userIdsParam.Value = userIdsTable;
            //end of Add UserIDs

            if(!string.IsNullOrEmpty(currentUserId)) cmd.Parameters.AddWithValue("CurrentUserID", currentUserId);
            cmd.Parameters.Add(userIdsParam);

            string spName = GetFullyQualifiedName("GetUsers");

            string sep = ", ";
            string arguments = (string.IsNullOrEmpty(currentUserId) ? "null" : "@CurrentUserID") + sep + "@UserIDs";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return _parse_users((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
            finally { con.Close(); }
        }

        public static User GetLocalTokenOwner(string token)
        {
            string spName = GetFullyQualifiedName("GetLocalTokenOwner");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, token)).FirstOrDefault();
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return null;
            }
        }

        public static List<User> GetActivatedUsers()
        {
            string spName = GetFullyQualifiedName("GetActivatedUsers");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static bool LogOut(string userId)
        {
            string spName = GetFullyQualifiedName("LogOut");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool IsActivatedUser(string userId)
        {
            string spName = GetFullyQualifiedName("IsActivatedUser");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool LockUser(string userId, DateTime until)
        {
            string spName = GetFullyQualifiedName("LockUser");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, until));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static DateTime? UserUnlockTime(string userId)
        {
            string spName = GetFullyQualifiedName("UserUnlockTime");

            try
            {
                return ProviderUtil.succeed_datetime(ProviderUtil.execute_reader(spName, userId, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return null;
            }
        }

        private static bool _UpdateMedia(List<Media> mediaItems, List<MediaTag> tags, bool? isPublic)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add MediaItems
            DataTable mediaItemsTable = new DataTable();

            mediaItemsTable.Columns.Add("MediaID", typeof(string));
            mediaItemsTable.Columns.Add("UserID", typeof(string));
            mediaItemsTable.Columns.Add("Type", typeof(string));
            mediaItemsTable.Columns.Add("CreationTime", typeof(DateTime));
            mediaItemsTable.Columns.Add("Likes", typeof(int));
            mediaItemsTable.Columns.Add("Comments", typeof(int));
            mediaItemsTable.Columns.Add("LocationID", typeof(string));
            mediaItemsTable.Columns.Add("LocationName", typeof(string));
            mediaItemsTable.Columns.Add("Latitude", typeof(double));
            mediaItemsTable.Columns.Add("Longitude", typeof(double));
            mediaItemsTable.Columns.Add("Caption", typeof(string));
            mediaItemsTable.Columns.Add("ImageURL", typeof(string));
            mediaItemsTable.Columns.Add("VideoURL", typeof(string));

            foreach (Media m in mediaItems)
            {
                string caption = null;
                if (!string.IsNullOrEmpty(m.Caption))
                    caption = m.Caption.Length > 900 ? m.Caption.Substring(0, 900) : m.Caption;

                mediaItemsTable.Rows.Add(m.MediaID, m.Sender.UserID, m.Type, m.CreationTime, m.Likes, m.Comments,
                    m.LocationID, m.LocationName, m.Latitude, m.Longitude, caption, m.ImageURL, m.VideoURL);
            }

            SqlParameter mediaItemsParam = new SqlParameter("@Items", SqlDbType.Structured);
            mediaItemsParam.TypeName = "[dbo].[MediaTableType]";
            mediaItemsParam.Value = mediaItemsTable;
            //end of Add MediaItems

            //Add Tags
            DataTable tagsTable = new DataTable();

            tagsTable.Columns.Add("MediaID", typeof(string));
            tagsTable.Columns.Add("TagID", typeof(long));
            tagsTable.Columns.Add("Name", typeof(string));
            tagsTable.Columns.Add("MediaCount", typeof(int));

            foreach (MediaTag t in tags)
                tagsTable.Rows.Add(t.MediaID, t.TagID, t.Name, t.MediaCount);

            SqlParameter tagsParam = new SqlParameter("@Tags", SqlDbType.Structured);
            tagsParam.TypeName = "[dbo].[MediaTagTableType]";
            tagsParam.Value = tagsTable;
            //end of Add Tags

            cmd.Parameters.Add(mediaItemsParam);
            cmd.Parameters.Add(tagsParam);

            string spName =
                GetFullyQualifiedName(isPublic.HasValue && isPublic.Value ? "UpdatePublicMedia" : "UpdateMedia");

            string sep = ", ";
            string arguments = "@Items" + sep + "@Tags";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static bool UpdateMedia(List<Media> mediaItems, List<MediaTag> tags)
        {
            return _UpdateMedia(mediaItems, tags, false);
        }

        public static bool UpdatePublicMedia(List<Media> mediaItems, List<MediaTag> tags)
        {
            return _UpdateMedia(mediaItems, tags, true);
        }

        public static bool UpdateLocationMedia(List<LocationMedia> items)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Items
            DataTable itemsTable = new DataTable();

            itemsTable.Columns.Add("FirstValue", typeof(long));
            itemsTable.Columns.Add("SecondValue", typeof(string));

            foreach (LocationMedia lm in items)
                itemsTable.Rows.Add(lm.Location.ID.Value, lm.Media.MediaID);

            SqlParameter itemsParam = new SqlParameter("@Items", SqlDbType.Structured);
            itemsParam.TypeName = "[dbo].[BigintStringTableType]";
            itemsParam.Value = itemsTable;
            //end of Add MediaItems
            
            cmd.Parameters.Add(itemsParam);

            string spName = GetFullyQualifiedName("UpdateLocationMedia");

            string arguments = "@Items";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static List<MediaTag> GetMediaTags(List<string> mediaIds)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add UserIDs
            DataTable mediaIdsTable = new DataTable();

            mediaIdsTable.Columns.Add("Value", typeof(string));

            foreach (string id in mediaIds)
                mediaIdsTable.Rows.Add(id);

            SqlParameter mediaIdsParam = new SqlParameter("@MediaIDs", SqlDbType.Structured);
            mediaIdsParam.TypeName = "[dbo].[KeyLessStringTableType]";
            mediaIdsParam.Value = mediaIdsTable;
            //end of Add UserIDs
            
            cmd.Parameters.Add(mediaIdsParam);

            string spName = GetFullyQualifiedName("GetMediaTags");
            
            string arguments = "@MediaIDs";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return _parse_media_tag((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.MediaTag>();
            }
            finally { con.Close(); }
        }

        public static bool AddMediaFans(List<MediaFan> fans)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Fans
            DataTable fansTable = new DataTable();

            fansTable.Columns.Add("MediaID", typeof(string));
            fansTable.Columns.Add("UserID", typeof(string));
            fansTable.Columns.Add("Liked", typeof(bool));
            fansTable.Columns.Add("Commented", typeof(bool));

            foreach (MediaFan f in fans)
                fansTable.Rows.Add(f.MediaID, f.UserID, f.Liked, f.Commented);

            SqlParameter fansParam = new SqlParameter("@Fans", SqlDbType.Structured);
            fansParam.TypeName = "[dbo].[MediaFanTableType]";
            fansParam.Value = fansTable;
            //end of Add Fans

            cmd.Parameters.Add(fansParam);

            string spName = GetFullyQualifiedName("AddMediaFans");
            
            string arguments = "@Fans";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static bool UpdateTags(List<MediaTag> tags)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;
            
            //Add Tags
            DataTable tagsTable = new DataTable();

            tagsTable.Columns.Add("MediaID", typeof(string));
            tagsTable.Columns.Add("TagID", typeof(long));
            tagsTable.Columns.Add("Name", typeof(string));
            tagsTable.Columns.Add("MediaCount", typeof(int));

            foreach (MediaTag t in tags)
                tagsTable.Rows.Add(t.MediaID, t.TagID, t.Name, t.MediaCount);

            SqlParameter tagsParam = new SqlParameter("@Tags", SqlDbType.Structured);
            tagsParam.TypeName = "[dbo].[MediaTagTableType]";
            tagsParam.Value = tagsTable;
            //end of Add Tags
            
            cmd.Parameters.Add(tagsParam);

            string spName = GetFullyQualifiedName("UpdateTags");
            
            string arguments = "@Tags";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static List<User> MediaSendersOfTag(string currentUserId, long tagId)
        {
            string spName = GetFullyQualifiedName("MediaSendersOfTag");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, currentUserId, tagId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static List<User> FansOfTag(string currentUserId, long tagId)
        {
            string spName = GetFullyQualifiedName("FansOfTag");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, currentUserId, tagId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static List<MediaTag> FindFavoriteTags(string userId, int? count)
        {
            string spName = GetFullyQualifiedName("FindFavoriteTags");

            try
            {
                return _parse_tags(ProviderUtil.execute_reader(spName, userId, count));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.MediaTag>();
            }
        }

        public static List<User> FindPagesToBookmark(string userId, int? count)
        {
            string spName = GetFullyQualifiedName("FindPagesToBookmark");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, userId, count));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static List<User> SuggestUsersToFollow(string userId, int? count)
        {
            string spName = GetFullyQualifiedName("SuggestUsersToFollow");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, userId, count));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static List<User> MediaSendersOfLocation(string currentUserId, long locationId)
        {
            string spName = GetFullyQualifiedName("MediaSendersOfLocation");

            try
            {
                return _parse_users(ProviderUtil.execute_reader(spName, currentUserId, locationId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.User>();
            }
        }

        public static bool AddFollowers(List<Follow> followItems)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Followers
            DataTable followTable = new DataTable();
            
            followTable.Columns.Add("FirstValue", typeof(string));
            followTable.Columns.Add("SecondValue", typeof(string));

            foreach (Follow f in followItems)
                followTable.Rows.Add(f.Followed.UserID, f.Following.UserID);

            SqlParameter followParam = new SqlParameter("@Followers", SqlDbType.Structured);
            followParam.TypeName = "[dbo].[StringPairTableType]";
            followParam.Value = followTable;
            //end of Add Followers

            cmd.Parameters.Add(followParam);

            string spName = GetFullyQualifiedName("AddFollowers");

            string arguments = "@Followers";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static bool AddFollowSuggestions(List<FollowSuggestion> suggestedItems)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Followers
            DataTable followTable = new DataTable();

            followTable.Columns.Add("UserID", typeof(string));
            followTable.Columns.Add("SuggestedUserID", typeof(string));
            followTable.Columns.Add("BookmarkedLocationID", typeof(long));

            foreach (FollowSuggestion f in suggestedItems)
                followTable.Rows.Add(f.User.UserID, f.Suggested.UserID);

            SqlParameter followParam = new SqlParameter("@Suggestions", SqlDbType.Structured);
            followParam.TypeName = "[dbo].[FollowSuggestionTableType]";
            followParam.Value = followTable;
            //end of Add Followers
            
            cmd.Parameters.Add(followParam);

            string spName = GetFullyQualifiedName("AddFollowSuggestions");
            
            string arguments = "@Suggestions";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static bool BookmarkUser(string userId, string targetUserId)
        {
            string spName = GetFullyQualifiedName("BookmarkUser");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, targetUserId, DateTime.Now));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool RemoveBookmarkedUser(string userId, string targetUserId)
        {
            string spName = GetFullyQualifiedName("RemoveBookmarkedUser");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, targetUserId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<BookmarkedUser> GetBookmarkedUsers(string userId)
        {
            string spName = GetFullyQualifiedName("GetBookmarkedUsers");

            try
            {
                return _parse_bookmarked_users(ProviderUtil.execute_reader(spName, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<BookmarkedUser>();
            }
        }

        public static bool SetAlias(string userId, string targetUserId, string alias)
        {
            if (alias.Length > 100) return false;

            string spName = GetFullyQualifiedName("SetAlias");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, targetUserId, alias));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool RemoveAlias(string userId, string targetUserId)
        {
            string spName = GetFullyQualifiedName("RemoveAlias");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, targetUserId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static long? BookmarkTag(string userId, string tag)
        {
            string spName = GetFullyQualifiedName("BookmarkTag");

            try
            {
                long? result = ProviderUtil.succeed_long(ProviderUtil.execute_reader(spName, userId, tag, DateTime.Now));
                return result.HasValue && result.Value <= 0 ? null : result;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return null;
            }
        }

        public static bool RemoveBookmarkedTag(string userId, long tagId)
        {
            string spName = GetFullyQualifiedName("RemoveBookmarkedTag");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, tagId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<BookmarkedTag> GetBookmarkedTags(string userId)
        {
            string spName = GetFullyQualifiedName("GetBookmarkedTags");

            try
            {
                List<BookmarkedTag> lst = _parse_bookmarked_tags(ProviderUtil.execute_reader(spName, userId));
                if (lst != null) for (int i = 0; i < lst.Count; ++i) lst[i].Tag.Bookmarked = true;
                return lst;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.BookmarkedTag>();
            }
        }

        public static long? BookmarkLocation(long?id, string userId, string name, string alias,
            double latitude, double longitude, int? radius)
        {
            string spName = GetFullyQualifiedName("BookmarkLocation");

            try
            {
                long? ret = ProviderUtil.succeed_long(ProviderUtil.execute_reader(spName,
                    id, userId, name, alias, latitude, longitude, radius));
                if (ret.HasValue && ret.Value <= 0) ret = null;
                return ret;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return null;
            }
        }

        public static bool RemoveBookmarkedLocation(long id)
        {
            string spName = GetFullyQualifiedName("RemoveBookmarkedLocation");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, id));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<BookmarkedLocation> GetBookmarkedLocations(string userId)
        {
            string spName = GetFullyQualifiedName("GetBookmarkedLocations");

            try
            {
                return _parse_bookmarked_locations(ProviderUtil.execute_reader(spName, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.BookmarkedLocation>();
            }
        }

        public static bool AddUserTrendItem(string userId, int media, int follows, int followers)
        {
            string spName = GetFullyQualifiedName("AddUserTrendItem");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName,
                    userId, DateTime.UtcNow, media, follows, followers));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<UserTrendItem> GetUserTrendItems(string userId, int? count)
        {
            string spName = GetFullyQualifiedName("GetUserTrendItems");

            try
            {
                return _parse_user_trend_items(ProviderUtil.execute_reader(spName, userId, count));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<UserTrendItem>();
            }
        }

        public static List<Category> GetCategories(string userId, long? categoryId)
        {
            string spName = GetFullyQualifiedName("GetCategories");

            try
            {
                return _parse_categories(ProviderUtil.execute_reader(spName, userId, categoryId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.Category>();
            }
        }

        public static SortedList<long, List<MediaTag>> GetCategoryTags(string userId, long? categoryId)
        {
            string spName = GetFullyQualifiedName("GetCategoryTags");

            try
            {
                return _parse_category_tags(ProviderUtil.execute_reader(spName, userId, categoryId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new SortedList<long, List<DBUtil.MediaTag>>();
            }
        }

        public static SortedList<long, List<BookmarkedLocation>> GetCategoryLocations(string userId, long? categoryId)
        {
            string spName = GetFullyQualifiedName("GetCategoryLocations");

            try
            {
                return _parse_category_locations(ProviderUtil.execute_reader(spName, userId, categoryId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new SortedList<long, List<DBUtil.BookmarkedLocation>>();
            }
        }

        public static long? SaveCategory(string userId, Category cat)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;
            
            //Add Tags
            DataTable tagsTable = new DataTable();

            tagsTable.Columns.Add("MediaID", typeof(string));
            tagsTable.Columns.Add("TagID", typeof(long));
            tagsTable.Columns.Add("Name", typeof(string));
            tagsTable.Columns.Add("MediaCount", typeof(int));

            if (cat.Tags != null)
            {
                foreach (MediaTag t in cat.Tags)
                    tagsTable.Rows.Add(t.MediaID, t.TagID, t.Name, t.MediaCount);
            }

            SqlParameter tagsParam = new SqlParameter("@Tags", SqlDbType.Structured);
            tagsParam.TypeName = "[dbo].[MediaTagTableType]";
            tagsParam.Value = tagsTable;
            //end of Add Tags

            //Add Locations
            DataTable locationsTable = new DataTable();

            locationsTable.Columns.Add("ID", typeof(long));
            locationsTable.Columns.Add("Name", typeof(string));
            locationsTable.Columns.Add("Alias", typeof(string));
            locationsTable.Columns.Add("Latitude", typeof(double));
            locationsTable.Columns.Add("Longitude", typeof(double));
            locationsTable.Columns.Add("Radius", typeof(int));

            if (cat.Locations != null)
            {
                foreach (BookmarkedLocation l in cat.Locations)
                    locationsTable.Rows.Add(l.ID, l.Name, l.Alias, l.Latitude, l.Longitude, l.Radius);
            }

            SqlParameter locationsParam = new SqlParameter("@Locations", SqlDbType.Structured);
            locationsParam.TypeName = "[dbo].[LocationTableType]";
            locationsParam.Value = locationsTable;
            //end of Add Locations

            cmd.Parameters.AddWithValue("@UserID", userId);
            if (cat.ID.HasValue) cmd.Parameters.AddWithValue("@ID", cat.ID);
            cmd.Parameters.AddWithValue("@Name", cat.Name);
            if (cat.LikesMin.HasValue && cat.LikesMin.Value > 0)
                cmd.Parameters.AddWithValue("@LikesMin", cat.LikesMin.Value);
            if (cat.SimilarTags.HasValue) cmd.Parameters.AddWithValue("@SimilarTags", cat.SimilarTags.Value);
            cmd.Parameters.Add(tagsParam);
            cmd.Parameters.Add(locationsParam);

            string spName = GetFullyQualifiedName("SaveCategory");

            string sep = ", ";
            string arguments = "@UserID" + sep + (cat.ID.HasValue ? "@ID" : "null") + sep + "@Name" + sep +
                (cat.LikesMin.HasValue && cat.LikesMin.Value > 0 ? "@LikesMin" : "null") + sep +
                (cat.SimilarTags.HasValue ? "@SimilarTags" : "null") + sep + "@Tags" + sep + "@Locations";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                long? id =ProviderUtil.succeed_long((IDataReader)cmd.ExecuteReader());

                if (id.HasValue && id.Value <= 0) id = null;

                return id;
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return null;
            }
            finally { con.Close(); }
        }

        public static bool RemoveCategory(long id)
        {
            string spName = GetFullyQualifiedName("RemoveCategory");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, id));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static List<Media> CategoryMedia(long categoryId, int? count, int? lowerBoundary)
        {
            string spName = GetFullyQualifiedName("CategoryMedia");

            try
            {
                return _parse_media(ProviderUtil.execute_reader(spName, categoryId, count, lowerBoundary));

            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new List<DBUtil.Media>();
            }
        }

        public static Dictionary<string, object> HourlyInsight(string userId, int? timezoneOffset,
            int? dayOfWeekFrom, int? dayOfWeekTo)
        {
            string spName = GetFullyQualifiedName("HourlyInsight");

            try
            {
                return _parse_insight(ProviderUtil.execute_reader(spName, userId, timezoneOffset,
                    dayOfWeekFrom, dayOfWeekTo), "hourly");
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new Dictionary<string, object>();
            }
        }

        public static Dictionary<string, object> DailyInsight(string userId, int? timezoneOffset)
        {
            string spName = GetFullyQualifiedName("DailyInsight");

            try
            {
                return _parse_insight(ProviderUtil.execute_reader(spName, userId, timezoneOffset), "daily");
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new Dictionary<string, object>();
            }
        }

        public static Dictionary<string, object> MonthlyTrend(string userId, int? timezoneOffset, int? count)
        {
            string spName = GetFullyQualifiedName("MonthlyTrend");

            try
            {
                return _parse_insight(ProviderUtil.execute_reader(spName, userId, timezoneOffset, count), "monthly");
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new Dictionary<string, object>();
            }
        }

        public static Dictionary<string, object> TagsInsight(string userId)
        {
            string spName = GetFullyQualifiedName("TagsInsight");

            try
            {
                return _parse_insight(ProviderUtil.execute_reader(spName, userId), "tags");
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new Dictionary<string, object>();
            }
        }

        public static bool SubmitFace(string mediaId)
        {
            string spName = GetFullyQualifiedName("SubmitFace");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, mediaId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool RemoveSubmitedFace(string mediaId)
        {
            string spName = GetFullyQualifiedName("RemoveSubmitedFace");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, mediaId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool ComparedFaces(string winnerId, string loserId)
        {
            string spName = GetFullyQualifiedName("ComparedFaces");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, winnerId, loserId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool SaveJudgement(string mediaId, string userId, int? score, bool? friendship, bool? marriage)
        {
            string spName = GetFullyQualifiedName("SaveJudgement");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, mediaId, userId, score, friendship, marriage));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool ReportFace(string mediaId, string userId)
        {
            string spName = GetFullyQualifiedName("ReportFace");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, mediaId, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool UndoReportedFace(string mediaId, string userId)
        {
            string spName = GetFullyQualifiedName("UndoReportedFace");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, mediaId, userId));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool SaveIPGLog(List<IPGLog> logs)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add Logs
            DataTable logsTable = new DataTable();

            logsTable.Columns.Add("Action", typeof(string));
            logsTable.Columns.Add("UserID", typeof(string));
            logsTable.Columns.Add("DeviceID", typeof(string));
            logsTable.Columns.Add("DeviceModel", typeof(string));
            logsTable.Columns.Add("TargetUserID", typeof(string));
            logsTable.Columns.Add("Time", typeof(DateTime));

            foreach (IPGLog l in logs)
                logsTable.Rows.Add(l.Action, l.UserID, l.DeviceID, l.DeviceModel, l.TargetUserID, l.Time);

            SqlParameter logsParam = new SqlParameter("@Logs", SqlDbType.Structured);
            logsParam.TypeName = "[dbo].[IPGLogTableType]";
            logsParam.Value = logsTable;
            //end of Add Logs

            cmd.Parameters.Add(logsParam);

            string spName = GetFullyQualifiedName("SaveIPGLog");
            
            string arguments = "@Logs";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }

        public static bool AppPurchaseLog(string userId, string appName, string purchaseId, int amount,
            string paymentProvider, string agentId)
        {
            string spName = GetFullyQualifiedName("AppPurchaseLog");

            try
            {
                if (string.IsNullOrEmpty(userId)) userId = null;
                if (string.IsNullOrEmpty(agentId)) agentId = null;

                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName,
                    userId, appName, purchaseId, amount, paymentProvider, agentId, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static bool HasPurchased(string userId, string appName)
        {
            string spName = GetFullyQualifiedName("HasPurchased");

            try
            {
                return ProviderUtil.succeed(ProviderUtil.execute_reader(spName, userId, appName));
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
        }

        public static Dictionary<string, object> SuggestFollowRequests(List<long> userIds)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add IDs
            DataTable idsTable = new DataTable();
            idsTable.Columns.Add("Value", typeof(long));
            foreach (long id in userIds) idsTable.Rows.Add(id);

            SqlParameter idsParam = new SqlParameter("@UserIDs", SqlDbType.Structured);
            idsParam.TypeName = "[dbo].[BigintTableType]";
            idsParam.Value = idsTable;
            //end of Add IDs

            cmd.Parameters.Add(idsParam);

            string spName = GetFullyQualifiedName("SuggestFollowRequests");

            string arguments = "@UserIDs";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return _parse_follow_requests((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return new Dictionary<string, object>();
            }
            finally { con.Close(); }
        }

        public static bool SaveFollowRequests(List<KeyValuePair<long, long>> requests)
        {
            SqlConnection con = new SqlConnection(ProviderUtil.ConnectionString);
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            //Add IDs
            DataTable requestsTable = new DataTable();
            requestsTable.Columns.Add("FirstValue", typeof(long));
            requestsTable.Columns.Add("SecondValue", typeof(long));
            foreach (KeyValuePair<long, long> req in requests) requestsTable.Rows.Add(req.Key, req.Value);

            SqlParameter requestsParam = new SqlParameter("@Requests", SqlDbType.Structured);
            requestsParam.TypeName = "[dbo].[BigintPairTableType]";
            requestsParam.Value = requestsTable;
            //end of Add IDs

            cmd.Parameters.Add(requestsParam);

            string spName = GetFullyQualifiedName("SaveFollowRequests");

            string arguments = "@Requests";
            cmd.CommandText = ("EXEC" + " " + spName + " " + arguments);

            con.Open();

            try
            {
                return ProviderUtil.succeed((IDataReader)cmd.ExecuteReader());
            }
            catch (Exception ex)
            {
                DBController.save_error_log(null, spName, ex);
                return false;
            }
            finally { con.Close(); }
        }
    }
}
