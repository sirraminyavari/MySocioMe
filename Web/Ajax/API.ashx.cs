/*
 * this API class handles all of the http[s] requests and sends back the appropriate response to them
 * all of the requests contain a parameter named 'command'
 * the main method (ProcessRequest) uses this parameter to determine which API to call and what to do
*/

using System;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Collections;
using DBUtil;

namespace MySocioMe.Web.Ajax
{
    /// <summary>
    /// Summary description for API
    /// </summary>
    public class API : IHttpHandler, System.Web.SessionState.IRequiresSessionState
    {
        //function ProcessRequest handles incoming requests
        public void ProcessRequest(HttpContext context)
        {
            try
            {
                string command = context.Request.Params["command"];
                command = string.IsNullOrEmpty(command) ? string.Empty : command.ToLower().Trim();

                string localToken = context.Request.Params["token"];

                if (command == "ping" && !string.IsNullOrEmpty(localToken))
                {
                    return_response("{\"result\":\"" +
                        (DBController.get_local_token_owner(localToken) == null ? "nok" : "ok") + "\"}");
                    return;
                }

                //user can send requests only after login, 
                //and thus login credentials such as 'code', 'access-token' and 'user-id' are stored in session
                string code = (string)context.Session[Util.API.CodeSessionVariableName];
                string token = (string)context.Session[Util.API.TokenSessionVariableName];
                string userId = (string)context.Session[Util.API.UserIDSessionVariableName];

                bool result = true;
                string responseText = string.Empty;

                if (!string.IsNullOrEmpty(localToken))
                {
                    User usr = DBController.get_local_token_owner(localToken);

                    if (usr != null)
                    {
                        userId = usr.UserID;
                        code = usr.Code;
                        token = usr.Token;
                    }
                }

                bool redirect = !string.IsNullOrEmpty(context.Request.Params["redirect"]) &&
                    context.Request.Params["redirect"].Trim().ToLower() == "true";

                switch (command)
                {
                    case "ipglog":
                        {
                            List<User> users = new List<User>();

                            List<IPGLog> logs = IPGLog.parse_request(userId, context.Request.Params, ref users);

                            DBController.update_users(users, false);

                            bool succeed = DBController.save_ipg_log(logs);

                            string fakeRes = string.Empty;
                            logout(ref fakeRes);

                            return_response("{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}");

                            return;
                        }
                    case "apppurchaselog":
                        {
                            int? amount = PublicMethods.parse_int(context.Request.Params["amount"]);

                            bool succeed = amount.HasValue &&
                                DBController.app_purchase_log(userId, context.Request.Params["app_name"],
                                context.Request.Params["purchase_id"], amount.Value,
                                context.Request.Params["payment_provider"], context.Request.Params["agent_id"]);

                            string fakeRes = string.Empty;
                            logout(ref fakeRes);

                            return_response("{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}");

                            return;
                        }
                    case "suggestfollowrequests":
                        {
                            List<long> userIds = ListMaker.get_long_items(context.Request.Params["user_ids"], ',');
                            Dictionary<string, object> ret = DBController.suggest_follow_requests(userIds);

                            string fakeRes = string.Empty;
                            logout(ref fakeRes);

                            return_response(PublicMethods.toJSON(ret));
                            return;
                        }
                    case "savefollowrequests":
                        {
                            Dictionary<string, object> dic = PublicMethods.fromJSON(context.Request.Params["requests"]);

                            ArrayList lst = !dic.ContainsKey("Items") ? new ArrayList() : (ArrayList)dic["Items"];

                            List<KeyValuePair<long, long>> requests = new List<KeyValuePair<long, long>>();

                            foreach (object obj in lst)
                            {
                                Dictionary<string, object> item = (Dictionary<string, object>)obj;
                                long uId = 0, tuId = 0;
                                if (item.ContainsKey("UserID") && item.ContainsKey("TargetUserID") &&
                                    long.TryParse(item["UserID"].ToString(), out uId) &&
                                    long.TryParse(item["TargetUserID"].ToString(), out tuId))
                                    requests.Add(new KeyValuePair<long, long>(uId, tuId));
                                else
                                {
                                    string ramin = ";";
                                    string yavari = ramin;
                                }
                            }

                            bool succeed = requests.Count > 0 && DBController.save_follow_requests(requests);

                            string fakeRes = string.Empty;
                            logout(ref fakeRes);

                            return_response("{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}");
                            return;
                        }
                }
                
                //if each of 'code', 'access-token' and 'user-id' is not stored in session, 
                //it means the user has not logged in yet
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(token) || string.IsNullOrEmpty(userId))
                {
                    logout(ref responseText);

                    if (redirect) context.Response.Redirect("~/login");
                    else return_response(responseText);

                    return;
                }

                //switch checks the 'command' and determines which part of code to execute
                switch (command)
                {
                    case "logout":
                        logout(ref responseText);
                        if (redirect)
                        {
                            context.Response.Redirect("~/login");
                            return;
                        }
                        break;
                    case "getuser":
                        {
                            result = Util.API.get_user(ref responseText, token, context.Request.Params["user_id"]);

                            if (result)
                            {
                                User u = User.parse_insta_response(responseText).FirstOrDefault();

                                if (u != null)
                                {
                                    responseText = PublicMethods.toJSON(u.toDictionary());

                                    Util.BackgroundUpdate.user(u);
                                }
                            }
                        }
                        break;
                    case "usermedia":
                    case "tagmedia":
                    case "locationmedia":
                    case "searchmedia":
                        {
                            List<Media> lstMedia = null;

                            string nextMinId = string.Empty, nextMaxId = string.Empty;

                            if (command == "usermedia")
                            {
                                string targetUserId = context.Request.Params["user_id"];

                                int? count = PublicMethods.parse_int(context.Request.Params["count"]);
                                int? lowerBoundary = PublicMethods.parse_int(context.Request.Params["lower_boundary"]);

                                if (count.HasValue)
                                    lstMedia = DBController.user_media(targetUserId, count, lowerBoundary, false);
                                else
                                {
                                    result = Util.API.user_media(ref responseText, token,
                                        userId == targetUserId ? string.Empty : targetUserId, context.Request.Params["min_id"],
                                        context.Request.Params["max_id"], context.Request.Params["count"]);

                                    if (result)
                                    {
                                        lstMedia = Media.parse_insta_response(responseText, ref nextMinId, ref nextMaxId);

                                        if (DBController.is_activated_user(targetUserId)) Util.BackgroundUpdate.media(lstMedia);
                                    }
                                }
                            }
                            else if (command == "tagmedia")
                            {
                                result = Util.API.tag_media(ref responseText, token, context.Request.Params["tag_name"],
                                    context.Request.Params["max_id"], context.Request.Params["min_id"],
                                    context.Request.Params["count"]);
                                if (result) lstMedia = Media.parse_insta_response(responseText);
                            }
                            else if (command == "locationmedia")
                            {
                                result = Util.API.location_media(ref responseText, token, context.Request.Params["location_id"],
                                    context.Request.Params["max_id"], context.Request.Params["min_id"]);
                                if (result) lstMedia = Media.parse_insta_response(responseText);
                            }
                            else if (command == "searchmedia")
                            {
                                result = Util.API.search_media(ref responseText, token, context.Request.Params["latitude"],
                                    context.Request.Params["longitude"], context.Request.Params["distance"]);
                                if (result) lstMedia = Media.parse_insta_response(responseText);
                            }

                            if (result)
                            {
                                Dictionary<string, object> dic = new Dictionary<string, object>();

                                if (!string.IsNullOrEmpty(nextMinId)) dic["next_min_id"] = nextMinId;
                                if (!string.IsNullOrEmpty(nextMaxId)) dic["next_max_id"] = nextMaxId;
                                dic["items"] = new ArrayList(lstMedia.Select(u => u.toDictionary()).ToList());

                                responseText = PublicMethods.toJSON(dic);
                            }
                        }
                        break;
                    case "searchusers":
                    case "follows":
                    case "followedby":
                    case "requestedby":
                        {
                            bool? checkBookmarks = PublicMethods.parse_bool(context.Request.Params["check_bookmarks"]);

                            if (command == "searchusers")
                            {
                                result = Util.API.search_users(ref responseText, token, context.Request.Params["query"],
                                    context.Request.Params["count"]);
                            }
                            else if (command == "follows")
                                result = Util.API.follows(ref responseText, token);
                            else if (command == "followedby")
                                result = Util.API.followed_by(ref responseText, token);
                            else if (command == "requestedby")
                                result = Util.API.requested_by(ref responseText, token);

                            if (result)
                            {
                                List<User> users = User.parse_insta_response(responseText);

                                if (checkBookmarks.HasValue && checkBookmarks.Value && users.Count > 0)
                                {
                                    List<BookmarkedUser> bm = DBController.get_bookmarked_users(userId);

                                    for (int i = 0; i < users.Count; ++i)
                                    {
                                        if (!bm.Any(x => x.BookmarkedUserID == users[i].UserID)) continue;

                                        BookmarkedUser u =
                                            bm.Where(x => x.BookmarkedUserID == users[i].UserID).FirstOrDefault();

                                        users[i].Bookmarked = true;
                                        if (!string.IsNullOrEmpty(u.Alias)) users[i].Alias = u.Alias;
                                    }
                                }

                                Dictionary<string, object> dic = new Dictionary<string, object>();
                                dic["users"] = new ArrayList(users.Select(u => u.toDictionary()).ToList());

                                responseText = PublicMethods.toJSON(dic);
                            }
                        }
                        break;
                    case "relationship":
                        {
                            string targetUserId = context.Request.Params["user_id"];
                            string targetUserIds = context.Request.Params["user_ids"];

                            if (!string.IsNullOrEmpty(targetUserId))
                            {
                                if (result = Util.API.relationship(ref responseText, token, targetUserId))
                                {
                                    Relationship r = Relationship.parse_insta_response(responseText).FirstOrDefault();
                                    if (r != null) responseText = PublicMethods.toJSON(r.toDictionary());
                                }
                            }
                            else if (!string.IsNullOrEmpty(targetUserIds))
                            {
                                List<Relationship> relations = new List<Relationship>();

                                string[] ids = targetUserIds.Split(',');

                                foreach (string i in ids)
                                {
                                    string usr = string.Empty;

                                    if (!(result = Util.API.relationship(ref usr, token, i)))
                                    {
                                        responseText = usr;
                                        break;
                                    };

                                    Relationship r = Relationship.parse_insta_response(usr).FirstOrDefault();

                                    if (r != null)
                                    {
                                        r.UserID = i;
                                        relations.Add(r);
                                    }
                                }

                                if (result)
                                {
                                    Dictionary<string, object> dic = new Dictionary<string, object>();
                                    dic["items"] = new ArrayList(relations.Select(u => u.toDictionary()).ToList());
                                    responseText = PublicMethods.toJSON(dic);
                                }
                            }

                            break;
                        }
                    case "modifyrelationship":
                        {
                            result = Util.API.modify_relationship(ref responseText, token, context.Request.Params["user_id"],
                                context.Request.Params["action"]);

                            if (result)
                            {
                                Relationship r = Relationship.parse_insta_response(responseText).FirstOrDefault();
                                if (r != null) responseText = PublicMethods.toJSON(r.toDictionary());
                            }
                        }
                        break;
                    case "comments":
                        {
                            result = Util.API.comments(ref responseText, token, context.Request.Params["media_id"]);

                            if (result)
                            {
                                Dictionary<string, object> dic = new Dictionary<string, object>();

                                dic["comments"] = new ArrayList(Comment.parse_insta_response(responseText)
                                    .Select(u => u.toDictionary()).ToList());

                                responseText = PublicMethods.toJSON(dic);
                            }
                        }
                        break;
                    case "sendcomment":
                        result = Util.API.send_comment(ref responseText, token, context.Request.Params["media_id"],
                            context.Request.Params["text"]);
                        if (result) responseText = "{\"result\":\"ok\"}";
                        break;
                    case "likes":
                        {
                            result = Util.API.likes(ref responseText, token, context.Request.Params["media_id"]);

                            if (result)
                            {
                                Dictionary<string, object> dic = new Dictionary<string, object>();

                                dic["users"] = new ArrayList(User.parse_insta_response(responseText)
                                    .Select(u => u.toDictionary()).ToList());

                                responseText = PublicMethods.toJSON(dic);
                            }
                        }
                        break;
                    case "like":
                        {
                            result = Util.API.like(ref responseText, token, context.Request.Params["media_id"]);
                            if (result) responseText = "{\"result\":\"ok\"}";
                        }
                        break;
                    case "commentall":
                    case "likeall":
                        {
                            string[] userIds = context.Request.Params["user_ids"].Split(',');
                            if (userIds == null || userIds.Length == 0) break;

                            string text = context.Request.Params["text"];

                            foreach (string uId in userIds)
                            {
                                if (!Util.API.user_media(ref responseText, token, uId)) break;

                                List<Media> media = Media.parse_insta_response(responseText);
                                if (media == null || media.Count == 0) break;

                                if (command == "commentall")
                                {
                                    if (!string.IsNullOrEmpty(text))
                                        Util.API.send_comment(ref responseText, token, media[0].MediaID, Uri.UnescapeDataString(text));
                                }
                                else
                                {
                                    for (int i = 0; i < Math.Min(media.Count, 5); ++i)
                                        Util.API.like(ref responseText, token, media[i].MediaID);
                                }
                            }
                        }
                        break;
                    case "tag":
                        {
                            result = Util.API.tag(ref responseText, token, context.Request.Params["name"]);

                            if (result)
                            {
                                MediaTag tg = MediaTag.parse_insta_response(responseText).FirstOrDefault();
                                if (tg != null) responseText = PublicMethods.toJSON(tg.toDictionary());
                            }
                        }
                        break;
                    case "searchtags":
                        {
                            bool? checkBookmarks = PublicMethods.parse_bool(context.Request.Params["check_bookmarks"]);

                            result = Util.API.search_tags(ref responseText, token, context.Request.Params["query"]);

                            List<MediaTag> lst = result ? MediaTag.parse_insta_response(responseText) : new List<MediaTag>();

                            if (checkBookmarks.HasValue && checkBookmarks.Value)
                            {
                                List<BookmarkedTag> bt = DBController.get_bookmarked_tags(userId);

                                if (bt != null && bt.Count > 0)
                                {
                                    for (int i = 0; i < lst.Count; ++i)
                                    {
                                        MediaTag b = bt.Where(u => u.Tag.Name == lst[i].Name)
                                            .Select(x => x.Tag).FirstOrDefault();

                                        if (b != null)
                                        {
                                            lst[i].TagID = b.TagID;
                                            lst[i].Bookmarked = true;
                                        }
                                    }
                                }
                            }

                            if (result) responseText = "{\"tags\":[" + string.Join(",", lst.Select(
                                u => PublicMethods.toJSON(u.toDictionary()))) + "]}";
                        }
                        break;
                    case "mediasendersoftag":
                    case "fansoftag":
                        {
                            long? tagId = PublicMethods.parse_long(context.Request.Params["tag_id"]);

                            List<User> users = !tagId.HasValue ? new List<User>() : (command == "mediasendersoftag" ?
                                DBController.media_senders_of_tag(userId, tagId.Value) :
                                DBController.fans_of_tag(userId, tagId.Value));

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["users"] = new ArrayList(users.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "findfavoritetags":
                        {
                            List<MediaTag> tags = DBController.find_favorite_tags(userId,
                                PublicMethods.parse_int(context.Request.Params["count"]));

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["tags"] = new ArrayList(tags.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "findpagestobookmark":
                    case "suggestuserstofollow":
                        {
                            int? count = PublicMethods.parse_int(context.Request.Params["count"]);

                            List<User> users = command == "findpagestobookmark" ?
                                DBController.find_pages_to_bookmark(userId, count) :
                                DBController.suggest_users_to_follow(userId, count);

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["users"] = new ArrayList(users.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "mediasendersoflocation":
                        {
                            long? locationId = PublicMethods.parse_long(context.Request.Params["location_id"]);

                            List<User> users = !locationId.HasValue ? new List<User>() :
                                DBController.media_senders_of_location(userId, locationId.Value);

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["users"] = new ArrayList(users.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "searchlocations":
                        result = Util.API.search_locations(ref responseText, token, context.Request.Params["latitude"],
                            context.Request.Params["longitude"], context.Request.Params["distance"]);
                        break;
                    case "bookmarkuser":
                        {
                            bool succeed = DBController.bookmark_user(userId, context.Request.Params["target_user_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "removebookmarkeduser":
                        {
                            bool succeed =
                                DBController.remove_bookmarked_user(userId, context.Request.Params["target_user_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "getbookmarkedusers":
                        {
                            List<BookmarkedUser> lst = DBController.get_bookmarked_users(userId);

                            List<User> users = new List<User>();

                            foreach (BookmarkedUser itm in lst)
                            {
                                responseText = string.Empty;

                                if (!(result = Util.API.get_user(ref responseText, token, itm.BookmarkedUserID))) break;

                                User u = User.parse_insta_response(responseText).FirstOrDefault();

                                if (u != null)
                                {
                                    u.Bookmarked = true;
                                    if (!string.IsNullOrEmpty(itm.Alias)) u.Alias = itm.Alias;

                                    users.Add(u);
                                }
                            }

                            if (result) responseText = "{\"users\":[" + string.Join(",", users.Select(
                                u => PublicMethods.toJSON(u.toDictionary()))) + "]}";
                        }
                        break;
                    case "setalias":
                        {
                            bool succeed = DBController.set_alias(userId,
                                context.Request.Params["target_user_id"], context.Request.Params["alias"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "removealias":
                        {
                            bool succeed = DBController.remove_alias(userId, context.Request.Params["target_user_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "bookmarktag":
                        {
                            long? tagId = DBController.bookmark_tag(userId, context.Request.Params["tag"]);
                            responseText = "{\"result\":\"" + (tagId.HasValue ? "ok" : "nok") + "\"" +
                                (tagId.HasValue ? ",\"id\":" + tagId.Value.ToString() : string.Empty) + "}";
                        }
                        break;
                    case "removebookmarkedtag":
                        {
                            long? tagId = PublicMethods.parse_long(context.Request.Params["tag_id"]);
                            bool succeed = tagId.HasValue && DBController.remove_bookmarked_tag(userId, tagId.Value);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "getbookmarkedtags":
                        {
                            List<BookmarkedTag> lst = DBController.get_bookmarked_tags(userId);

                            for (int i = 0; lst != null && i < lst.Count; ++i)
                            {
                                responseText = string.Empty;

                                if (!(result = Util.API.tag(ref responseText, token, lst[i].Tag.Name))) break;

                                MediaTag t = MediaTag.parse_insta_response(responseText).FirstOrDefault();

                                if (t != null)
                                    lst[i].Tag.MediaCount = t.MediaCount;
                            }

                            if (result) responseText = "{\"tags\":[" + string.Join(",", lst.Select(
                                u => PublicMethods.toJSON(u.Tag.toDictionary()))) + "]}";
                        }
                        break;
                    case "bookmarklocation":
                        {
                            double? lat = PublicMethods.parse_double(context.Request.Params["latitude"]);
                            double? lng = PublicMethods.parse_double(context.Request.Params["longitude"]);

                            long? newLocationId = null;

                            if (lat.HasValue && lng.HasValue)
                            {
                                newLocationId = DBController.bookmark_location(
                                    PublicMethods.parse_long(context.Request.Params["id"]),
                                    userId, context.Request.Params["name"],
                                    context.Request.Params["alias"], lat.Value, lng.Value,
                                    PublicMethods.parse_int(context.Request.Params["radius"]));
                            }

                            responseText = "{\"result\":\"" + (newLocationId.HasValue ? "ok" : "nok") + "\"" +
                                (newLocationId.HasValue ? ",\"id\":" + newLocationId.Value.ToString() : string.Empty) +
                                "}";
                        }
                        break;
                    case "removebookmarkedlocation":
                        {
                            long? locationId = PublicMethods.parse_long(context.Request.Params["id"]);

                            bool succeed = locationId.HasValue && DBController.remove_bookmarked_location(locationId.Value);

                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "getbookmarkedlocations":
                        {
                            List<BookmarkedLocation> lst = DBController.get_bookmarked_locations(userId);

                            ArrayList items = new ArrayList();

                            foreach (BookmarkedLocation l in lst)
                                items.Add(l.toDictionary());

                            Dictionary<string, object> dic = new Dictionary<string, object>();

                            dic["items"] = items;

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "getcategories":
                        {
                            List<Category> categories = DBController.get_categories(userId);

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["categories"] = new ArrayList(categories.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "savecategory":
                        {
                            Dictionary<string, object> dic =
                                PublicMethods.fromJSON(Base64.decode(context.Request.Params["data"]));

                            Category cat = Category.parse_dictionary(dic);

                            long? id = DBController.save_category(userId, cat);

                            if (id.HasValue) cat = DBController.get_category(id.Value);

                            responseText = "{\"result\":\"" + (id.HasValue ? "ok" : "nok") + "\"" +
                                (!id.HasValue || cat == null ? string.Empty :
                                    ",\"category\":" + PublicMethods.toJSON(cat.toDictionary())) +
                                "}";
                        }
                        break;
                    case "removecategory":
                        {
                            long? id = PublicMethods.parse_long(context.Request.Params["id"]);

                            result = id.HasValue && DBController.remove_category(id.Value);

                            responseText = "{\"result\":\"" + (result ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "categorymedia":
                        {
                            long? id = PublicMethods.parse_long(context.Request.Params["id"]);

                            List<Media> media = !id.HasValue ? new List<Media>() :
                                DBController.category_media(id.Value,
                                PublicMethods.parse_int(context.Request.Params["count"]),
                                PublicMethods.parse_int(context.Request.Params["lower_boundary"]));

                            Dictionary<string, object> dic = new Dictionary<string, object>();
                            dic["items"] = new ArrayList(media.Select(u => u.toDictionary()).ToList());

                            responseText = PublicMethods.toJSON(dic);
                        }
                        break;
                    case "hourlyinsight":
                        {
                            string uId = string.IsNullOrEmpty(context.Request.Params["user_id"]) ? userId :
                                context.Request.Params["user_id"];

                            if (uId != userId && !check_if_follows(ref responseText, token, uId)) break;

                            Dictionary<string, object> value = DBController.hourly_insight(uId,
                               PublicMethods.parse_int(context.Request.Params["timezone_offset"]),
                               PublicMethods.parse_int(context.Request.Params["dayofweek_from"]),
                               PublicMethods.parse_int(context.Request.Params["dayofweek_to"]));
                            responseText = PublicMethods.toJSON(value);
                        }
                        break;
                    case "dailyinsight":
                        {
                            string uId = string.IsNullOrEmpty(context.Request.Params["user_id"]) ? userId :
                                context.Request.Params["user_id"];

                            if (uId != userId && !check_if_follows(ref responseText, token, uId)) break;

                            Dictionary<string, object> value = DBController.daily_insight(uId,
                               PublicMethods.parse_int(context.Request.Params["timezone_offset"]));
                            responseText = PublicMethods.toJSON(value);
                        }
                        break;
                    case "monthlytrend":
                        {
                            string uId = string.IsNullOrEmpty(context.Request.Params["user_id"]) ? userId :
                                context.Request.Params["user_id"];

                            if (uId != userId && !check_if_follows(ref responseText, token, uId)) break;

                            Dictionary<string, object> value = DBController.monthly_trend(uId,
                               PublicMethods.parse_int(context.Request.Params["timezone_offset"]),
                               PublicMethods.parse_int(context.Request.Params["count"]));
                            responseText = PublicMethods.toJSON(value);
                        }
                        break;
                    case "tagsinsight":
                        {
                            string uId = string.IsNullOrEmpty(context.Request.Params["user_id"]) ? userId :
                                context.Request.Params["user_id"];

                            if (uId != userId && !check_if_follows(ref responseText, token, uId)) break;

                            Dictionary<string, object> value = DBController.tags_insight(uId);
                            responseText = PublicMethods.toJSON(value);
                        }
                        break;
                    case "submitface":
                        {
                            bool succeed = DBController.submit_face(context.Request.Params["media_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "removesubmitedface":
                        {
                            bool succeed = DBController.remove_submited_face(context.Request.Params["media_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "comparedfaces":
                        {
                            bool succeed = DBController.compared_faces(context.Request.Params["winner_id"],
                                context.Request.Params["loser_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "savejudgement":
                        {
                            bool succeed = DBController.save_judgement(context.Request.Params["media_id"],
                                context.Request.Params["user_id"], PublicMethods.parse_int(context.Request.Params["score"]),
                                PublicMethods.parse_bool(context.Request.Params["friendship"]),
                                PublicMethods.parse_bool(context.Request.Params["marriage"]));
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "reportface":
                        {
                            bool succeed = DBController.report_face(context.Request.Params["media_id"],
                                context.Request.Params["user_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "undoreportedface":
                        {
                            bool succeed = DBController.undo_reported_face(context.Request.Params["media_id"],
                                context.Request.Params["user_id"]);
                            responseText = "{\"result\":\"" + (succeed ? "ok" : "nok") + "\"}";
                        }
                        break;
                    case "haspurchased":
                        {
                            bool succeed = DBController.has_purchased(userId, context.Request.Params["app_name"]);

                            responseText = "{\"result\":\"" + (succeed ? "yes" : "no") + "\"}";
                        }
                        break;
                }

                if (!result && Util.API.is_logged_out(responseText))
                {
                    DBController.log_out(userId);
                    logout(ref responseText);
                }

                return_response(responseText);
            }
            catch (Exception ex)
            {
                string strEx = ex.ToString();
            }
        }

        protected void return_response(string responseText)
        {
            try
            {
                HttpContext.Current.Response.Clear();
                HttpContext.Current.Response.BufferOutput = true;
                HttpContext.Current.Response.Write(responseText);
                HttpContext.Current.Response.End();
                HttpContext.Current.Response.Close();
            }
            catch { }
        }

        protected void logout(ref string res)
        {
            HttpContext.Current.Session.Clear();
            HttpContext.Current.Session.Abandon();
            res = "{\"logged_out\":true}";
        }

        protected bool check_if_follows(ref string responseText, string token, string userId)
        {
            Relationship rel = new Relationship() { UserID = userId };

            string res = string.Empty;

            if (Util.API.relationship(ref res, token, userId))
            {
                Relationship r = Relationship.parse_insta_response(res).FirstOrDefault();

                if(r != null)
                {
                    rel.OutgoingStatus = r.OutgoingStatus;
                    rel.IncomingStatus = r.IncomingStatus;
                }
            }

            if (rel.OutgoingStatus == "follows") return true;
            else
            {
                responseText = "{\"result\":\"nok\",\"relationship\":" + PublicMethods.toJSON(rel.toDictionary()) + "}";
                return false;
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}