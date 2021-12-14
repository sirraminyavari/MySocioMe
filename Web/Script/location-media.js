(function () {
    if (window.LocationMedia) return;
    
    window.LocationMedia = function (params) {
        params = params || {};
        var locationId = params.id;
        if (!locationId) return;
        
        var locationName = params.name;
        var latitude = params.latitude;
        var longitude = params.longitude;

        var elems = GlobalUtilities.create_nested_elements([
            {
                Type: "div", Class: "small-10 medium-10 large-10 rv-border-radius-1 SoftBackgroundColor",
                Style: "margin:0rem auto; padding:1rem;", Name: "container",
                Childs: [
                    {
                        Type: "div", Class: "small-12 medium-12 large-12",
                        Style: "font-weight:bold; text-align:center; font-size:1.2rem; margin-bottom:1rem;" +
                            (locationName ? "" : "display:none;"),
                        Childs: [{ Type: "text", TextValue: locationName }]
                    },
                    {
                        Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-half", Name: "nearbyLocations",
                        Style: "margin-bottom:1rem; text-align:center; display:none;" +
                            "background-color:white; padding:0.5rem;"
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

        RAPI.location_media({ location_id: locationId }, function (r) {
            jQuery(elems["loading"]).fadeOut(0, function () { this.remove(); });
            
            for (var i = 0, lnt = (r.items || []).length; i < lnt; ++i)
                new MediaMini(elems["items"], r.items[i]);
        });
        
        RAPI.search_locations({ latitude: latitude, longitude: longitude, distance: 10000 }, function (r) {
            var locations = (r || {}).data || [];

            for (var i = 0, lnt = locations.length; i < lnt; ++i)
                new LocationMini(elems["nearbyLocations"], locations[i]);

            if (locations.length > 0) jQuery(elems["nearbyLocations"]).toggle(500);
        });
    }
})();