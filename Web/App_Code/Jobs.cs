/*
 * My Social Insight collects data about it's users to give them insight about their page
 * to do this, we need to schedule some jobs for data collection
*/


using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;
using DBUtil;

namespace MySocioMe.Web.Util
{
    public class Jobs
    {
        public static void run()
        {
            //job must be run into thread, because it must be non IO blocking
            ThreadPool.QueueUserWorkItem(new WaitCallback(_run));
        }

        private static void _run(object obj)
        {
            return;//////////////////////////////////////

            //jobs are always running
            //after each attempt, the thread sleeps for 6 hours
            while (true)
            {
                try
                {
                    //update_bookmarks();
                    update_user_media();
                }
                catch (Exception ex)
                {
                    DBController.save_error_log(null, "RunningJobs", ex);
                }

                Thread.Sleep(21600000); //6 hours
            }
        }

        private static void update_user_media()
        {
            string res = string.Empty;

            string maxId = string.Empty, minId = string.Empty;
            bool isFirstRequest = true;
            List<Media> media = new List<Media>();

            List<User> users = DBController.get_activated_users();
            //List<Category> categories = DBController.get_categories(null);
            
            foreach(User u in users)
            {
                //update trend
                if (!update_user_trend(u.UserID, u.Token)) continue;
                
                //update media
                Media oldest = DBController.user_media(u.UserID, 1, 0, true).FirstOrDefault();
                Media newest = DBController.user_media(u.UserID, 1, 0, false).FirstOrDefault();

                media = new List<Media>();

                maxId = oldest != null ? oldest.MediaID : null;
                isFirstRequest = true;

                while (media.Count <= 100 && (isFirstRequest || !string.IsNullOrEmpty(maxId)))
                {
                    isFirstRequest = false;

                    if (!API.user_media(ref res, u.Token, u.UserID, null, maxId) && API.is_logged_out(res))
                    {
                        DBController.log_out(u.UserID);
                        break;
                    }
                    
                    List<Media> m = Media.parse_insta_response(res, ref minId, ref maxId);

                    if (m != null && m.Count > 0) media.AddRange(m);
                }

                minId = newest != null ? newest.MediaID : null;
                isFirstRequest = !string.IsNullOrEmpty(minId);

                while (media.Count <= 100 && (isFirstRequest || !string.IsNullOrEmpty(minId)))
                {
                    isFirstRequest = false;

                    if (!API.user_media(ref res, u.Token, u.UserID, minId, null) && API.is_logged_out(res))
                    {
                        DBController.log_out(u.UserID);
                        break;
                    }

                    List<Media> m = Media.parse_insta_response(res, ref minId, ref maxId);

                    if (m != null && m.Count > 0) media.AddRange(m);
                }

                if (media.Count > 0) BackgroundUpdate.media(media);
                //end of update media

                //update categories
                /*
                List<Category> userCategories = categories.Where(c => c.UserID == u.UserID).ToList();

                Dictionary<string, Media> categoryMedia = new Dictionary<string, Media>();
                Dictionary<string, LocationMedia> locationMedia = new Dictionary<string, LocationMedia>();

                foreach(Category cat in userCategories)
                {
                    foreach(MediaTag tg in cat.Tags)
                    {
                        API.tag_media(ref res, u.Token, tg.Name, null, null, null);

                        List<Media> lst = Media.parse_insta_response(res);

                        for (int i = 0; i < lst.Count; ++i)
                        {
                            lst[i].TagNames = new List<string>() { tg.Name };

                            if (!categoryMedia.ContainsKey(lst[i].MediaID))
                                categoryMedia[lst[i].MediaID] = lst[i];
                            else
                            {
                                foreach (string tname in lst[i].TagNames)
                                {
                                    if (!categoryMedia[lst[i].MediaID].TagNames.Any(n => n == tname))
                                        categoryMedia[lst[i].MediaID].TagNames.Add(tname);
                                }
                            }
                        }
                    }

                    foreach(BookmarkedLocation loc in cat.Locations)
                    {
                        API.search_media(ref res, u.Token, loc.Latitude.ToString(), 
                            loc.Longitude.ToString(), loc.Radius.ToString());

                        List<Media> lst = Media.parse_insta_response(res);

                        for (int i = 0; i < lst.Count; ++i)
                        {
                            lst[i].TagNames = new List<string>();

                            if (!categoryMedia.ContainsKey(lst[i].MediaID))
                                categoryMedia[lst[i].MediaID] = lst[i];
                            else
                            {
                                foreach (string tname in lst[i].TagNames)
                                {
                                    if (!categoryMedia[lst[i].MediaID].TagNames.Any(n => n == tname))
                                        categoryMedia[lst[i].MediaID].TagNames.Add(tname);
                                }
                            }

                            string mixedId = loc.ID.ToString() + "_" + lst[i].MediaID;

                            if (!locationMedia.ContainsKey(mixedId)) locationMedia[mixedId] = new LocationMedia()
                            {
                                Media = lst[i],
                                Location = loc
                            };
                        }
                    }
                }

                List<MediaTag> tags = new List<MediaTag>();

                foreach (Media m in categoryMedia.Values)
                {
                    if (m.TagNames.Count > 0)
                        foreach (string t in m.TagNames) tags.Add(new MediaTag() { MediaID = m.MediaID, Name = t });
                }

                DBController.update_public_media(categoryMedia.Values.ToList(), tags);
                DBController.update_location_media(locationMedia.Values.ToList());
                */
                //end of update categories
            }
        }

