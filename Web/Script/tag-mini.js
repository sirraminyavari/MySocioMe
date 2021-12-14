(function () {
    if (window.TagMini) return;

    window.TagMini = function (container, params, options) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;
        options = options || {};

        this.Objects = {
            Tag: params,
            TagContainer: null
        };

        this.Options = {
            Add2Top: options.Add2Top,
            InsertBefore: options.InsertBefore,
            OnRemove: options.OnRemove,
            RemoveButton: !!(options.OnRemove && options.RemoveButton),
            OnBookmark: options.OnBookmark,
            BookmarkButton: !!(options.OnBookmark && options.BookmarkButton),
            OnStatsClick: options.OnStatsClick,
            StatsButton: !!(options.OnStatsClick && options.StatsButton)
        };
        
        this.initialize();
    }

    TagMini.prototype = {
        initialize: function () {
            var that = this;

            var tagName = that.Objects.Tag.name;
            var mediaCount = that.Objects.Tag.media_count;

            var bookmarked = that.Objects.Tag.bookmarked;
            
            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "rv-air-button", Name: "container",
                    Style: "padding:0.2rem 0.4rem; margin:0.2rem; display:inline-block; font-size:0.8rem;" +
                        GlobalUtilities.border_radius("0.2rem"),
                    Properties: [{ Name: "onclick", Value: function () { new TagMedia({ TagName: tagName }); } }],
                    Childs: [
                        {
                            Type: "div", Style: "display:inline-block;",
                            Childs: [{ Type: "text", TextValue: tagName }]
                        },
                        {
                            Type: "div", Style: "display:inline-block; margin-left:0.5rem; font-weight:bold;",
                            Childs: [{ Type: "text", TextValue: mediaCount }]
                        },
                        {
                            Type: "div",
                            Style: "display:" + (that.Options.RemoveButton ? "inline-block" : "none") + ";" +
                                "margin-left:0.5rem; font-weight:bold;",
                            Childs: [
                                {
                                    Type: "i", Name: "removeButton", Class: "fa fa-times fa-lg rv-icon-button",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                }
                            ]
                        },
                        {
                            Type: "div",
                            Style: "display:" + (that.Options.BookmarkButton ? "inline-block" : "none") + ";" +
                                "margin-left:0.5rem; font-weight:bold;",
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
                            Style: "display:" + (that.Options.StatsButton ? "inline-block" : "none") + ";" +
                                "margin-left:0.5rem; font-weight:bold;",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-users fa-lg rv-icon-button", Name: "statsButton",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                }
                            ]
                        }
                    ]
                }
            ]);

            if (that.Options.Add2Top) that.Container.insertBefore(elems["container"], that.Container.firstChild);
            else if (that.Options.InsertBefore)
                that.Options.InsertBefore.parentNode.insertBefore(elems["container"], that.Options.InsertBefore);
            else that.Container.appendChild(elems["container"]);

            that.Objects.TagContainer = elems["container"];

            if (elems["removeButton"]) {
                elems["removeButton"].onclick = function (e) {
                    e.stopPropagation();

                    GlobalUtilities.confirm("do you want to remove the tag?", function (r) {
                        if (r && that.Options.OnRemove) that.Options.OnRemove(function (removed) { that.dispose(); });
                    });
                };
            }

            if (elems["bookmarkButton"]) {
                elems["bookmarkButton"].onclick = function (e) {
                    e.stopPropagation();

                    if (that.Options.OnBookmark) that.Options.OnBookmark(function (_bookmarked) {
                        that.Objects.Tag.bookmarked = bookmarked = _bookmarked;

                        var cls = "fa fa-bookmark fa-lg rv-icon-button" + (_bookmarked ? " rv-green" : "");
                        elems["bookmarkButton"].setAttribute("class", cls);
                    });
                };
            }

            if (elems["statsButton"] && that.Options.OnStatsClick) {
                elems["statsButton"].onclick = function (e) {
                    e.stopPropagation();
                    that.Options.OnStatsClick();
                };
            }
        },

        dispose: function () {
            var that = this;
            if (!that.Objects.TagContainer) return;
            jQuery(that.Objects.TagContainer).fadeOut(500, function () { this.remove() });
        }
    }
})();