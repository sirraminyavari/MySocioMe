(function () {
    if (window.LocationPicker) return;

    window.LocationPicker = function (params) {
        params = params || {};

        this.Objects = {
            Location: params.Location
        };

        this.Options = {
            OnSave: params.OnSave
        };

        var that = this;

        var elems = GlobalUtilities.create_nested_elements([
            {
                Type: "div", Style: "margin:0rem auto; padding:1rem;", Name: "container",
                Class: "small-10 medium-10 large-8 row align-center rv-border-radius-1 SoftBackgroundColor",
                Childs: [
                    {
                        Type: "div", Class: "small-12 medium-12 large-12",
                        Style: "text-align:center; font-weight:bold; margin-bottom:1rem;",
                        Childs: [{ Type: "text", TextValue: "select location" }]
                    },
                    {
                        Type: "div", Class: "small-12 medium-12 large-7", Style: "padding:0.5rem;",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12",
                                Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                Childs: [{ Type: "text", TextValue: "Name" }]
                            },
                            { Type: "input", Class: "rv-input", Style: "width:100%;", Name: "name" }
                        ]
                    },
                    {
                        Type: "div", Class: "small-12 medium-12 large-5", Style: "padding:0.5rem;",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12",
                                Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                Childs: [{ Type: "text", TextValue: "Alias" }]
                            },
                            { Type: "input", Class: "rv-input", Style: "width:100%;", Name: "alias" }
                        ]
                    },
                    { Type: "div", Class: "small-12 medium-12 large-12" },
                    {
                        Type: "div", Class: "small-12 medium-5 large-5", Style: "padding:0.5rem;",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12",
                                Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                Childs: [{ Type: "text", TextValue: "Latitude" }]
                            },
                            { Type: "number", Class: "rv-input", Style: "width:100%;", Name: "latitude" }
                        ]
                    },
                    {
                        Type: "div", Class: "small-12 medium-5 large-5", Style: "padding:0.5rem;",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12",
                                Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                Childs: [{ Type: "text", TextValue: "Longitude" }]
                            },
                            { Type: "number", Class: "rv-input", Style: "width:100%;", Name: "longitude" }
                        ]
                    },
                    {
                        Type: "div", Class: "small-12 medium-2 large-2", Style: "padding:0.5rem;",
                        Childs: [
                            {
                                Type: "div", Class: "small-12 medium-12 large-12",
                                Style: "padding-left:0.2rem; font-size:0.7rem; color:rgb(100,100,100);",
                                Childs: [{ Type: "text", TextValue: "Radius" }]
                            },
                            { Type: "number", Class: "rv-input", Style: "width:100%;", Name: "radius" }
                        ]
                    },
                    {
                        Type: "div", Class: "small-12 medium-12 large-12 rv-border-radius-1 SoftBorder SoftShadow",
                        Style: "width:100%; height:40rem; margin-top:1rem;", Name: "map"
                    }
                ]
            }
        ]);

        var nameInput = elems["name"];
        var aliasInput = elems["alias"];
        var latitudeInput = elems["latitude"];
        var longitudeInput = elems["longitude"];
        var radiusInput = elems["radius"];
        
        if ((that.Objects.Location || {}).name) nameInput.value = that.Objects.Location.name;
        if ((that.Objects.Location || {}).alias) aliasInput.value = that.Objects.Location.alias;
        if ((that.Objects.Location || {}).latitude) latitudeInput.value = that.Objects.Location.latitude;
        if ((that.Objects.Location || {}).longitude) longitudeInput.value = that.Objects.Location.longitude;
        if ((that.Objects.Location || {}).radius) radiusInput.value = that.Objects.Location.radius;
        
        GlobalUtilities.show(elems["container"], {
            IgnoreZIndex: true,
            OnClose: function () {
                if (!that.Options.OnSave) return;

                var newLoc = {
                    id: (that.Objects.Location || {}).id,
                    name: nameInput.value,
                    alias: aliasInput.value,
                    latitude: Number(latitudeInput.value || "0"),
                    longitude: Number(longitudeInput.value || "0"),
                    radius: Number(radiusInput.value || "0")
                };

                var changed = false;

                for (var x in newLoc) {
                    if (newLoc[x] != (that.Objects.Location || {})[x]) {
                        changed = true;
                        break;
                    }
                }

                if (changed) {
                    var msg = (that.Objects.Location || {}).id ?
                        "Do you want to save the changes?" : "Do you want to save this location?";

                    GlobalUtilities.confirm(msg, function (r) { if (r) that.Options.OnSave(newLoc); });
                }
            }
        });
        
        jQuery(elems["name"]).focus(function () { this.select(); });

        var options = {
            zoom: 15,
            inputBinding: {
                latitudeInput: jQuery(elems["latitude"]),
                longitudeInput: jQuery(elems["longitude"]),
                radiusInput: jQuery(elems["radius"]),
                locationNameInput: jQuery(elems["name"])
            },
            enableAutocomplete: true,
            enableAutocompleteBlur: true,
            enableReverseGeocode: true,
            draggable: true,
            markerDraggable: true,
            markerVisible: true,
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                // Uncomment line below to show alert on each Location Changed event
                //alert("Location changed. New location (" + currentLocation.latitude + ", " + currentLocation.longitude + ")");
            }
        };

        if ((that.Objects.Location || {}).latitude && (that.Objects.Location || {}).longitude)
            options.location = { latitude: that.Objects.Location.latitude, longitude: that.Objects.Location.longitude };

        if ((that.Objects.Location || {}).radius) options.radius = that.Objects.Location.radius;

        jQuery(elems["map"]).locationpicker(options);
    };
})();