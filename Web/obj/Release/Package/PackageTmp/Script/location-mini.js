(function () {
    if (window.LocationMini) return;

    window.LocationMini = function (container, params) {
        this.Container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!this.Container) return;

        this.Objects = {
            Location: params
        };
        
        this.initialize();
    }

    LocationMini.prototype = {
        initialize: function () {
            var that = this;

            var id = that.Objects.Location.id;
            var name = that.Objects.Location.name;
            
            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "rv-air-button",
                    Style: "padding:0.2rem 0.4rem; margin:0.2rem; display:inline-block; font-size:0.8rem;" +
                        GlobalUtilities.border_radius("0.2rem"),
                    Properties: [{ Name: "onclick", Value: function () { new LocationMedia({ id: id, name: name }); } }],
                    Childs: [
                        {
                            Type: "i", Class: "fa fa-location-arrow",
                            Style: "margin-right:0.3rem; color:rgb(54,46,198); font-size:1rem;",
                            Attributes: [{ Name: "aria-hidden", Value: true }]
                        },
                        {
                            Type: "div", Style: "display:inline-block;",
                            Childs: [{ Type: "text", TextValue: name }]
                        }
                    ]
                }
            ], that.Container);
        }
    }
})();