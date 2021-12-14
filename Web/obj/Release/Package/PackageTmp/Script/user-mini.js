(function () {
    if (window.UserMini) return;

    window.UserMini = function (container, params, options) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;
        options = options || {};

        this.Objects = {
            User: params,
            Comment: options.Comment,
            FollowingStatus: options.FollowingStatus,
            UserContainer: null
        };

        this.Options = {
            Micro: options.Micro === true,
            TopClass: options.TopClass,
            CommentMode: options.CommentMode === true,
            FollowButton: (window.RVGlobal.user_id != this.Objects.User.id) && options.FollowButton,
            OnBookmark: options.OnBookmark,
            BookmarkButton: !!(options.OnBookmark && options.BookmarkButton),
            OnStatsClick: options.OnStatsClick,
            StatsButton: !!(options.OnStatsClick && options.StatsButton)
        };

        this.initialize();
    }

    UserMini.prototype = {
        initialize: function () {
            var that = this;

            if (that.Options.Micro) that.show_user_micro();
            else if (that.Options.CommentMode) that.show_user_comment();
            else that.show_user();
        },

        dispose: function () {
            var that = this;
            if (!that.Objects.UserContainer) return;
            jQuery(that.Objects.UserContainer).fadeOut(500, function () { this.remove() });
        },

        show_user_micro: function () {
            var that = this;

            var id = that.Objects.User.id;
            var username = that.Objects.User.username;
            var profilePicture = that.Objects.User.image_url;
            var fullname = that.Objects.User.full_name;

            var bookmarked = that.Objects.User.bookmarked;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: that.Options.TopClass || "small-12 medium-6 large-4",
                    Style: "padding:0.4rem; min-height:5rem;", Name: "container",
                    Childs: [
                        {
                            Type: "div",
                            Class: "small-12 medium-12 large-12 row align-center rv-border-radius-1 SoftBorder SoftShadow",
                            Style: "position:relative; margin:0rem; padding:0.5rem; padding-left:5rem; height:100%;" +
                                "border-color:rgb(200,200,200); background-color:white;" +
                                (that.Options.BookmarkButton ? "padding-right:2rem;" : ""),
                            Childs: [
                                {
                                    Type: "div", Style: "position:absolute; top:0rem; bottom:0rem; left:0.5rem; width:4rem;",
                                    Childs: [
                                        {
                                            Type: "middle", Style: "text-align:center; padding:0.5rem;",
                                            Childs: [
                                                {
                                                    Type: "img", Class: "rv-circle",
                                                    Style: "max-width:100%; max-height:100%; cursor:pointer;",
                                                    Attributes: [{ Name: "src", Value: profilePicture }],
                                                    Properties: [{ Name: "onclick", Value: function () { that.show_full_size_image(); } }]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    Type: "div",
                                    Style: "position:absolute; top:0rem; bottom:0rem; right:0rem; width:2rem;" +
                                        (that.Options.BookmarkButton ? "" : "display:none;"),
                                    Childs: [
                                        {
                                            Type: "middle", Style: "text-align:center;",
                                            Childs: [
                                                {
                                                    Type: "i",  Name: "bookmarkButton",
                                                    Class: "fa fa-bookmark fa-lg rv-icon-button" + (bookmarked ? " rv-green" : ""),
                                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12", Style: "font-weight:bold;",
                                    Childs: [
                                        {
                                            Type: "div", Style: "display:inline-block;",
                                            Childs: [{ Type: "text", TextValue: username }]
                                        },
                                        {
                                            Type: "div", Class: "rv-bg-color-trans-soft SoftBorder",
                                            Style: "margin-left:0.5rem; font-size:0.6rem; font-weight:normal;" +
                                                "padding:0rem 0.2rem; display:inline-block; cursor:pointer;" +
                                                GlobalUtilities.border_radius("0.2rem"),
                                            Properties: [{ Name: "onclick", Value: function () { that.show_media(); } }],
                                            Childs: [{Type: "text", TextValue: "media"}]
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12", Style: "margin-top:0.5rem;",
                                    Childs: [{ Type: "text", TextValue: fullname }]
                                },
                                {
                                    Type: "div", Class: "small-5 medium-5 large-5 ActionButton", Name: "followButton",
                                    Properties: [
                                        {
                                            Name: "onmouseover",
                                            Value: function () {
                                                this.innerHTML = that.Objects.FollowingStatus == "follows" ? "Unfollow" :
                                                    (that.Objects.FollowingStatus == "requested" ? "Requested" : "Follow");
                                            }
                                        },
                                        {
                                            Name: "onmouseout",
                                            Value: function () {
                                                this.innerHTML = that.Objects.FollowingStatus == "follows" ? "Following" :
                                                    (that.Objects.FollowingStatus == "requested" ? "Requested" : "Follow");
                                            }
                                        }
                                    ],
                                    Style: "margin-top:0.5rem; font-size:0.6rem; height:0.8rem;" + (that.Options.FollowButton ? "" : "display:none;")
                                }
                            ]
                        }
                    ]
                }
            ], that.Container);
            
            that.Objects.UserContainer = elems["container"];

            if (elems["bookmarkButton"]) {
                elems["bookmarkButton"].onclick = function () {
                    if (that.Options.OnBookmark) that.Options.OnBookmark(function (_bookmarked) {
                        that.Objects.User.bookmarked = bookmarked = _bookmarked;

                        var cls = "fa fa-bookmark fa-lg rv-icon-button" + (_bookmarked ? " rv-green" : "");
                        elems["bookmarkButton"].setAttribute("class", cls);
                    });
                };
            }

            if (that.Options.FollowButton) {
                var _set_follow_button_text = function () {
                    elems["followButton"].innerHTML = that.Objects.FollowingStatus == "follows" ? "Following" :
                        (that.Objects.FollowingStatus == "requested" ? "Requested" : "Follow");
                };

                var processing = false;

                elems["followButton"].onclick = function () {
                    if (processing) return;
                    processing = true;

                    RAPI.modify_relationship({
                        user_id: id,
                        action: that.Objects.FollowingStatus == "none" ? "follow" : "unfollow"
                    }, function (r) {
                        if ((r || {}).outgoing_status) that.Objects.FollowingStatus = r.outgoing_status;
                        _set_follow_button_text();

                        processing = false;
                    });
                };

                _set_follow_button_text();
            }
        },

        show_user_comment: function () {
            var that = this;

            var id = that.Objects.User.id;
            var username = that.Objects.User.username;
            var profilePicture = that.Objects.User.image_url;
            var fullname = that.Objects.User.full_name;
            var text = (that.Objects.Comment || {}).text;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Name: "container",
                    Class: "small-12 medium-12 large-12 rv-border-radius-1 SoftBorder SoftShadow",
                    Style: "position:relative; padding:0.5rem; padding-left:5rem; min-height:4rem; margin:0.4rem 0rem;" +
                        "border-color:rgb(200,200,200); background-color:white;",
                    Childs: [
                        {
                            Type: "div", Style: "position:absolute; top:0rem; bottom:0rem; left:0.5rem; width:4rem;",
                            Childs: [
                                {
                                    Type: "middle", Style: "text-align:center; padding:0.5rem;",
                                    Childs: [
                                        {
                                            Type: "img", Class: "rv-circle",
                                            Style: "max-width:100%; max-height:100%; cursor:pointer;",
                                            Attributes: [{ Name: "src", Value: profilePicture }],
                                            Properties: [{ Name: "onclick", Value: function () { that.show_full_size_image(); } }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Childs: [
                                {
                                    Type: "div", Style: "display:inline-block; font-weight:bold;",
                                    Childs: [{ Type: "text", TextValue: username }]
                                },
                                {
                                    Type: "div", Style: "display:" + (fullname ? "inline-block" : "none") + "; margin-left:0.5rem;",
                                    Childs: [{ Type: "text", TextValue: fullname }]
                                },
                                {
                                    Type: "div", Class: "rv-bg-color-trans-soft SoftBorder",
                                    Style: "margin-left:0.5rem; font-size:0.6rem; font-weight:normal;" +
                                        "padding:0rem 0.2rem; display:inline-block; cursor:pointer;" +
                                        GlobalUtilities.border_radius("0.2rem"),
                                    Properties: [{ Name: "onclick", Value: function () { that.show_media(); } }],
                                    Childs: [{ Type: "text", TextValue: "media" }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12", Style: "margin-top:0.5rem;",
                            Childs: [{ Type: "text", TextValue: text }]
                        }
                    ]
                }
            ], that.Container);

            that.Objects.UserContainer = elems["container"];
        },

        show_user: function () {
            var that = this;

            var id = that.Objects.User.id;
            var username = that.Objects.User.username;
            var profilePicture = that.Objects.User.image_url;
            var fullname = that.Objects.User.full_name;
            var bio = that.Objects.User.bio;
            var website = that.Objects.User.website;
            var mediaCount = that.Objects.User.media;
            var followsCount = that.Objects.User.follows;
            var followedByCount = that.Objects.User.followers;

            var bookmarked = that.Objects.User.bookmarked;
            
            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Name: "container",
                    Class: "small-12 medium-12 large-12 rv-border-radius-1 SoftBorder SoftShadow",
                    Style: "position:relative; margin-bottom:0.5rem; padding:1rem 7rem; min-height:6rem;" +
                        "border-color:rgb(200,200,200); background-color:white; display:none;",
                    Childs: [
                        {
                            Type: "div", Style: "position:absolute; top:0rem; bottom:0rem; left:0.5rem; width:6rem;",
                            Childs: [
                                {
                                    Type: "middle", Style: "text-align:center; padding:0.5rem;",
                                    Childs: [
                                        {
                                            Type: "img", Class: "rv-circle",
                                            Style: "max-width:100%; max-height:100%; cursor:pointer;",
                                            Attributes: [{ Name: "src", Value: profilePicture }],
                                            Properties: [{ Name: "onclick", Value: function () { that.show_full_size_image(); } }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            Type: "div",
                            Style: "position:absolute; top:0rem; bottom:0rem; right:0.5rem; width:6rem;" +
                                "text-align:center; font-size:0.6rem;",
                            Childs: [
                                {
                                    Type: "middle",
                                    Childs: [
                                        {
                                            Type: "div", Class: "rv-comic rv-air-button rv-circle", Name: "mediaCount",
                                            Style: "margin:0.1rem 0rem; padding:0.1rem 0.5rem; cursor:default; display:none;"
                                        },
                                        { Type: "div", Class: "small-12 medium-12 large-12" },
                                        {
                                            Type: "div", Class: "rv-comic rv-air-button rv-circle", Name: "followsCount",
                                            Style: "margin:0.1rem 0rem; padding:0.1rem 0.5rem; display:none;"
                                        },
                                        { Type: "div", Class: "small-12 medium-12 large-12" },
                                        {
                                            Type: "div", Class: "rv-comic rv-air-button rv-circle", Name: "followersCount",
                                            Style: "margin:0.1rem 0rem; padding:0.1rem 0.5rem; display:none;"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "text-align:center; font-weight:bold;",
                            Childs: [
                                {
                                    Type: "div", Style: "display:inline-block;",
                                    Childs: [{ Type: "text", TextValue: username }]
                                },
                                {
                                    Type: "div", Class: "rv-bg-color-trans-soft SoftBorder",
                                    Style: "margin-left:0.5rem; font-size:0.6rem; font-weight:normal;" +
                                        "padding:0rem 0.2rem; display:inline-block; cursor:pointer;" +
                                        GlobalUtilities.border_radius("0.2rem"),
                                    Properties: [{ Name: "onclick", Value: function () { that.show_media(); } }],
                                    Childs: [{ Type: "text", TextValue: "media" }]
                                },
                                {
                                    Type: "div",
                                    Style: "margin-left:0.7rem; display:" + (that.Options.BookmarkButton ? "inline-block" : "none") + ";",
                                    Childs: [
                                        {
                                            Type: "i", Name: "bookmarkButton",
                                            Class: "fa fa-bookmark fa-lg rv-icon-button" + (bookmarked ? " rv-green" : ""),
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        }
                                    ]
                                },
                                {
                                    Type: "div",
                                    Style: "margin-left:0.7rem; display:" + (that.Options.StatsButton ? "inline-block" : "none") + ";",
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-bar-chart fa-lg rv-icon-button", Name: "statsButton",
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "text-align:center; margin-top:0.5rem;",
                            Childs: [{ Type: "text", TextValue: fullname }]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "text-align:center; margin-top:0.5rem;",
                            Childs: [{ Type: "text", TextValue: bio }]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "text-align:center; margin-top:0.5rem;",
                            Childs: [{ Type: "text", TextValue: website }]
                        }
                    ]
                }
            ], that.Container);

            that.Objects.UserContainer = elems["container"];

            if (elems["bookmarkButton"]) {
                elems["bookmarkButton"].onclick = function () {
                    if (that.Options.OnBookmark) that.Options.OnBookmark(function (_bookmarked) {
                        that.Objects.User.bookmarked = bookmarked = _bookmarked;

                        var cls = "fa fa-bookmark fa-lg rv-icon-button" + (_bookmarked ? " rv-green" : "");
                        elems["bookmarkButton"].setAttribute("class", cls);
                    });
                };
            }

            if (elems["statsButton"] && that.Options.OnStatsClick)
                elems["statsButton"].onclick = function () { that.Options.OnStatsClick(); };

            var _count_area = function (container, title, count, onclick) {
                container.style.display = "inline-block";
                
                if (onclick) container.onclick = function () { onclick(); };

                return GlobalUtilities.create_nested_elements([
                    {
                        Type: "span", Style: "margin-right:0.2rem;",
                        Childs: [{ Type: "text", TextValue: title + ":" }]
                    },
                    {
                        Type: "span", Style: "font-weight:bold;" + (!onclick ? "" : "cursor:pointer;"),
                        Childs: [{ Type: "text", TextValue: count || "0" }]
                    }
                ], container)["_area"];
            };

            if (mediaCount || (mediaCount === 0))
                _count_area(elems["mediaCount"], "media", mediaCount);
            
            if (followsCount || (followsCount === 0)) {
                _count_area(elems["followsCount"], "follows", followsCount, function () {
                    that.show_follows_followers(true);
                });
            }

            if (followedByCount || (followedByCount === 0)) {
                followedByCountArea = _count_area(elems["followersCount"], "followers", followedByCount, function () {
                    that.show_follows_followers(false);
                });
            }

            jQuery(elems["container"]).fadeIn(500);
        },

        show_follows_followers: function (follows) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-8 row rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "_div",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                }
                            ]
                        }
                    ]
                }
            ]);

            GlobalUtilities.show(elems["_div"]);

            RAPI[follows ? "follows" : "followed_by"]({}, function (r) {
                elems["_div"].innerHTML = "";

                for (var i = 0, lnt = (r.users || []).length; i < lnt; ++i)
                    new UserMini(elems["_div"], r.users[i], { Micro: true, FollowButton: follows, FollowingStatus: "follows" });
            });
        },

        show_full_size_image: function () {
            var that = this;
            
            var fullSizeProfilePicture = that.Objects.User.image_url; //.replace(/\/s\d{3}x\d{3}/ig, "");
            
            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "label", Class: "rv-border-radius-half SoftBackgroundColor", Name: "_div",
                    Style: "text-align:center; padding:1rem;",
                    Childs: [
                        {
                            Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x", Name: "loading",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        },
                        {
                            Type: "img", Class: "rv-border-radius-half", Name: "image",
                            Style: "max-width:100%; display:none;",
                            Attributes: [{ Name: "src", Value: fullSizeProfilePicture }],
                            Properties: [
                                {
                                    Name: "onload",
                                    Value: function () {
                                        jQuery(elems["loading"]).fadeOut(0, function () {
                                            jQuery(elems["image"]).toggle(500);
                                        });
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]);

            GlobalUtilities.show(elems["_div"], { Style: "text-align:center;" });

            elems["_div"].style.display = "inline-block";
        },

        show_media: function () {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-10 rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "text-align:center; font-size:1.2rem; margin-bottom:1.5rem;",
                            Childs: [
                                { Type: "span", Style: "font-weight:bold;", Childs: [{ Type: "text", TextValue: that.Objects.User.username }] },
                                { Type: "span", Style: "margin-left:0.5rem;", Childs: [{ Type: "text", TextValue: that.Objects.User.full_name }] }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "margin-bottom:1rem; text-align:center; display:none;", Name: "nearbyLocations"
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row",
                            Style: "margin:0rem;", Name: "items",
                            Childs: [
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12",
                                    Style: "text-align:center;", Name: "loading",
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]);

            GlobalUtilities.show(elems["container"]);

            RAPI.user_media({ user_id: that.Objects.User.id }, function (r) {
                jQuery(elems["loading"]).fadeOut(0, function () { this.remove(); });

                for (var i = 0, lnt = (r.items || []).length; i < lnt; ++i)
                    new MediaMini(elems["items"], r.items[i]);
            });
        }
    }
})();



//jQuery.post("http://localhost:20470/ajax/api.ashx", { command: "ipglog", data: "" }, function (r) { alert(JSON.stringify(r), { Original: true }); });