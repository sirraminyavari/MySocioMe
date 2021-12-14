(function () {
    if (window.MyBookmarks) return;

    window.MyBookmarks = function (container) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;

        this.Objects = {
            Locations: [],
            Pages: [],
            Tags: []
        };

        this.initialize();
    };

    MyBookmarks.prototype = {
        initialize: function () {
            var that = this;

            var sections = [];

            _add_section = function (p) {
                p = p || {};

                var arr = [
                    {
                        Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-half WarmBackgroundColor",
                        Style: "padding:0.5rem 3rem 0.5rem 3rem; position:relative; font-weight:bold; text-align:center;" +
                            "font-size:1.2rem; color:white;" +
                            (p.MarginTop ? "margin-top:" + p.MarginTop + "rem;" : ""),
                        Childs: [
                            {
                                Type: "div", Class: "rv-comic", Style: "text-align:center;",
                                Childs: [{ Type: "text", TextValue: p.Title }]
                            },
                            {
                                Type: "div", Style: "position:absolute; right:0.5rem; top:0rem; bottom:0rem;",
                                Childs: [
                                    {
                                        Type: "middle",
                                        Childs: [
                                            {
                                                Type: "div", Class: "rv-circle",
                                                Style: "background-color:white; width:1.5rem; height:1.5rem; display:none;",
                                                Childs: [
                                                    {
                                                        Type: "i", Name: p.AddButtonName,
                                                        Class: "fa fa-plus rv-icon-button",
                                                        Attributes: [{ Name: "aria-hidden", Value: true }]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        Type: "div", Class: "small-12 medium-12 large-12",
                        Style: "margin-top:1rem;", Name: p.ItemsAreaName
                    }
                ];

                for (var i = 0; i < arr.length; ++i) sections.push(arr[i]);
            };

            _add_section({ Title: "Bookmarked Pages", AddButtonName: "addPage", ItemsAreaName: "pages", MarginTop: 0 });
            _add_section({ Title: "Bookmarked Tags", AddButtonName: "addTag", ItemsAreaName: "tags", MarginTop: 2 });
            _add_section({ Title: "Bookmarked Locations", AddButtonName: "addLocation", ItemsAreaName: "locations", MarginTop: 2 });

            var elems = GlobalUtilities.create_nested_elements(sections, that.Container);

            //init locations
            elems["addLocation"].onclick = function () {
                new LocationPicker({
                    OnSave: function (loc) {
                        RAPI.bookmark_location(loc, function (r) {
                            if (r.result == "ok") {
                                loc.id = r.id;
                                that.add_location(elems["locations"], loc);
                            }
                            else alert("An error occurred!");
                        });
                    }
                });
            };

            elems["locations"].set_empty = function () {
                elems["locations"].innerHTML = "<div style='text-align:center; color:rgb(150,150,150);'>" +
                    "You have not any bookmarked location" + "</div>";
            };

            that.load_locations(elems["locations"], function () {
                jQuery(elems["addLocation"].parentNode).fadeIn(500);
            });
            //end of init locations

            //init pages
            elems["addPage"].onclick = function () {
                that.search_pages(function (user, p) {
                    p = p || {};

                    user.bookmarked = !!p.Add;

                    if (p.Add) that.add_page(elems["pages"], user);
                    else that.remove_page(elems["pages"], user);
                });
            };

            elems["pages"].set_empty = function () {
                elems["pages"].innerHTML = "<div style='text-align:center; color:rgb(150,150,150);'>" +
                    "You have not any bookmarked pages" + "</div>";
            };

            that.load_pages(elems["pages"], function () {
                jQuery(elems["addPage"].parentNode).fadeIn(500);
            });
            //end of init pages

            //init tags
            elems["addTag"].onclick = function () {
                that.search_tags(function (tag, p) {
                    p = p || {};

                    tag.bookmarked = !!p.Add;

                    if (p.Add) that.add_tag(elems["tags"], tag);
                    else that.remove_tag(elems["tags"], tag);
                });
            };

            elems["tags"].set_empty = function () {
                elems["tags"].innerHTML = "<div style='text-align:center; color:rgb(150,150,150);'>" +
                    "You have not any bookmarked tags" + "</div>";
            };

            that.load_tags(elems["tags"], function () {
                jQuery(elems["addTag"].parentNode).fadeIn(500);
            });
            //end of init tags
        },

        load_locations: function (container, callback) {
            var that = this;

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                    Childs: [
                        {
                            Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        }
                    ]
                }
            ], container);

            RAPI.get_bookmarked_locations({}, function (r) {
                var locations = r.items || [];

                jQuery(container).fadeOut(500, function () {
                    container.innerHTML = "";

                    if (!locations.length) container.set_empty();
                    else {
                        for (var i = 0; i < locations.length; ++i)
                            that.add_location(container, locations[i]);
                    }

                    jQuery(container).fadeIn(500, function () { callback(); });
                });
            });
        },

        add_location: function (container, location) {
            var that = this;

            if (!that.Objects.Locations.length && container.firstChild) {
                jQuery(container.firstChild).fadeOut(500, function () {
                    that._add_location(container, location);
                });
            }
            else that._add_location(container, location);
        },

        _add_location: function (container, location) {
            var that = this;

            that.Objects.Locations.push(location);

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Name: "container",
                    Class: "small-12 medium-12 large-12 row rv-border-radius-half SoftShadow",
                    Style: "margin:0rem; margin-bottom:1rem; background-color:white; padding:0.5rem; display:none;",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "padding-right:2rem; position:relative;",
                            Childs: [
                                {
                                    Type: "div",
                                    Style: "position:absolute; top:0rem; right:0rem; width:1.5rem; text-align:center;",
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-times fa-lg rv-icon-button", Name: "remove",
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        }
                                    ]
                                },
                                {
                                    Type: "div",
                                    Style: "position:absolute; top:2rem; right:0rem; width:1.5rem; text-align:center;",
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-users fa-lg rv-icon-button",
                                            Attributes: [{ Name: "aria-hidden", Value: true }],
                                            Properties: [{ Name: "onclick", Value: function () { that.location_stats(location); }}]
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Name: "name",
                                    Style: "display:inline-block; font-weight:bold; cursor:pointer;",
                                    Properties: [
                                        { Name: "onmouseover", Value: function () { this.style.color = "blue"; } },
                                        { Name: "onmouseout", Value: function () { this.style.color = "black"; } }
                                    ]
                                },
                                {
                                    Type: "div", Name: "otherName",
                                    Style: "display:inline-block; margin-left:0.5rem; font-size:0.8rem; color:rgb(150,150,150);"
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12", Style: "margin-top:0.5rem;",
                            Childs: [
                                {
                                    Type: "div", Class: "rv-border-radius-quarter rv-bg-color-trans-soft SoftBorder",
                                    Style: "display:inline-block; padding:0.3rem; font-size:0.7rem;",
                                    Childs: [
                                        {
                                            Type: "div",
                                            Style: "display:inline-block; color:rgb(100,100,100); font-weight:bold;",
                                            Childs: [{ Type: "text", TextValue: "Latitude:" }]
                                        },
                                        {
                                            Type: "div", Name: "latitude",
                                            Style: "display:inline-block; margin-left:0.3rem;"
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "rv-border-radius-quarter rv-bg-color-trans-soft SoftBorder",
                                    Style: "display:inline-block; margin-left:0.5rem; padding:0.3rem; font-size:0.7rem;",
                                    Childs: [
                                        {
                                            Type: "div",
                                            Style: "display:inline-block; color:rgb(100,100,100); font-weight:bold;",
                                            Childs: [{ Type: "text", TextValue: "Longitude:" }]
                                        },
                                        {
                                            Type: "div", Name: "longitude",
                                            Style: "display:inline-block; margin-left:0.3rem;"
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "rv-border-radius-quarter rv-bg-color-trans-soft SoftBorder",
                                    Style: "margin-left:0.5rem; padding:0.3rem; font-size:0.7rem;",
                                    Childs: [
                                        {
                                            Type: "div",
                                            Style: "display:inline-block; color:rgb(100,100,100); font-weight:bold;",
                                            Childs: [{ Type: "text", TextValue: "Radius:" }]
                                        },
                                        {
                                            Type: "div", Name: "radius",
                                            Style: "display:inline-block; margin-left:0.3rem;"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ], container);

            var set_values = function () {
                var mainName = location.alias || location.name;
                var otherName = !location.alias ? null : location.name;

                elems["name"].innerHTML = mainName;
                elems["otherName"].style.display = location.alias ? "inline-block" : "none";
                elems["otherName"].innerHTML = "(" + otherName + ")";
                elems["latitude"].innerHTML = location.latitude;
                elems["longitude"].innerHTML = location.longitude;
                elems["radius"].parentNode.style.display = location.radius ? "inline-block" : "none";
                elems["radius"].innerHTML = location.radius;
            };

            set_values();

            jQuery(elems["container"]).fadeIn(500);

            var removing = false, saving = false;

            elems["remove"].onclick = function () {
                if (removing) return;

                GlobalUtilities.confirm("Do you want to remove location?", function (r) {
                    if (!r) return;

                    removing = true;

                    RAPI.remove_bookmarked_location({ id: location.id }, function (d) {
                        if (d.result == "ok") {
                            jQuery(elems["container"]).animate({ height: "toggle" }, 500, function () {
                                this.remove();

                                var newArr = [];
                                for (var i = 0; i < that.Objects.Locations.length; ++i) {
                                    if (that.Objects.Locations[i].id != location.id)
                                        newArr.push(that.Objects.Locations[i]);
                                }
                                that.Objects.Locations = newArr;

                                if (!that.Objects.Locations.length) {
                                    jQuery(container).fadeOut(500, function () {
                                        container.set_empty();
                                        jQuery(container).fadeIn(500);
                                    });
                                }
                            });
                        }
                        else alert("An error occurred!");

                        removing = false;
                    });
                });
            };

            elems["name"].onclick = function () {
                new LocationPicker({
                    Location: location,
                    OnSave: function (loc) {
                        if (saving) return;
                        saving = true;

                        RAPI.bookmark_location(loc, function (r) {
                            if (r.result == "ok") {
                                location = loc;
                                set_values();
                            }
                            else alert("An error occurred!");

                            saving = false;
                        });
                    }
                });
            };
        },

        location_stats: function (location) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-10 row align-center rv-border-radius-1",
                    Style: "margin:0rem auto; padding:1rem; background-color:white;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "font-weight:bold; text-align:center; font-size:1.2rem; margin-bottom:1rem;",
                            Childs: [{ Type: "text", TextValue: location.alias || location.name }]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row", Style: "margin:0rem;", Name: "items",
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
                    ]
                }
            ]);

            GlobalUtilities.show(elems["container"]);
            
            RAPI.media_senders_of_location({ location_id: location.id }, function (r) {
                var users = r.users || [];

                elems["items"].innerHTML = "";

                if (!users.length) {
                    elems["items"].innerHTML = "<div class='small-12 medium-12 large-12' " +
                        "style='text-align:center; font-weight:bold; color:rgb(150,150,150);'>" +
                        "no users found" + "</div>";
                }
                else {
                    for (var i = 0; i < users.length; ++i)
                        new UserMini(elems["items"], users[i], { Micro: true, FollowButton: true, FollowingStatus: "none" });
                }
            });
        },

        load_pages: function (container, callback) {
            var that = this;

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                    Childs: [
                        {
                            Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        }
                    ]
                }
            ], container);

            RAPI.get_bookmarked_users({}, function (r) {
                var pages = r.users || [];

                jQuery(container).fadeOut(500, function () {
                    container.innerHTML = "";

                    if (!pages.length) container.set_empty();
                    else {
                        for (var i = 0; i < pages.length; ++i)
                            that.add_page(container, pages[i]);
                    }

                    jQuery(container).fadeIn(500, function () { callback(); });
                });
            });
        },

        search_pages: function (onBookmark) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Style: "margin:0rem auto; padding:1rem;", Name: "container",
                    Class: "small-10 medium-10 large-8 row align-center rv-border-radius-1 SoftBackgroundColor",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-8 large-6",
                            Childs: [
                                {
                                    Type: "input", Class: "rv-input",
                                    Style: "width:100%;", Name: "searchInput",
                                    Attributes: [{ Name: "placeholder", Value: "Search pages..." }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "margin-top:1rem; text-align:center; display:none;", Name: "loading",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "margin-top:1rem; display:none;", Name: "items"
                        }
                    ]
                }
            ]);

            var searchInput = elems["searchInput"];
            var loading = elems["loading"];
            var itemsContainer = elems["items"];

            GlobalUtilities.show(elems["container"]);
            jQuery(searchInput).focus();

            var _add_user = function (user, followingStatus) {
                new UserMini(itemsContainer, user, {
                    TopClass: "small-12 medium-6 large-6",
                    Micro: true,
                    FollowButton: true,
                    FollowingStatus: followingStatus,
                    BookmarkButton: true,
                    OnBookmark: function (callback) {
                        var bookmark = !user.bookmarked;

                        var _call_api = function () {
                            RAPI[bookmark ? "bookmark_user" : "remove_bookmarked_user"]({
                                target_user_id: user.id
                            }, function (r) {
                                if (r.result == "ok") {
                                    if (callback) callback(bookmark);
                                    onBookmark(user, { Add: bookmark, Remove: !bookmark });
                                }
                                else alert("An error occurred!");
                            });
                        };

                        if (bookmark) _call_api();
                        else GlobalUtilities.confirm("Do you want to remove the bookmarked page?", function (r) {
                            if (r) _call_api();
                        });
                    }
                });
            };

            var _do = function (callback) {
                RAPI.search_users({ query: searchInput.value, check_bookmarks: true, count: 10 }, function (r) {
                    var users = r.users || [];
                    var userIds = [];

                    for (var i = 0, lnt = users.length; i < lnt; ++i)
                        userIds.push(users[i].id);

                    if (!userIds.length) {
                        itemsContainer.innerHTML = "<div style='text-align:center; color:rgb(150,150,150);'>" +
                            "no pages found :(" + "</div>";
                        return callback();
                    }

                    RAPI.relationship({ user_ids: userIds.join(",") }, function (d) {
                        var dt = d || [];

                        var dic = {};

                        for (var i = 0; i < (d.items || []).length; ++i)
                            dic[d.items[i].user_id] = d.items[i];

                        for (var i = 0, lnt = users.length; i < lnt; ++i) {
                            var followingStatus = (dic[users[i].id] || {}).outgoing_status || "none";
                            _add_user(users[i], followingStatus);
                        }

                        callback();
                    });
                });
            };

            GlobalUtilities.set_onchangeorenter(searchInput, function () {
                if (!GlobalUtilities.trim(searchInput.value)) {
                    jQuery(loading).fadeOut(500);
                    return jQuery(itemsContainer).fadeOut(500);
                }

                jQuery(itemsContainer).fadeOut(500, function () {
                    itemsContainer.innerHTML = "";
                    jQuery(loading).fadeIn(500, function () {
                        _do(function () {
                            jQuery(loading).fadeOut(500, function () { jQuery(itemsContainer).fadeIn(500); });
                        });
                    });
                });
            });
        },

        remove_page: function (container, user) {
            var that = this;

            var newArr = [];

            for (var i = 0; i < that.Objects.Pages.length; ++i) {
                if (that.Objects.Pages[i].id == user.id) that.Objects.Pages[i].dispose();
                else newArr.push(that.Objects.Pages[i]);
            }

            that.Objects.Pages = newArr;

            if (!that.Objects.Pages.length) {
                jQuery(container).fadeOut(500, function () {
                    container.set_empty();
                    jQuery(container).fadeIn(500);
                });
            }
        },

        add_page: function (container, user) {
            var that = this;

            if (!that.Objects.Pages.length && container.firstChild) {
                jQuery(container.firstChild).fadeOut(500, function () {
                    that._add_page(container, user);
                });
            }
            else that._add_page(container, user);
        },

        _add_page: function (container, user) {
            var that = this;

            for (var i = 0; i < that.Objects.Pages.length; ++i)
                if (that.Objects.Pages[i].id == user.id) return;

            that.Objects.Pages.push(user);

            var um = new UserMini(container, user, {
                BookmarkButton: true,
                OnBookmark: function () {
                    if (!user.bookmarked) return;

                    GlobalUtilities.confirm("Do you want to remove the bookmarked page?", function (r) {
                        if (r) RAPI.remove_bookmarked_user({ target_user_id: user.id }, function (r) {
                            if (r.result == "ok") that.remove_page(container, user);
                            else alert("An error occurred!");
                        });
                    });
                },
                StatsButton: true,
                OnStatsClick: function () { that.stats(user); }
            });

            user.dispose = function () { um.dispose(); };
        },

        stats: function(user){
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-10 rv-border-radius-1",
                    Style: "margin:0rem auto; padding:1rem; background-color:white;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "font-weight:bold; text-align:center; font-size:1.2rem; margin-bottom:1rem;",
                            Childs: [{ Type: "text", TextValue: user.full_name }]
                        },
                        { Type: "div", Class: "small-12 medium-12 large-12 row", Style: "margin:0rem;", Name: "items" }
                    ]
                }
            ]);

            GlobalUtilities.show(elems["container"]);

            new RStats(elems["items"], { User: user });
        },

        load_tags: function (container, callback) {
            var that = this;

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12", Style: "text-align:center;",
                    Childs: [
                        {
                            Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        }
                    ]
                }
            ], container);

            RAPI.get_bookmarked_tags({}, function (r) {
                var tags = r.tags || [];

                jQuery(container).fadeOut(500, function () {
                    container.innerHTML = "";

                    if (!tags.length) container.set_empty();
                    else {
                        for (var i = 0; i < tags.length; ++i)
                            that.add_tag(container, tags[i]);
                    }

                    jQuery(container).fadeIn(500, function () { callback(); });
                });
            });
        },

        search_tags: function (onBookmark) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Style: "margin:0rem auto; padding:1rem; background-color:white;", Name: "container",
                    Class: "small-10 medium-10 large-8 row align-center rv-border-radius-1",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-8 large-6",
                            Childs: [
                                {
                                    Type: "input", Class: "rv-input",
                                    Style: "width:100%;", Name: "searchInput",
                                    Attributes: [{ Name: "placeholder", Value: "Search tags..." }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "margin-top:1rem; text-align:center; display:none;", Name: "loading",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-spinner fa-spin fa-pulse fa-3x",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "margin-top:1rem; text-align:center; display:none;", Name: "items"
                        }
                    ]
                }
            ]);

            var searchInput = elems["searchInput"];
            var loading = elems["loading"];
            var itemsContainer = elems["items"];

            GlobalUtilities.show(elems["container"]);
            jQuery(searchInput).focus();

            var _add_tag = function (tag) {
                new TagMini(itemsContainer, tag, {
                    BookmarkButton: true,
                    OnBookmark: function (callback) {
                        var bookmark = !tag.bookmarked;

                        var _call_api = function () {
                            RAPI[bookmark ? "bookmark_tag" : "remove_bookmarked_tag"]({
                                tag: tag.name,
                                tag_id: tag.id
                            }, function (r) {
                                if (r.result == "ok") {
                                    if (r.id) tag.id = r.id;
                                    onBookmark(tag, { Add: bookmark, Remove: !bookmark });
                                    if (callback) callback(bookmark);
                                }
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

            var _do = function (callback) {
                RAPI.search_tags({ query: searchInput.value, check_bookmarks: true }, function (r) {
                    var tags = r.tags || [];

                    if (!tags.length) {
                        itemsContainer.innerHTML = "<div style='text-align:center; color:rgb(150,150,150);'>" +
                            "no tags found :(" + "</div>";
                    }
                    else {
                        for (var i = 0, lnt = tags.length; i < lnt; ++i)
                            _add_tag(tags[i]);
                    }

                    callback();
                });
            };

            GlobalUtilities.set_onchangeorenter(searchInput, function () {
                if (!GlobalUtilities.trim(searchInput.value)) {
                    jQuery(loading).fadeOut(500);
                    return jQuery(itemsContainer).fadeOut(500);
                }

                jQuery(itemsContainer).fadeOut(500, function () {
                    itemsContainer.innerHTML = "";
                    jQuery(loading).fadeIn(500, function () {
                        _do(function () {
                            jQuery(loading).fadeOut(500, function () { jQuery(itemsContainer).fadeIn(500); });
                        });
                    });
                });
            });
        },

        remove_tag: function (container, tag) {
            var that = this;

            var newArr = [];

            for (var i = 0; i < that.Objects.Tags.length; ++i) {
                if (that.Objects.Tags[i].id == tag.id) that.Objects.Tags[i].dispose();
                else newArr.push(that.Objects.Tags[i]);
            }

            that.Objects.Tags = newArr;

            if (!that.Objects.Tags.length) {
                jQuery(container).fadeOut(500, function () {
                    container.set_empty();
                    jQuery(container).fadeIn(500);
                });
            }
        },

        add_tag: function (container, tag) {
            var that = this;

            if (!that.Objects.Tags.length && container.firstChild) {
                jQuery(container.firstChild).fadeOut(500, function () {
                    that._add_tag(container, tag);
                });
            }
            else that._add_tag(container, tag);
        },

        _add_tag: function (container, tag) {
            var that = this;

            for (var i = 0; i < that.Objects.Tags.length; ++i)
                if (that.Objects.Tags[i].id == tag.id) return;

            that.Objects.Tags.push(tag);

            var tm = new TagMini(container, tag, {
                BookmarkButton: true,
                OnBookmark: function () {
                    if (!tag.bookmarked) return;

                    GlobalUtilities.confirm("Do you want to remove the bookmarked tag?", function (r) {
                        if (r) RAPI.remove_bookmarked_tag({ tag_id: tag.id }, function (r) {
                            if (r.result == "ok") that.remove_tag(container, tag);
                            else alert("An error occurred!");
                        });
                    });
                },
                StatsButton: true,
                OnStatsClick: function () { that.tag_stats(tag); }
            });

            tag.dispose = function () { tm.dispose(); };
        },

        tag_stats: function (tag) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-10 row align-center rv-border-radius-1",
                    Style: "margin:0rem auto; padding:1rem; background-color:white;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "font-weight:bold; text-align:center; font-size:1.2rem; margin-bottom:1rem;",
                            Childs: [{ Type: "text", TextValue: tag.name }]
                        },
                        {
                            Type: "div", Class: "small-12 medium-9 large-6 row", Style: "margin:0rem; margin-bottom:1rem;",
                            Childs: [
                                {
                                    Type: "div", Name: "fansBtn",
                                    Class: "small-5 medium-5 large-5 rv-air-button rv-circle",
                                    Childs: [{Type: "text", TextValue: "fans"}]
                                },
                                { Type: "div", Class: "small-2 medium-2 large-2" },
                                {
                                    Type: "div", Name: "sendersBtn",
                                    Class: "small-5 medium-5 large-5 rv-air-button rv-circle", 
                                    Childs: [{ Type: "text", TextValue: "senders" }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row",
                            Style: "margin:0rem; display:none;", Name: "fans",
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
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 row",
                            Style: "margin:0rem; display:none;", Name: "senders",
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
                    ]
                }
            ]);

            GlobalUtilities.show(elems["container"]);

            var pages = {
                "fans": {
                    Button: elems["fansBtn"], Page: elems["fans"],
                    Initialized: false, APIFunction: "fans_of_tag"
                },
                "senders": {
                    Button: elems["sendersBtn"], Page: elems["senders"],
                    Initialized: false, APIFunction: "media_senders_of_tag"
                }
            };

            var processing = false;

            var onclick = function (pg) {
                if (processing) return;
                processing = true;

                var otherPage = pg == pages.fans ? pages.senders : pages.fans;

                otherPage.Button.style.fontWeight = "normal";

                jQuery(otherPage.Page).fadeOut(500, function () {
                    pg.Button.style.fontWeight = "bold";

                    jQuery(pg.Page).fadeIn(500, function () {
                        processing = false;

                        if (!pg.Initialized) {
                            pg.Initialized = true;
                            init(pg);
                        }
                    });
                });
            };

            elems["fansBtn"].onclick = function () { onclick(pages.fans); };
            elems["sendersBtn"].onclick = function () { onclick(pages.senders); };

            onclick(pages.fans);

            var init = function (pg) {
                RAPI[pg.APIFunction]({ tag_id: tag.id }, function (r) {
                    var users = r.users || [];

                    pg.Page.innerHTML = "";

                    if (!users.length) {
                        pg.Page.innerHTML = "<div class='small-12 medium-12 large-12' " +
                            "style='text-align:center; font-weight:bold; color:rgb(150,150,150);'>" +
                            "no users found" + "</div>";
                    }
                    else {
                        for (var i = 0; i < users.length; ++i)
                            new UserMini(pg.Page, users[i], { Micro: true, FollowButton: true, FollowingStatus: "none" });
                    }
                });
            };
        }
    };
})();