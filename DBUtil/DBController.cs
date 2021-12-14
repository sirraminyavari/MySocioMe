using System;
using System.Collections.Generic;
using System.Collections;
using System.Linq;
using System.Text;
using System.Threading;

namespace DBUtil
{
    public class DBController
    {
        public static bool save_error_log(string userId, string subject, string description)
        {
            return DataProvider.SaveErrorLog(userId, subject, description);
        }

        public static bool save_error_log(string userId, string subject, Exception ex)
        {
            if (ex != null && !string.IsNullOrEmpty(ex.Message) && ex.Message.ToLower() == "thread was being aborted.")
                return true; //page redirect throws this error and there is no need to be logged

            string description = PublicMethods.get_exception(ex);

            return save_error_log(userId, subject, description);
        }

        public static bool update_users(List<User> users, bool overrideData = false)
        {
            return DataProvider.UpdateUsers(users, overrideData);
        }

        public static bool update_user(User user, bool overrideData = true)
        {
            return update_users(new List<User>() { user }, overrideData);
        }

        public static bool activate_user(string userId, string username, string fullname,
            string code, string token, string localToken, string invitedByUserId, string imageUrl)
        {
            return DataProvider.ActivateUser(userId, username, fullname, code, token, localToken, invitedByUserId, imageUrl);
        }

        public static List<User> get_users(string currentUserId, List<string> userIds)
        {
            return DataProvider.GetUsers(currentUserId, userIds);
        }

        public static User get_user(string currentUserId, string userId)
        {
            return DataProvider.GetUsers(currentUserId, new List<string>() { userId }).FirstOrDefault();
        }

        public static User get_local_token_owner(string token)
        {
            return DataProvider.GetLocalTokenOwner(token);
        }

        public static List<User> get_activated_users()
        {
            return DataProvider.GetActivatedUsers();
        }

        public static bool log_out(string userId)
        {
            return DataProvider.LogOut(userId);
        }

        public static bool is_activated_user(string userId)
        {
            return DataProvider.IsActivatedUser(userId);
        }

        public static bool lock_user(string userId, DateTime until)
        {
            return DataProvider.LockUser(userId, until);
        }

        public static DateTime? user_unlock_time(string userId)
        {
            return DataProvider.UserUnlockTime(userId);
        }

        public static bool update_media(List<Media> items, List<MediaTag> tags)
        {
            return DataProvider.UpdateMedia(items, tags);
        }

        public static bool update_public_media(List<Media> items, List<MediaTag> tags)
        {
            return DataProvider.UpdatePublicMedia(items, tags);
        }

        public static bool update_location_media(List<LocationMedia> items)
        {
            return DataProvider.UpdateLocationMedia(items);
        }

        public static List<Media> user_media(string userId, int? count, int? lowerBoundary, bool? asc)
        {
            List<Media> lst = DataProvider.UserMedia(userId, count, lowerBoundary, asc);
            List<MediaTag> tags = get_media_tags(lst.Select(u => u.MediaID).ToList());
            for (int i = 0; i < lst.Count; ++i)
                lst[i].TagNames = tags.Where(u => u.MediaID == lst[i].MediaID).Select(x => x.Name).ToList();
            return lst;
        }

        public static List<MediaTag> get_media_tags(List<string> mediaIds)
        {
            return DataProvider.GetMediaTags(mediaIds);
        }

        public static bool add_media_fans(List<MediaFan> fans)
        {
            return DataProvider.AddMediaFans(fans);
        }

        public static bool update_tags(List<MediaTag> tags)
        {
            return DataProvider.UpdateTags(tags);
        }

        public static List<User> media_senders_of_tag(string currentUserId, long tagId)
        {
            return DataProvider.MediaSendersOfTag(currentUserId, tagId);
        }

        public static List<User> fans_of_tag(string currentUserId, long tagId)
        {
            return DataProvider.FansOfTag(currentUserId, tagId);
        }

        public static List<MediaTag> find_favorite_tags(string userId, int? count)
        {
            return DataProvider.FindFavoriteTags(userId, count);
        }

        public static List<User> find_pages_to_bookmark(string userId, int? count)
        {
            return DataProvider.FindPagesToBookmark(userId, count);
        }

        public static List<User> suggest_users_to_follow(string userId, int? count)
        {
            return DataProvider.SuggestUsersToFollow(userId, count);
        }

        public static List<User> media_senders_of_location(string currentUserId, long locationId)
        {
            return DataProvider.MediaSendersOfLocation(currentUserId, locationId);
        }

        public static bool add_followers(List<Follow> followItems)
        {
            return DataProvider.AddFollowers(followItems);
        }

        public static bool add_follow_suggestions(List<FollowSuggestion> suggestedItems)
        {
            return DataProvider.AddFollowSuggestions(suggestedItems);
        }

        public static bool bookmark_user(string userId, string targetUserId)
        {
            return DataProvider.BookmarkUser(userId, targetUserId);
        }

        public static bool remove_bookmarked_user(string userId, string targetUserId)
        {
            return DataProvider.RemoveBookmarkedUser(userId, targetUserId);
        }

        public static List<BookmarkedUser> get_bookmarked_users(string userId)
        {
            return DataProvider.GetBookmarkedUsers(userId);
        }

        public static bool set_alias(string userId, string targetUserId, string alias)
        {
            return DataProvider.SetAlias(userId, targetUserId, alias);
        }

        public static bool remove_alias(string userId, string targetUserId)
        {
            return DataProvider.RemoveAlias(userId, targetUserId);
        }