        protected static bool update_user_trend(string userId, string token)
        {
            string res = string.Empty;

            //trend means the user's media count, followers count and count of users that the user follows in
            //distinct periods of time. but thus we store them day by day, each time the jub runs,
            //we need to check if we have stored data in the past 24 hours
            UserTrendItem trnd = DBController.get_user_trend_items(userId, 1).FirstOrDefault();

            //getting the latest information about the user from instagram
            if (!API.get_user(ref res, token, null)) return !API.is_logged_out(res);

            User usr = User.parse_insta_response(res).FirstOrDefault();

            if (usr != null)
            {
                //update information about the user in database
                DBController.update_user(usr);

                //check if storing trend information is needed
                if ((trnd == null || !trnd.Time.HasValue || trnd.Time.Value < DateTime.UtcNow.AddHours(-23)))
                {
                    //store trend information in database
                    DBController.add_user_trend_item(userId, usr.Media.HasValue ? usr.Media.Value : 0,
                        usr.Follows.HasValue ? usr.Follows.Value : 0, usr.Followers.HasValue ? usr.Followers.Value : 0);
                }
            }

            return true;
        }

        //main thread. this thread updates information about all of bookmarks of all users
        protected static void update_bookmarks()
        {
            /*
             * Answer the following questions about the bookmarked tags:
             * 
             * 1. which pages are active content creators for each of bookmarked tags
             * 2. which users are active fans of each of bookmarked tags (processes both likes and comments)
             * 
             * **************************************************************************
             * **************************************************************************
             * 
             * Answer the following questions about the bookmarked locations:
             * 
             * 1. which users share media in that location
             * 
             * **************************************************************************
             * **************************************************************************
             * 
             * Answer the following questions about the bookmarked pages:
             * 
             * 1. Who are the followers of the page and how much active are them? (processes both likes and comments)
             * 2. How are the statistics about the page?
             * 3. What are the tags used by the page?
            */

            //list of all bookmarked pages (users) of all users
            List<BookmarkedUser> bookmarkedUsers = DBController.get_bookmarked_users(null);

            //list of all bookmarked tags of all users
            List<BookmarkedTag> bookmarkedTags = DBController.get_bookmarked_tags(null);

            //list of all bookmarked locations of all users
            List<BookmarkedLocation> bookmarkedLocations = DBController.get_bookmarked_locations(null);

            //list of all distinct users that have bookmarked something
            List<string> userIds = new List<string>();
            userIds.AddRange(bookmarkedUsers.Select(u => u.UserID));
            userIds.AddRange(bookmarkedTags.Select(u => u.UserID));
            userIds.AddRange(bookmarkedLocations.Select(u => u.UserID));
            userIds = userIds.Distinct().ToList();
            List<User> users = DBController.get_users(null, userIds)
                .Where(u => !string.IsNullOrEmpty(u.Code) && !string.IsNullOrEmpty(u.Token)).ToList();

            //get and fetch data for each user
            foreach (User usr in users)
            {
                string res = string.Empty;

                //check if authentication credentials are still valid
                if (!API.get_user(ref res, usr.Token, usr.UserID) && API.is_logged_out(res))
                {
                    //if the token is not valid anymore, user's authentication credentials must be dropped
                    DBController.log_out(usr.UserID);
                    continue;
                }

                //update info for current user
                update_user(usr.UserID, usr.Token);

                //store list of recent media liked by current user
                //this helps finding tags to suggest for bookmark
                if (API.liked(ref res, usr.Token, null, 200.ToString()))
                {
                    List<Media> media = Media.parse_insta_response(res);

                    BackgroundUpdate.media(media);

                    List<MediaFan> fans = media.Select(u => new MediaFan()
                    {
                        MediaID = u.MediaID,
                        UserID = usr.UserID,
                        Liked = true
                    }).ToList();

                    DBController.add_media_fans(fans);
                }

                /* start updating information about bookmarked users/pages */
                //update info about all of the users that have been bookmarked by current user
                foreach (BookmarkedUser bu in bookmarkedUsers.Where(u => u.UserID == usr.UserID))
                {
                    //if bookmarked user is one of the users that have bookmarked somethig, 
                    //updating their information is not necessary
                    if (!users.Any(u => u.UserID == bu.BookmarkedUserID)) update_user(bu.BookmarkedUserID, usr.Token);
                }
                /* end of updating information about bookmarked users/pages */


                /* start updating information about bookmarked tags */
                //list of tags that will be updated soon
                List<MediaTag> tags = new List<MediaTag>();

                foreach (BookmarkedTag bt in bookmarkedTags.Where(u => u.UserID == usr.UserID))
                {
                    MediaTag tg = null;

                    //getting information about the bookmarked tag from instagram
                    if(API.tag(ref res, usr.Token, bt.Tag.Name) &&
                        (tg = MediaTag.parse_insta_response(res).FirstOrDefault()) != null)
                    {
                        //because instagram doesn't have 'id' for tags, the value of 'id' field must be set
                        tg.TagID = bt.Tag.TagID;

                        //adding the tag to the list of tags waiting for update
                        tags.Add(tg);
                    }

                    //update information about the bookmarked tag
                    if (API.tag_media(ref res, usr.Token, bt.Tag.Name, null, null, 200.ToString()))
                        update_media(Media.parse_insta_response(res), usr.Token);
                }

                DBController.update_tags(tags);
                /* end of updating information about bookmarked tags */

                /* start updating information about bookmarked locations */
                Dictionary<string, FollowSuggestion> suggested = new Dictionary<string, FollowSuggestion>();

                foreach (BookmarkedLocation bl in bookmarkedLocations.Where(u => u.UserID == usr.UserID))
                {
                    int radius = !bl.Radius.HasValue ? API.MAX_MEDIA_RADIUS : bl.Radius.Value;

                    //search for media in bookmarked location
                    if (!API.search_media(ref res, usr.Token,
                        bl.Latitude.ToString(), bl.Longitude.ToString(), radius.ToString())) continue;

                    List<User> mediaSenders = new List<User>();

                    //collecting users that have sent media to store them in database
                    foreach (Media m in Media.parse_insta_response(res))
                    {
                        if (!suggested.ContainsKey(m.Sender.UserID))
                        {
                            mediaSenders.Add(m.Sender);

                            suggested[m.Sender.UserID] = new FollowSuggestion()
                            {
                                User = new User() { UserID = usr.UserID },
                                Suggested = new User() { UserID = m.Sender.UserID },
                                LocationID = bl.ID
                            };
                        }
                    }

                    //update information about media senders
                    DBController.update_users(mediaSenders);
                }

                //store media senders as follow suggestions in database
                DBController.add_follow_suggestions(suggested.Select(u => u.Value).ToList());
                /* end of updating information about bookmarked locations */
            }
        }

