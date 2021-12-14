(function () {
    if (window.TagMedia) return;

    window.TagMedia = function (params) {
        params = params || {};
        var tagName = params.TagName;
        if (!tagName) return;

        var elems = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-10 medium-10 large-10 rv-border-radius-1 SoftBackgroundColor",
                    Style: "margin:0rem auto; padding:1rem;", Name: "container",
                    Childs: [
                        {
                            Type: "div", Class: "small-12 medium-12 large-12",
                            Style: "font-weight:bold; text-align:center; font-size:1.2rem; margin-bottom:1rem;",
                            Childs: [{ Type: "text", TextValue: tagName }]
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

        RAPI.tag_media({ tag_name: tagName, count: 20 }, function (r) {
            jQuery(elems["loading"]).fadeOut(0, function () { this.remove(); });

            var max_tag_id = (r.pagination || {}).max_tag_id;
            var min_tag_id = (r.pagination || {}).min_tag_id;

            for (var i = 0, lnt = (r.items || []).length; i < lnt; ++i)
                new MediaMini(elems["items"], r.items[i]);
        });
    }
})();