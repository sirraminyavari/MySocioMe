﻿(function () {
    if (window.RAPI) return;
        BaseURL: "http://localhost:20470/ajax/",
            API: function () { return RAPI.BaseURL + "api.ashx" }
        },
            try {
                input = GlobalUtilities.get_type(input) == "json" ? input : JSON.parse(input);
                if ((input || {}).logged_out) window.location.href = "../login";
                return input;
            }
            catch (e) { return input; }
        },
            if (GlobalUtilities.get_type(callback) != "function") return;
                callback(RAPI._parse(d));
            });
        },
            if ((RAPI.Ticket === false) || RAPI.Ticket) return callback(RAPI.Ticket, true);
                command: "authenticate", username: RAPI._Username, password: RAPI._Password
            }, function (d) { callback(RAPI.Ticket = (d || {}).Ticket ? d.Ticket : false); });
        },
            if (GlobalUtilities.get_type(callback) != "function") return;
        },
            RAPI.send_request(handler, data, callback, { Method: "POST" });
        },
            RAPI.send_request(handler, data, callback, { Method: "GET" });
        },

        logout: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "logout" }), callback);
        },

        get_user: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "getuser" }), callback);
        },

        user_media: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "usermedia" }), callback);
        },

        tag_media: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "tagmedia" }), callback);
        },

        location_media: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "locationmedia" }), callback);
        },

        search_users: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "searchusers" }), callback);
        },

        follows: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "follows" }), callback);
        },

        followed_by: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "followedby" }), callback);
        },

        requested_by: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "requestedby" }), callback);
        },

        relationship: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "relationship" }), callback);
        },

        modify_relationship: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "modifyrelationship" }), callback);
        },

        search_media: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "searchmedia" }), callback);
        },

        comments: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "comments" }), callback);
        },

        send_comment: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "sendcomment" }), callback);
        },

        likes: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "likes" }), callback);
        },

        like: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "like" }), callback);
        },

        comment_all: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "commentall" }), callback);
        },

        like_all: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "likeall" }), callback);
        },

        tag: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "tag" }), callback);
        },

        search_tags: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "searchtags" }), callback);
        },

        media_senders_of_tag: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "mediasendersoftag" }), callback);
        },

        fans_of_tag: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "fansoftag" }), callback);
        },

        find_favorite_tags: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "findfavoritetags" }), callback);
        },

        find_pages_to_bookmark: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "findpagestobookmark" }), callback);
        },

        suggest_users_to_follow: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "suggestuserstofollow" }), callback);
        },

        media_senders_of_location: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "mediasendersoflocation" }), callback);
        },

        search_locations: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "searchlocations" }), callback);
        },

        bookmark_user: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "bookmarkuser" }), callback);
        },

        remove_bookmarked_user: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "removebookmarkeduser" }), callback);
        },

        get_bookmarked_users: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "getbookmarkedusers" }), callback);
        },

        set_alias: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "setalias" }), callback);
        },

        remove_alias: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "removealias" }), callback);
        },

        bookmark_tag: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "bookmarktag" }), callback);
        },

        remove_bookmarked_tag: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "removebookmarkedtag" }), callback);
        },

        get_bookmarked_tags: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "getbookmarkedtags" }), callback);
        },

        bookmark_location: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "bookmarklocation" }), callback);
        },

        remove_bookmarked_location: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "removebookmarkedlocation" }), callback);
        },

        get_bookmarked_locations: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "getbookmarkedlocations" }), callback);
        },

        get_categories: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "getcategories" }), callback);
        },

        save_category: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "savecategory" }), callback);
        },

        remove_category: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "removecategory" }), callback);
        },

        category_media: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "categorymedia" }), callback);
        },

        hourly_insight: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "hourlyinsight" }), callback);
        },

        daily_insight: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "dailyinsight" }), callback);
        },

        monthly_trend: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "monthlytrend" }), callback);
        },

        tags_insight: function (data, callback) {
            RAPI.post(RAPI.Handler.API(), GlobalUtilities.extend(data || {}, { command: "tagsinsight" }), callback);
        }
    }
})();