        //update_user function, updates information about a user
        //this information consists of user's info from instagram, user's followers, 
        //users that the user follows and media created by the user
        protected static void update_user(string userId, string token)
        {
            string res = string.Empty;

            //update user trend
            update_user_trend(userId, token);

            //getting infromation about users that the user follows from instagram
            if(API.follows(ref res, token))
            {
                //parse instagram results
                List<User> followed = User.parse_insta_response(res);

                //store or update information about the users in database
                DBController.update_users(followed);

                //store the users as followers in database
                DBController.add_followers(followed.Select(u => new Follow()
                {
                    Followed = new User() { UserID = u.UserID },
                    Following = new User() { UserID = userId }
                }).ToList());
            }

            //getting infromation about followers of the user from instagram
            if (API.followed_by(ref res, token))
            {
                //parse instagram results
                List<User> followers = User.parse_insta_response(res);

                //store or update information about the users in database
                DBController.update_users(followers);

                //store the users as followers in database
                DBController.add_followers(followers.Select(u => new Follow()
                {
                    Followed = new User() { UserID = userId },
                    Following = new User() { UserID = u.UserID }
                }).ToList());
            }
            
            //update information about recent media of the user
            if (API.user_media(ref res, token, userId))
                update_media(Media.parse_insta_response(res), token);
        }

        //update_media function, updates information about media
        //this information consists of media's info from instagram, likes and comments
        protected static void update_media(List<Media> media, string token)
        {
            string res = string.Empty;
            
            //store or update information about media in database
            BackgroundUpdate.media(media);

            //fans of media are users that have liked media or commented on it
            Dictionary<string, MediaFan> fans = new Dictionary<string, MediaFan>();

            foreach (Media m in media)
            {
                //getting list of users that have liked media from instagram
                if (API.likes(ref res, token, m.MediaID))
                {
                    //parse instagram response
                    List<User> likes = User.parse_insta_response(res);

                    //add users found to the list
                    foreach (User u in likes)
                    {
                        string fId = m.MediaID + "_" + u.UserID;

                        if (fans.ContainsKey(fId)) fans[fId].Liked = true;
                        else fans[fId] = new MediaFan() { MediaID = m.MediaID, UserID = u.UserID, Liked = true };
                    }
                }

                //getting list of users that have commented on media from instagram
                if (API.comments(ref res, token, m.MediaID))
                {
                    //parse instagram response
                    List<User> comments = Comment.parse_insta_response(res).Select(u => u.Sender).ToList();

                    //add users found to the list
                    foreach (User u in comments)
                    {
                        string fId = m.MediaID + "_" + u.UserID;

                        if (fans.ContainsKey(fId)) fans[fId].Commented = true;
                        else fans[fId] = new MediaFan() { MediaID = m.MediaID, UserID = u.UserID, Commented = true };
                    }
                }
            }

            //store users in database
            DBController.add_media_fans(fans.Select(u => u.Value).ToList());
        }
    }
}