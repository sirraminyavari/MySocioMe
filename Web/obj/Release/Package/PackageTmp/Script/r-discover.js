(function () {
    if (window.RDiscover) return;

    window.RDiscover = function (container, params) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;
        params = params || {};

        this.Interface = {
            Media: null
        };

        this.Options = {
            OnSave: params.Onsave
        };

        this.preinit();
    };

    RDiscover.prototype = {
        preinit: function () {
            var that = this;

            RAPI.get_categories({}, function (r) {
                that.initialize(r.categories || []);
            });
        },

        initialize: function (categories) {
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12 row", Style: "margin:0rem;",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-4 large-3", Style: "padding-right:1rem; margin-bottom:1rem;",
                            Childs: [
                                { Type: "div", Class: "small-12 medium-12 large-12", Name: "categories" },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12 rv-circle rv-air-button",
                                    Style: "font-size:0.8rem; font-weight:bold;",
                                    Properties: [
                                        {
                                            Name: "onclick",
                                            Value: function () {
                                                that.edit_category(null, {
                                                    OnSave: function (cat) {
                                                        that.add_category(elems["categories"], cat, { Selected: true });
                                                    }
                                                });
                                            }
                                        }
                                    ],
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-plus fa-lg", Style: "margin:0.2rem 0.5rem 0rem 0rem;",
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        },
                                        {Type: "text", TextValue: "new category"}
                                    ]
                                }
                            ]
                        },
                        { Type: "div", Class: "small-12 medium-8 large-9", Name: "media" }
                    ]
                }
            ], that.Container);

            that.Interface.Media = elems["media"];

            for (var i = 0; i < (categories || []).length; ++i)
                that.add_category(elems["categories"], categories[i], { Selected: i == 0 });

            that.show_media();
        },

        add_category: function (container, category, params) {
            params = params || {};
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Name: "container",
                    Class: "small-12 medium-12 large-12 rv-border-radius-half rv-comic rv-bg-color-trans-soft SoftBorder",
                    Style: "padding:0.5rem; padding-right:4rem; position:relative;" +
                        "margin-bottom:0.5rem; cursor:pointer; display:none;",
                    Childs: [
                        {
                            Type: "div", Name: "name", Tooltip: category.name,
                            Class: "small-12 medium-12 large-12 Ellipsis",
                            Childs: [{ Type: "text", TextValue: category.name }]
                        },
                        {
                            Type: "div",
                            Style: "position:absolute; top:0rem; bottom:0rem; width:3.6rem; right:0.2rem;",
                            Childs: [
                                {
                                    Type: "middle", Class: "small-12 medium-12 large-12 row", Style: "margin:0rem;",
                                    Childs: [
                                        {
                                            Type: "div", Class: "small-6 medium-6 large-6", Style: "text-align:center;",
                                            Childs: [
                                                {
                                                    Type: "div", Class: "rv-circle", Name: "edit", Tooltip: "Edit",
                                                    Style: "display:inline-block; width:1.6rem; height:1.6rem;" +
                                                        "background-color:white;",
                                                    Childs: [
                                                        {
                                                            Type: "i", Class: "fa fa-pencil rv-icon-button",
                                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div", Class: "small-6 medium-6 large-6", Style: "text-align:center;",
                                            Childs: [
                                                {
                                                    Type: "div", Class: "rv-circle", Name: "remove", Tooltip: "Remove",
                                                    Style: "display:inline-block; width:1.6rem; height:1.6rem;" +
                                                        "background-color:white;",
                                                    Childs: [
                                                        {
                                                            Type: "i", Class: "fa fa-times rv-icon-button",
                                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ], container);

            var itemContainer = elems["container"];

            var changingPage = false;

            itemContainer.onclick = function () {
                if (changingPage) return;

                var firstChild = itemContainer.parentNode.firstChild;
                if ((firstChild == itemContainer) && itemContainer.IsSelected) return;

                changingPage = true;

                while (firstChild) {
                    firstChild.classList[firstChild == itemContainer ? "add" : "remove"]("WarmBackgroundColor");
                    firstChild.style.color = firstChild == itemContainer ? "white" : "black";
                    firstChild.IsSelected = firstChild == itemContainer;
                    
                    firstChild = firstChild.nextSibling;

                    that.show_media(category, function () { changingPage = false; });
                }
            };

            elems["edit"].onclick = function (e) {
                e.stopPropagation();

                that.edit_category(category, {
                    OnSave: function (cat) {
                        category = cat;
                        elems["name"].innerHTML = cat.name;
                    }
                });
            };

            var removing = false;

            elems["remove"].onclick = function (e) {
                e.stopPropagation();

                if (removing) return;

                GlobalUtilities.confirm("do you want to remove the category?", function (r) {
                    if (!r) return;

                    removing = true;

                    RAPI.remove_category({ id: category.id }, function (res) {
                        if (res.result != "ok") alert("an error occured");
                        else {
                            jQuery(elems["container"]).fadeOut(500, function () {
                                this.remove();

                                if (!container.firstChild) that.show_media();
                                else if (itemContainer.IsSelected) jQuery(container.firstChild).click();
                            });
                        }

                        removing = false;
                    });
                });
            };

            jQuery(elems["container"]).fadeIn(500, function () {
                if (params.Selected) jQuery(itemContainer).click();
            });
        },

        edit_category: function (category, params) {
            category = category || {};
            params = params || {};
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-8 row rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-8 rv-comic rv-circle WarmBackgroundColor",
                            Style: "margin:0rem auto; text-align:center; margin-bottom:1rem;" +
                                "color:white; padding:0.5rem 2rem; font-weight:bold;",
                            Childs: [{ Type: "text", TextValue: "configure your category to discover public media" }]
                        },
                        { Type: "div", Class: "small-12 medium-12 large-12" },
                        {
                            Type: "div", Class: "small-8 medium-8 large-5", Style: "margin:1rem 0rem;",
                            Childs: [
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12",
                                    Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                    Childs: [{ Type: "text", TextValue: "Category name" }]
                                },
                                { Type: "input", Class: "rv-input", Style: "width:100%;", Name: "categoryName" }
                            ]
                        },
                        { Type: "div", Class: "small-1 medium-1 large-5" },
                        {
                            Type: "div", Class: "small-3 medium-3 large-2", Style: "margin:1rem 0rem;",
                            Childs: [
                                {
                                    Type: "bottom", Name: "save",
                                    Class: "small-12 medium-12 large-12 ActionButton",
                                    Childs: [{ Type: "text", TextValue: "Save" }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-1",
                            Style: "background-color:white; padding:1rem;",
                            Childs: [
                                {
                                    Type: "div", Class: "rv-comic", Style: "display:inline-block;",
                                    Childs: [{ Type: "text", TextValue: "just collect media with more than" }]
                                },
                                {
                                    Type: "div", Style: "display:inline-block;",
                                    Childs: [
                                        {
                                            Type: "number", Class: "rv-input", Name: "likesInput",
                                            Style: "width:4rem; font-size:0.8rem; margin:0rem 0.4rem;" +
                                                "padding-top:0.1rem; padding-bottom:0.1rem;"
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "rv-comic", Style: "display:inline-block;",
                                    Childs: [{ Type: "text", TextValue: "of likes" }]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-1",
                            Style: "background-color:white; padding:1rem; margin-top:1rem;",
                            Childs: [
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                                    Style: "margin-bottom:0.5rem; text-align:center; font-weight:bold;",
                                    Childs: [{ Type: "text", TextValue: "the following tags will be used to discover public media for this category" }]
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                                    Style: "font-size:0.8rem; margin-bottom:0.5rem; padding:0rem 0.3rem;",
                                    Childs: [
                                        {
                                            Type: "div", Style: "display:inline-block; margin-right:0.5rem;",
                                            Childs: [
                                                {
                                                    Type: "input", Name: "similarTags",
                                                    Attributes: [{ Name: "type", Value: "checkbox" }]
                                                }
                                            ]
                                        },
                                        {
                                            Type: "div", Style: "display:inline-block;",
                                            Childs: [{ Type: "text", TextValue: "automatically find and use tags similar to the following tags." }]
                                        }
                                    ]
                                },
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12", Name: "tags",
                                    Childs: [
                                        {
                                            Type: "div", Style: "display:inline-block; padding:0.2rem;",
                                            Childs: [
                                                {
                                                    Type: "input", Class: "rv-input", Name: "tagInput", InnerTitle: "new tag",
                                                    Style: "font-size:0.8rem; padding-top:0.1rem; padding-bottom:0.1rem;"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-1",
                            Style: "background-color:white; padding:1rem; margin-top:1rem;",
                            Childs: [
                                {
                                    Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                                    Style: "margin-bottom:0.5rem; text-align:center; font-weight:bold;",
                                    Childs: [{ Type: "text", TextValue: "the following locations will be searched to discover public media for this category" }]
                                },
                                { Type: "div", Class: "small-12 medium-12 large-12", Name: "locations" },
                                {
                                    Type: "div", Name: "newLocation",
                                    Class: "small-12 medium-12 large-12 rv-circle rv-air-button",
                                    Style: "font-size:0.8rem; font-weight:bold; margin-top:0.5rem;",
                                    Childs: [
                                        {
                                            Type: "i", Class: "fa fa-plus fa-lg", Style: "margin:0.2rem 0.5rem 0rem 0rem;",
                                            Attributes: [{ Name: "aria-hidden", Value: true }]
                                        },
                                        { Type: "text", TextValue: "new location" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]);

            var nameInput = elems["categoryName"];
            var likesMinInput = elems["likesInput"];
            var similarTagsCheckbox = elems["similarTags"];
            var tagsContainer = elems["tags"];
            var locationsContainer = elems["locations"];

            var tags = category.tags || [];
            var locations = category.locations || [];

            var dialog = GlobalUtilities.show(elems["container"], { IgnoreZIndex: true });
            jQuery(elems["tagInput"]).focus();

            var saving = false;

            elems["save"].onclick = function () {
                var that = this;
                
                if (saving) return;

                var name = GlobalUtilities.trim(nameInput.value);
                var likesMin = +GlobalUtilities.trim(likesMinInput.value);
                if (isNaN(likesMin) || !likesMin) likesMin = 0;
                var data = { name: name };
                if (category.id) data.id = category.id;
                if (likesMin && (likesMin > 0)) data.likes_min = likesMin;
                data.similar_tags = !!similarTagsCheckbox.checked;
                if ((tags || []).length) data.tags = tags;
                if ((locations || []).length) data.locations = locations;

                if (!name || (!tags.length && !locations.length)) return;

                saving = true;

                RAPI.save_category({ data: Base64.encode(JSON.stringify(data)) }, function (r) {
                    if ((r.result != "ok") || !r.category) alert("an error occured!");
                    else {
                        for (var key in r.category) category[key] = r.category[key];
                        tags = category.tags || [];
                        locations = category.locations || [];
                        if (params.OnSave) params.OnSave(category);
                        dialog.Close();
                    }

                    saving = false;
                });
            };

            var _add_tag = function (tg) {
                new TagMini(elems["tags"], tg, {
                    InsertBefore: elems["tagInput"].parentNode,
                    RemoveButton: true,
                    OnRemove: function (callback) {
                        var arr = [];
                        for (var i = 0; i < (tags || []).length; ++i)
                            if (tags[i].name != tg.name) arr.push(tags[i]);
                        tags = arr;

                        callback(true);
                    }
                });
            };

            var _add_location = function (loc) {
                that.add_location(elems["locations"], loc, {
                    OnRemove: function () {
                        var newArr = [];
                        for (var i = 0; i < (locations || []).length; ++i) {
                            var areTheSame = (loc.id && (locations[i].id == loc.id)) || (!loc.id &&
                                (locations[i].latitude == loc.latitude) && (locations[i].longitude == loc.longitude));

                            if (!areTheSame) newArr.push(locations[i]);
                        }
                        locations = newArr;
                    }
                });
            };

            new autoComplete({
                selector: elems["tagInput"],
                minChars: 1,
                source: function (term, suggest) {
                    RAPI.search_tags({ query: term.toLowerCase() }, function (r) { suggest(r.tags || []); });
                },
                renderItem: function (item, search) {
                    return '<div class="autocomplete-suggestion" data-value="' +
                        Base64.encode(JSON.stringify(item)) + '">' + item.name +
                        '<span style="margin-left:0.5rem; font-weight:bold; color:red; font-size:0.7rem;">' + item.media_count + '</span></div>';
                },
                onSelect: function (e, term, item) {
                    var tg = JSON.parse(Base64.decode(item.getAttribute("data-value")));

                    if (!that.tag_exists(tg)) {
                        tags.push(tg);
                        _add_tag(tg);
                    }
                }
            });

            elems["newLocation"].onclick = function () {
                new LocationPicker({
                    OnSave: function (loc) {
                        if (that.location_exists(loc, locations)) return;
                        locations.push(loc);
                        _add_location(loc);
                    }
                });
            };

            jQuery(elems["categoryName"]).focus();

            //initialize
            if (category.name) nameInput.value = category.name;
            if (category.likes_min) likesMinInput.value = category.likes_min;
            if (category.similar_tags) similarTagsCheckbox.checked = true;
            if ((tags || []).length)
                for (var i = 0; i < tags.length; ++i) _add_tag(tags[i]);
            if ((locations || []).length)
                for (var i = 0; i < locations.length; ++i) _add_location(locations[i]);
            //end of initialize
        },

        add_location: function (container, location, params) {
            params = params || {};
            var that = this;

            var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Name: "container",
                    Class: "small-12 medium-12 large-12 row rv-border-radius-half SoftBorder SoftShadow",
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

            elems["remove"].onclick = function () {
                GlobalUtilities.confirm("Do you want to remove location?", function (r) {
                    if (!r) return;

                    jQuery(elems["container"]).animate({ height: "toggle" }, 500, function () {
                        this.remove();
                        if (params.OnRemove) params.OnRemove();
                    });
                });
            };

            elems["name"].onclick = function () {
                new LocationPicker({
                    Location: location,
                    OnSave: function (loc) {
                        for (var key in loc)
                            location[key] = loc[key];
                        set_values();
                    }
                });
            };
        },

        tag_exists: function (tag, allTags) {
            var that = this;

            for (var i = 0; i < (allTags || []).length; ++i) {
                if ((tag.id && (tag.id == allTags[i].id)) || (tag.name == allTags[i].name))
                    return true;
            }

            return false;
        },

        location_exists: function (location, allLocations) {
            var that = this;

            for (var i = 0; i < (allLocations || []).length; ++i) {
                if ((location.latitude == allLocations[i].latitude) &&
                    (location.longitude == allLocations[i].longitude)) return true;
            }

            return false;
        },

        show_media: function (category, callback) {
            var that = this;

            category = category || { id: "empty" };

            that.MediaContainers = that.MediaContainers || {};

            var alreadyExists = !!that.MediaContainers[category.id];

            that.MediaContainers[category.id] = that.MediaContainers[category.id] || GlobalUtilities.create_nested_elements([
                { Type: "div", Class: "small-12 medium-12 large-12 row", Name: "_div", Style: "margin:0rem;" }
            ])["_div"];

            jQuery(that.Interface.Media).fadeOut(that.Interface.Media.firstChild ? 500 : 0, function () {
                that.Interface.Media.innerHTML = "";
                that.Interface.Media.appendChild(that.MediaContainers[category.id]);
                jQuery(that.Interface.Media).fadeIn(500, function () {
                    if (callback) callback();
                    if (!alreadyExists) that._show_media(that.MediaContainers[category.id], category);
                });
            });
        },

        _show_media: function (container, category) {
            var that = this;

            if (isNaN(category.id)) return that.no_category(container);

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

            RAPI.category_media({ id: category.id }, function (r) {
                var media = r.items || [];

                container.innerHTML = "";

                if (!media.length) that.no_media(container);
                else {
                    for (var i = 0; i < media.length; ++i)
                        new MediaMini(container, media[i], { Class: "small-12 medium-6 large-4" });
                }
            });
        },

        no_category: function (container) {
            var that = this;

            var msg = "<div>tell us about your interests.</div>" +
                "<div>we will discover public media about them.</div>" +
                "<div style='margin-top:1rem;'>all you need to do is to categorize your interests.</div>" +
                "<div>we will do the rest.</div>" + 
                "<div style='margin-top:1rem;'>click on " +
                "<span style='font-weight:bold;'>new category</span> button and start your journey</div>" +
                "<div style='margin-top:1rem; text-align:center;'>" +
                "<img class='rv-border-radius-half SoftShadow' src='../image/discover.png' style='width:90%;' /></div>";

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                    Style: "text-align:center; font-size:1.5rem;", Name: "_div"
                }
            ], container)["_div"].innerHTML = msg;
        },

        no_media: function (container) {
            var that = this;

            var msg = "<div>we will discover public media based on your interests.</div>" +
                "<div>please be patient until the next few hours.</div>";

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-12 large-12 rv-comic",
                    Style: "text-align:center; font-size:1.5rem;", Name: "_div"
                }
            ], container)["_div"].innerHTML = msg;
        }
    };
})();