(function () {
    if (window.ProfilePage) return;

    window.ProfilePage = function (container, params) {
        params = params || {};
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;

        this.Objects = {
            UserID: params.UserID,
            ActionParts: { Container: null, Title: null, Like: null, Comment: null, Initialized: false },
            SuggestedIDs: []
        };

        this.initialize();

        this.show_wellcome();
    };

    ProfilePage.prototype = {
        show_wellcome: function () {
            if (!(window.RVGlobal || {}).wellcome) return;

            return;///////////////////////////////////////////////////////////////////////////

            var content = 
                '<div style="font-size:1.2rem; font-weight:bold; text-align:center; margin-bottom:1rem; color:rgb(100,100,100);">' +
                '   Wellcome, we are glad to have you in \'<span style="color:black; font-weight:bold;">My Socio Me</span>\'!' +
                '</div>' +
                '<div>' +
                    'My Socio Me is your private panel to get insights about your Instagram account. ' +
                    'Our insights & reports help you understand your social position. In addition you can ' +
                    '<span style="font-weight:bold; font-style:italic;"> find, follow and observe </span> ' +
                    'other competitors\' social precense.' +
                '</div>' +
                '<div style="font-weight:bold; text-align:center; margin:1rem 0rem;">' +
                    '<div style="display:inline-block;">Let\'s go!</div>' +
                    '<div class="wellcome-more rv-circle ActionButton" style="display:inline-block; margin-left:1rem; font-size:0.8rem; padding:0.2rem 1rem;">read more</div>' +
                '</div>' +
                '<div class="wellcome-content small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" ' +
                    'style="padding:1rem; background-color:white; display:none;">' +
                '<div style="margin:0.5rem 0rem;">' + 
                    '<span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark pages:</span> to better know your competitors and get insights about them!' + 
                '</div>' + 
                '<div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">' + 
                    '<img src="../image/help/bookmark-pages-2.png" class="rv-border-radius-half" style="max-width:80%;" />' + 
                '</div>' + 
                '<div style="margin:0.5rem 0rem;">' + 
                    '<span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark tags:</span> to let us suggest other competitors and people to you and then bookmark or follow them!' + 
                '</div>' + 
                '<div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">' + 
                    '<img src="../image/help/bookmark-tags-2.png" class="rv-border-radius-half" style="max-width:80%;" />' + 
                '</div>' + 
                '<div style="margin:0.5rem 0rem;">' + 
                    '<span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark locations:</span> to let us find people in your target locations and suggest them to you for sending follow request!' + 
                '</div>' + 
                '<div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">' + 
                    '<img src="../image/help/bookmark-locations-2.png" class="rv-border-radius-half" style="max-width:80%;" />' + 
                '</div>' + 
                '<div style="margin:0.5rem 0rem;">' + 
                    '<span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Finally:</span> find the right audience for your business and follow them!' + 
                '</div>' + 
                '<div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">' + 
                    '<img src="../image/help/suggestions.png" class="rv-border-radius-half" style="max-width:80%;" />' + 
                '</div>' + 
                '<div style="margin:0.5rem 0rem;">' + 
                    '<span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">And one more thing!:</span> see our useful reports about your page.' + 
                '</div>' + 
                '<div style="text-align:center; margin-top:0.5rem;">' + 
                    '<img src="../image/help/tags-report.png" class="rv-border-radius-half" style="max-width:80%;" />' + 
                '</div>' +
                '</div>';

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-9 rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "_div"
                }
            ]);

            elems["_div"].innerHTML = content;

            elems["_div"].getElementsByClassName("wellcome-more")[0].onclick = function () {
                if (to) {
                    clearTimeout(to);
                    to = null;
                }

                var btn = this;
                btn.onclick = null;
                jQuery(btn).fadeOut(500);
                jQuery(elems["_div"].getElementsByClassName("wellcome-content")[0]).fadeIn(500);
            };

            var showed = GlobalUtilities.show(elems["_div"]);

            var to = setTimeout(function () { showed.Close(); }, 20000);
        },

        initialize: function () {
            var that = this;

            //to be removed
            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Style: "display:none;", Name: "user"
                },
                {
                    Type: "div", Class: "small-12 medium-12 large-12 row",
                    Style: "margin:0rem; margin-top:2.5rem;", Name: "media"
                }
            ], that.Container);

            that.user(elems["user"]);

            RAPI.user_media({ user_id: that.Objects.UserID }, function (r) {
                for (var i = 0, lnt = (r.items || []).length; i < lnt; ++i)
                    new MediaMini(elems["media"], r.items[i]);
            });

            return;
            //end of to be removed

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Style: "display:none;", Name: "user"
                },
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Style: "display:none; margin-top:2.5rem;", Name: "tags"
                },
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Style: "display:none; margin-top:2.5rem;", Name: "pages"
                },
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Style: "display:none; margin-top:2.5rem;", Name: "suggestions"
                }
            ], that.Container);

            that.do4all();

            that.user(elems["user"]);
            that.tags(elems["tags"]);
            that.suggest_pages(elems["pages"], true);
            that.suggest_pages(elems["suggestions"], false);
        },

        do4all: function () {
            var that = this;

            var buttons = [];

            var _do = function (act, text) {
                var apiFunction = act == "like" ? "like_all" : "comment_all";

                var arr = [], dic = {};

                for (var i = 0, lnt = that.Objects.SuggestedIDs.length; i < lnt; ++i) {
                    if (dic[that.Objects.SuggestedIDs[i]]) continue;
                    dic[that.Objects.SuggestedIDs[i]] = true;
                    arr.push(that.Objects.SuggestedIDs[i]);
                }

                if (!arr.length) return;

                RAPI[apiFunction]({ user_ids: arr.join(","), text: text ? escape(text) : null }, function (r) { });

                var showed = GlobalUtilities.show( GlobalUtilities.create_nested_elements([
                    {
                        Type: "div", Class: "small-10 medium-8 large-6 rv-border-radius-1 rv-comic SoftBackgroundColor",
                        Style: "margin:0rem auto; padding:1rem; text-align:center;", Name: "_div",
                        Childs: [{ Type: "text", TextValue: "you " + (act == "like" ? "liked" : "commented on") + " last media from all suggested pages!" }]
                    }
                ])["_div"]);

                setTimeout(function () { showed.Close(); }, 5000);

                var btn = act == "like" ? that.Objects.ActionParts.Like : that.Objects.ActionParts.Comment;
                var otherBtn = act == "like" ? that.Objects.ActionParts.Comment : that.Objects.ActionParts.Like;

                jQuery(btn).fadeOut(500);
                if (otherBtn.style.display == "none") jQuery(that.Objects.ActionParts.Title).fadeOut(500);
            };

            var _do_click = function (act) {
                if (act == "like") return _do(act);
                
                var _el = GlobalUtilities.create_nested_elements([
                    {
                        Type: "div", Class: "small-10 medium-6 large-5 rv-border-radius-1 SoftBackgroundColor",
                        Style: "margin:0rem auto; padding:1rem;", Name: "_div",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                                Style: "font-weight:bold; text-align:center; margin-bottom:1rem;",
                                Childs: [{ Type: "text", TextValue: "comment on last media from all suggested pages" }]
                            },
                            {
                                Type: "div", Class: "small-12 medium-12 large-12", Style: "margin-bottom:1rem;",
                                Childs: [
                                    {
                                        Type: "textarea", Class: "rv-input", Name: "txtarea",
                                        Style: "width:100%; height:6rem; resize:none;", InnerTitle: "your comment",
                                        Attributes: [{ Name: "cols", Value: 3 }, { Name: "rows", Value: 3 }]
                                    }
                                ]
                            },
                            {
                                Type: "div", Class: "small-10 medium-6 large-4 ActionButton", Style: "margin:0rem auto;",
                                Properties: [
                                    {
                                        Name: "onclick",
                                        Value: function () {
                                            var text = _el["txtarea"].value;
                                            if (!text) return;
                                            shwd.Close();
                                            _do(act, text);
                                        }
                                    }
                                ],
                                Childs: [{ Type: "text", TextValue: "send" }]
                            }
                        ]
                    }
                ]);

                var shwd = GlobalUtilities.show(_el["_div"]);
            };

            var _add_button = function (p) {
                p = p || {};

                var className = "fa " + p.ClassName + " fa-lg";
                var classNameHover = "fa " + p.ClassNameHover + " fa-lg";

                var iconName = p.Name + "Icon";

                buttons.push({
                    Type: "div", Class: "rv-border-radius-quarter SoftBorder tab-button", Name: p.Name,
                    Style: "background-color:white; display:none;", Tooltip: p.Tooltip, TooltipAlign: "left",
                    Properties: [
                        { Name: "onmouseover", Value: function () { elems[iconName].setAttribute("class", classNameHover); } },
                        { Name: "onmouseout", Value: function () { elems[iconName].setAttribute("class", className); } },
                        { Name: "onclick", Value: function () { p.OnClick(); }}
                    ],
                    Childs: [
                        {
                            Type: "i", Class: className, Name: iconName,
                            Style: "line-height:2.5rem; color:" + p.Color + ";",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        }
                    ]
                });
            };

            _add_button({
                Name: "like", ClassName: "fa-heart-o", Tooltip: "like all",
                ClassNameHover: "fa-heart", Color: "rgb(255,7,7)",
                OnClick: function () { _do_click("like"); }
            });

            _add_button({
                Name: "comment", ClassName: "fa-comments-o", Tooltip: "comment all",
                ClassNameHover: "fa-comments", Color: "rgb(75,180,235)",
                OnClick: function () { _do_click("comment"); }
            });

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Style: "position:fixed; bottom:0rem; right:0.25rem; height:50vh;", Name: "container",
                    Childs: [{
                        Type: "middle",
                        Childs: [
                            {
                                Type: "div", Class: "rv-border-radius-quarter WarmBackgroundColor", Name: "action",
                                Style: "display:none; margin-bottom:0.3rem; color:white; font-size:0.6rem;" + 
                                    "width:2.5rem; text-align:center; padding:0.2rem 0rem; cursor:pointer;",
                                Childs: [{Type: "text", TextValue: "action"}]
                            },
                            { Type: "div", Childs: buttons }
                        ]
                    }]
                }
            ], document.body);

            that.Objects.ActionParts.Container = elems["container"];
            that.Objects.ActionParts.Title = elems["action"];
            that.Objects.ActionParts.Like = elems["like"];
            that.Objects.ActionParts.Comment = elems["comment"];

            elems["action"].onclick = function () {
                var msg = "you can like or send comment on last media from all suggested pages. " + 
                    "this helps you introduce yourself to others and give them opportunity to follow you.";

                GlobalUtilities.show(GlobalUtilities.create_nested_elements([
                    {
                        Type: "div", Class: "small-10 medium-6 large-5 rv-border-radius-1 rv-comic SoftBackgroundColor",
                        Style: "margin:0rem auto; padding:1rem; text-align:center;", Name: "_div",
                        Childs: [{ Type: "text", TextValue: msg }]
                    }
                ])["_div"]);
            };
        },

        init_actions: function () {
            var that = this;
            if (that.Objects.ActionParts.Initialized) return;
            that.Objects.ActionParts.Initialized = true;

            jQuery(that.Objects.ActionParts.Title).fadeIn(500);
            jQuery(that.Objects.ActionParts.Like).fadeIn(500);
            jQuery(that.Objects.ActionParts.Comment).fadeIn(500);
        },

        show_actions: function () {
            var that = this;
            if (that.Objects.ActionParts.Container) jQuery(that.Objects.ActionParts.Container).fadeIn(500);
        },

        hide_actions: function () {
            var that = this;
            if (that.Objects.ActionParts.Container) jQuery(that.Objects.ActionParts.Container).fadeOut(500);
        },

        user: function (container) {
            var that = this;

            jQuery(container).fadeIn(500);

            RAPI.get_user({ user_id: that.Objects.UserID }, function (r) { new UserMini(container, r); });
        },

        tags: function (container) {
            var _add = function (tagContainer, tag) {
                if (!tag.bookmarked) tag.bookmarked = false;

                new TagMini(tagContainer, tag, {
                    BookmarkButton: true,
                    OnBookmark: function (callback) {
                        var bookmark = !tag.bookmarked;

                        var _call_api = function () {
                            RAPI[bookmark ? "bookmark_tag" : "remove_bookmarked_tag"]({
                                tag: tag.name,
                                tag_id: tag.id
                            }, function (r) {
                                if (r.result == "ok") { if (callback) callback(bookmark); }
                                else alert("An error occurred!");
                            });
                        };

                        if (bookmark) _call_api();
                        else GlobalUtilities.confirm("Do you want to remove the bookmarked tag?", function (r) {
                            if (r) _call_api();
                        });
                    }
                });
            };

            var msg = "we suggest you to bookmark the following tags, because they have been frequently used on media you have liked";

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                            Childs: [
                                {
                                    Type: "div", Class: "rv-circle rv-comic WarmBackgroundColor",
                                    Style: "display:inline-block; padding:0.5rem 2rem; font-size:0.9rem; color:white;",
                                    Childs: [{ Type: "text", TextValue: msg }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row align-center rv-border-radius-1", 
                            Style: "text-align:center; margin-top:1rem;", Name: "items"
                        }
                    ]
                }
            ], container);

            RAPI.find_favorite_tags({ count: 10 }, function (r) {
                var tags = r.tags || [];

                if (tags.length) jQuery(container).fadeIn(500);

                for (var i = 0; i < tags.length; ++i)
                    _add(elems["items"], tags[i]);
            });
        },

        suggest_pages: function (container, isBookmarkMode) {
            var that = this;

            var apiFunction = "", msg = "";

            if (isBookmarkMode) {
                apiFunction = "find_pages_to_bookmark";
                msg = "we suggest you to bookmark the following users/pages, because they frequently use tags that you have bookmarked";
            }
            else {
                apiFunction = "suggest_users_to_follow";
                msg = "we suggest you to follow the following users/pages, based on your bookmarked tags and locations";
            }

            var _add = function (userContainer, user) {
                if (isBookmarkMode && !user.bookmarked) user.bookmarked = false;

                var options = { Micro: true };

                if (isBookmarkMode) {
                    options = GlobalUtilities.extend(options, {
                        BookmarkButton: true,
                        OnBookmark: function (callback) {
                            var bookmark = !user.bookmarked;

                            var _call_api = function () {
                                RAPI[bookmark ? "bookmark_user" : "remove_bookmarked_user"]({
                                    target_user_id: user.id
                                }, function (r) {
                                    if (r.result == "ok") { if (callback) callback(bookmark); }
                                    else alert("An error occurred!");
                                });
                            };

                            if (bookmark) _call_api();
                            else GlobalUtilities.confirm("Do you want to remove the bookmarked user/page?", function (r) {
                                if (r) _call_api();
                            });
                        }
                    });
                }
                else {
                    options = GlobalUtilities.extend(options, { FollowButton: true, FollowingStatus: "none" });
                }

                that.Objects.SuggestedIDs.push(user.id);

                new UserMini(userContainer, user, options);
            };

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                            Childs: [
                                {
                                    Type: "div", Class: "rv-circle rv-comic WarmBackgroundColor",
                                    Style: "display:inline-block; padding:0.5rem 2rem; font-size:0.9rem; color:white;",
                                    Childs: [{ Type: "text", TextValue: msg }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row align-center rv-border-radius-1",
                            Style: "text-align:center; margin:0rem; margin-top:1rem;", Name: "items"
                        }
                    ]
                }
            ], container);
            
            RAPI[apiFunction]({ count: 10 }, function (r) {
                var users = r.users || [];

                if (users.length) {
                    that.init_actions();
                    jQuery(container).fadeIn(500);
                }

                for (var i = 0; i < users.length; ++i)
                    _add(elems["items"], users[i]);
            });
        }
    };
})();