        public static long? bookmark_tag(string userId, string tag)
        {
            return DataProvider.BookmarkTag(userId, tag);
        }

        public static bool remove_bookmarked_tag(string userId, long tagId)
        {
            return DataProvider.RemoveBookmarkedTag(userId, tagId);
        }

        public static List<BookmarkedTag> get_bookmarked_tags(string userId)
        {
            return DataProvider.GetBookmarkedTags(userId);
        }

        public static long? bookmark_location(long? id, string userId, string name, string alias,
            double latitude, double longitude, int? radius)
        {
            return DataProvider.BookmarkLocation(id, userId, name, alias, latitude, longitude, radius);
        }

        public static bool remove_bookmarked_location(long id)
        {
            return DataProvider.RemoveBookmarkedLocation(id);
        }

        public static List<BookmarkedLocation> get_bookmarked_locations(string userId)
        {
            return DataProvider.GetBookmarkedLocations(userId);
        }

        public static bool add_user_trend_item(string userId, int media, int follows, int followers)
        {
            return DataProvider.AddUserTrendItem(userId, media, follows, followers);
        }

        public static List<UserTrendItem> get_user_trend_items(string userId, int? count)
        {
            return DataProvider.GetUserTrendItems(userId, count);
        }

        protected static List<Category> _get_categories(string userId, long? categoryId)
        {
            List<Category> categories = DataProvider.GetCategories(userId, categoryId);

            SortedList<long, List<MediaTag>> tags = DataProvider.GetCategoryTags(userId, categoryId);
            SortedList<long, List<BookmarkedLocation>> locations = DataProvider.GetCategoryLocations(userId, categoryId);

            for (int i = 0; i < categories.Count; ++i)
            {
                if (tags.ContainsKey(categories[i].ID.Value) && tags[categories[i].ID.Value] != null)
                    categories[i].Tags = tags[categories[i].ID.Value];

                if (locations.ContainsKey(categories[i].ID.Value) && locations[categories[i].ID.Value] != null)
                    categories[i].Locations = locations[categories[i].ID.Value];
            }

            return categories;
        }

        public static List<Category> get_categories(string userId)
        {
            return _get_categories(userId, null);
        }

        public static Category get_category(long categoryId)
        {
            return _get_categories(null, categoryId).FirstOrDefault();
        }

        public static long? save_category(string userId, Category cat)
        {
            return DataProvider.SaveCategory(userId, cat);
        }

        public static bool remove_category(long id)
        {
            return DataProvider.RemoveCategory(id);
        }

        public static List<Media> category_media(long categoryId, int? count, int? lowerBoundary)
        {
            return DataProvider.CategoryMedia(categoryId, count, lowerBoundary);
        }

        public static Dictionary<string, object> hourly_insight(string userId, int? timezoneOffset,
            int? dayOfWeekFrom, int? dayOfWeekTo)
        {
            return DataProvider.HourlyInsight(userId, timezoneOffset, dayOfWeekFrom, dayOfWeekTo);
        }

        public static Dictionary<string, object> daily_insight(string userId, int? timezoneOffset)
        {
            return DataProvider.DailyInsight(userId, timezoneOffset);
        }

        public static Dictionary<string, object> monthly_trend(string userId, int? timezoneOffset, int? count)
        {
            return DataProvider.MonthlyTrend(userId, timezoneOffset, count);
        }

        public static Dictionary<string, object> tags_insight(string userId)
        {
            return DataProvider.TagsInsight(userId);
        }

        public static bool submit_face(string mediaId)
        {
            return DataProvider.SubmitFace(mediaId);
        }

        public static bool remove_submited_face(string mediaId)
        {
            return DataProvider.RemoveSubmitedFace(mediaId);
        }

        public static bool compared_faces(string winnerId, string loserId)
        {
            return DataProvider.ComparedFaces(winnerId, loserId);
        }

        public static bool save_judgement(string mediaId, string userId, int? score, bool? friendship, bool? marriage)
        {
            return DataProvider.SaveJudgement(mediaId, userId, score, friendship, marriage);
        }

        public static bool report_face(string mediaId, string userId)
        {
            return DataProvider.ReportFace(mediaId, userId);
        }

        public static bool undo_reported_face(string mediaId, string userId)
        {
            return DataProvider.UndoReportedFace(mediaId, userId);
        }

        private static DateTime? LastIPGLoggingTime = null;
        private static List<IPGLog> IPGLogQueue = new List<IPGLog>();

        public static bool save_ipg_log(List<IPGLog> logs)
        {
            IPGLogQueue.AddRange(logs);

            if (!LastIPGLoggingTime.HasValue) LastIPGLoggingTime = DateTime.Now;

            if (LastIPGLoggingTime.Value.AddMinutes(2) < DateTime.Now && DataProvider.SaveIPGLog(IPGLogQueue))
            {
                LastIPGLoggingTime = null;
                IPGLogQueue = new List<DBUtil.IPGLog>();
            }

            return true;
        }

        public static bool app_purchase_log(string userId, string appName, string purchaseId, int amount,
            string paymentProvider, string agentId)
        {
            return DataProvider.AppPurchaseLog(userId, appName, purchaseId, amount, paymentProvider, agentId);
        }

        public static bool has_purchased(string userId, string appName)
        {
            return DataProvider.HasPurchased(userId, appName);
        }

        public static Dictionary<string, object> suggest_follow_requests(List<long> userIds)
        {
            return DataProvider.SuggestFollowRequests(userIds);
        }

        public static bool save_follow_requests(List<KeyValuePair<long, long>> requests)
        {
            return DataProvider.SaveFollowRequests(requests);
        }
    }
}
