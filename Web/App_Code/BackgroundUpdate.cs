/*
 * class BackgroundUpdate is used for updating and storing information from instagram in a thread
*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;
using DBUtil;

namespace MySocioMe.Web.Util
{
    public class BackgroundUpdate
    {
        //function _user, stores/updates information about a user in database
        private static void _user(object obj)
        {
            try
            {
                //cat object to User
                User u = (User)obj;

                //check the object contains valid user information
                if (u == null || string.IsNullOrEmpty(u.UserID) || string.IsNullOrEmpty(u.UserName)) return;

                //store information in database
                DBController.update_user(u, overrideData: true);
            }
            catch (Exception ex)
            {
                //if functions throws an error, we save the error information as log in database
                DBController.save_error_log(null, "UpdateUser", ex);
            }
        }

        //function _media, stores/updates information about a list of media in database
        //this function also updates information about users that have sent these media
        private static void _media(object obj)
        {
            try
            {
                //because we also need to store information about the tags of each media,
                //we need to separate and store them
                List<Media> items = (List<Media>)obj;
                List<MediaTag> tags = new List<MediaTag>();

                Dictionary<string, Media> mediaDic = new Dictionary<string, Media>();
                Dictionary<string, User> senders = new Dictionary<string, User>();

                //return if the main object is null
                if (items == null) return;

                //collection of information we need
                foreach (Media m in items)
                {
                    if (mediaDic.ContainsKey(m.MediaID)) continue;
                    else mediaDic[m.MediaID] = m;

                    if (!senders.ContainsKey(m.Sender.UserID)) senders[m.Sender.UserID] = m.Sender;

                    if (m.TagNames != null && m.TagNames.Count > 0)
                        foreach (string t in m.TagNames) tags.Add(new MediaTag() { MediaID = m.MediaID, Name = t });
                }

                //store information in database
                DBController.update_users(senders.Select(u => u.Value).ToList());
                DBController.update_media(mediaDic.Select(u => u.Value).ToList(), tags);
            }
            catch (Exception ex)
            {
                //if functions throws an error, we save the error information as log in database
                DBController.save_error_log(null, "UpdateMedia", ex);
            }
        }

        //function user starts a thread for updating information about a user
        public static void user(User usr)
        {
            ThreadPool.QueueUserWorkItem(new WaitCallback(_user), usr);
        }

        //function media starts a thread for updating information about a list of media
        public static void media(List<Media> media)
        {
            ThreadPool.QueueUserWorkItem(new WaitCallback(_media), media);
        }
    }
}