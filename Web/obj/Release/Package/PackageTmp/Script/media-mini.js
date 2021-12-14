(function () {
    if (window.MediaMini) return;

    window.MediaMini = function (container, media, options) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;
        options = options || {};

        this.Objects = {
            Media: media
        };
        
        this.initialize(options);
    }

    MediaMini.prototype = {
        initialize: function (options) {
            var that = this;

            var mediaId = that.Objects.Media.media_id;
            var mediaImageUrl = that.Objects.Media.image_url;
            var creationTimeStamp = that.Objects.Media.creation_time;
            var caption = that.Objects.Media.caption;
            var likesCount = that.Objects.Media.likes_count;
            var commentsCount = that.Objects.Media.comments_count;
            var type = that.Objects.Media.type;
            var tags = that.Objects.Media.tags || [];
            var location = that.Objects.Media.location || {};
            var locationName = location.name;
            
            var creationDate = new Date(creationTimeStamp * 1000);

            var displayDate = creationDate.getDate() + " " + creationDate.getMonthName() + " " +
                creationDate.getFullYear() + " " + creationDate.getHours() + ":"+  creationDate.getMinutes();

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: options.Class || "small-6 medium-4 large-3", Style: "padding:0.3rem;",
                    Childs: [
                        {
                            Type: "middle", Class: "rv-border-radius-half SoftBorder SoftShadow",
                            Style: "background-color:white; padding:0.5rem; border-color:rgb(200,200,200);",
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
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12",
                                    Style: "position:relative; display:none;", Name: "imageContainer",
                                    Childs: [
                                        {
                                            Type: "img", Class: "rv-border-radius-half", Style: "max-width:100%; cursor:pointer;",
                                            Attributes: [{ Name: "src", Value: mediaImageUrl }],
                                            Properties: [
                                                { Name: "onclick", Value: function () { that.show_full_size_image(); } },
                                                {
                                                    Name: "onload",
                                                    Value: function () {
                                                        jQuery(elems["loading"]).fadeOut(0, function () {
                                                            jQuery(elems["imageContainer"]).toggle(500);
                                                        });
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div",
                                            Style: "position:absolute; bottom:0.5rem; left:0.5rem;" +
                                                "background-color:rgba(255,255,255,0.8); font-size:0.5rem; padding:0.1rem 0.2rem;" + 
                                                GlobalUtilities.border_radius("0.2rem"),
                                            Childs: [{ Type: "text", TextValue: displayDate }]
                                        },
                                        {
                                            Type: "div", Class: "rv-border-radius-half", Name: "tagsContainer",
                                            Style: "position:absolute; display:none; top:0rem; bottom:0rem;" +
                                                "left:0rem; right:0rem; padding:1rem;" +
                                                "text-align:center; background-color:rgba(0,0,0,0.5);",
                                            Childs: [
                                                {
                                                    Type: "middle", Name: "tags",
                                                    Style: "background-color:rgba(255,255,255,0.8);" +
                                                        GlobalUtilities.border_radius("0.2rem")
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div", Class: " rv-circle",
                                            Style: "position:absolute; bottom:0.5rem; right:0.5rem; width:1.5rem; height:1.5rem;" +
                                                "background-color:white; text-align:center;" + (tags.length ? "" : "display:none;"),
                                            Properties: [{ Name: "onclick", Value: function () { jQuery(elems["tagsContainer"]).toggle(500); }}],
                                            Childs: [
                                                {
                                                    Type: "i", Class: "fa fa-tags rv-icon-button", Style: "margin-top:0.4rem;",
                                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12", Style: "margin-top:0.5rem; font-size:0.8rem;",
                                    Childs: [
                                        {
                                            Type: "div", Style: "display:inline-block; padding:0rem 0.5rem;",
                                            Childs: [
                                                {
                                                    Type: "i", Class: "fa fa-heart",
                                                    Style: "margin-right:0.3rem; color:rgb(255,7,7); font-size:1rem;",
                                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                                },
                                                {
                                                    Type: "div", Style: "display:inline-block;" + (likesCount ? "cursor:pointer;" : ""),
                                                    Properties: !likesCount ? null : [{ Name: "onclick", Value: function () { that.likes(mediaId); } }],
                                                    Childs: [{ Type: "text", TextValue: likesCount || "0" }]
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div", Style: "display:inline-block; padding:0rem 0.5rem;",
                                            Childs: [
                                                {
                                                    Type: "i", Class: "fa fa-comments-o",
                                                    Style: "margin-right:0.3rem; color:rgb(54,198,46); font-size:1rem;",
                                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                                },
                                                {
                                                    Type: "div", Style: "display:inline-block;" + (commentsCount ? "cursor:pointer;" : ""),
                                                    Properties: !commentsCount ? null : [{ Name: "onclick", Value: function () { that.comments(mediaId); } }],
                                                    Childs: [{ Type: "text", TextValue: commentsCount || "0" }]
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div",
                                            Style: "display:" + (locationName ? "inline-block" : "none") +
                                                "; padding:0rem 0.5rem;",
                                            Childs: [
                                                {
                                                    Type: "i", Class: "fa fa-location-arrow",
                                                    Style: "margin-right:0.3rem; color:rgb(54,46,198); font-size:1rem;",
                                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                                },
                                                {
                                                    Type: "div", Style: "display:inline-block; cursor:pointer;",
                                                    Properties: [{ Name: "onclick", Value: function () { new LocationMedia(location); }}],
                                                    Childs: [{ Type: "text", TextValue: locationName }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ], that.Container);
            
            for (var i = 0, lnt = tags.length; i < lnt; ++i)
                that.add_tag(elems["tags"], tags[i]);
        },

        add_tag: function (container, tag) {
            var that = this;

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "rv-air-button",
                    Style: "padding:0.1rem 0.2rem; margin:0.1rem;font-size:0.6rem; display:inline-block;" +
                        GlobalUtilities.border_radius("0.2rem"),
                    Properties: [{ Name: "onclick", Value: function () { new TagMedia({ TagName: tag }); } }],
                    Childs: [{ Type: "text", TextValue: tag }]
                }
            ], container);
        },

        show_full_size_image: function () {
            var that = this;

            var mediaImageUrl = that.Objects.Media.image_url;
            var fullSizeImage = mediaImageUrl;// mediaImageUrl.replace(/\/s\d{3}x\d{3}/ig, "");

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
                            Attributes: [{ Name: "src", Value: fullSizeImage }],
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

        tag_media: function (tagName) {
            var that = this;

            RAPI.tag_media({ tag_name: tagName, count: 20 }, function (r) {
                document.getElementById("abcd").innerHTML = JSON.stringify(r);
            });
        },

        likes: function (mediaId) {
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

            RAPI.likes({ media_id: mediaId }, function (r) {
                elems["_div"].innerHTML = "";
                
                for (var i = 0, lnt = (r.users || []).length; i < lnt; ++i)
                    new UserMini(elems["_div"], r.users[i], { Micro: true });
            });
        },

        comments: function (mediaId) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-8 rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "_div",
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
                        },
                        { Type: "div", Class: "small-12 medium-12 large-12", Style: "display:none;", Name: "content" }
                    ]
                }
            ]);

            GlobalUtilities.show(elems["_div"]);

            RAPI.comments({ media_id: mediaId }, function (r) {
                jQuery(elems["loading"]).fadeOut(500, function () {
                    this.remove();

                    for (var i = 0, lnt = (r.comments || []).length; i < lnt; ++i)
                        new UserMini(elems["content"], r.comments[i].sender, { CommentMode: true, Comment: r.comments[i] });

                    jQuery(elems["content"]).toggle(500);
                });
            });
        }
    }
})();