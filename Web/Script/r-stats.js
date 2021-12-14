(function () {
    if (window.RStats) return;

    window.RStats = function (container, params) {
        params = params || {};
        container = typeof (container) == "object" ? container : document.getElementById(container);
        if (!container) return;

        this.Objects = {
            User: params.User
        };

        var that = this;

        var statNames = [
            {
                Name: "the average of the number of uploaded media in each day of month",
                API: "hourly_insight",
                Type: "hourly",
                ItemType: "media",
                Color: "rgba(132, 255, 99, 0.5)",
                BorderColor: "rgba(132, 255, 99, 0.8)"
            },
            {
                Name: "the average of the number of likes received in each day of month",
                API: "hourly_insight",
                Type: "hourly",
                ItemType: "likes",
                Color: "rgba(255, 99, 132, 0.5)",
                BorderColor: "rgba(255, 99, 132, 0.8)"
            },
            {
                Name: "the average of the number of comments received in each day of month",
                API: "hourly_insight",
                Type: "hourly",
                ItemType: "comments",
                Color: "rgba(132, 99, 255, 0.5)",
                BorderColor: "rgba(132, 99, 255, 0.8)"
            },
            {
                Name: "the average of the number of uploaded media in each day of week",
                API: "daily_insight",
                Type: "daily",
                ItemType: "media",
                Color: "rgba(132, 255, 99, 0.5)",
                BorderColor: "rgba(132, 255, 99, 0.8)"
            },
            {
                Name: "the average of the number of likes received in each day of week",
                API: "daily_insight",
                Type: "daily",
                ItemType: "likes",
                Color: "rgba(255, 99, 132, 0.5)",
                BorderColor: "rgba(255, 99, 132, 0.8)"
            },
            {
                Name: "the average of the number of comments received in each day of week",
                API: "daily_insight",
                Type: "daily",
                ItemType: "comments",
                Color: "rgba(132, 99, 255, 0.5)",
                BorderColor: "rgba(132, 99, 255, 0.8)"
            },
            {
                Name: "the monthly trend of the number of uploaded media",
                API: "monthly_trend",
                Type: "monthly",
                ItemType: "media",
                Color: "rgba(132, 255, 99, 0.5)",
                BorderColor: "rgba(132, 255, 99, 0.8)"
            },
            {
                Name: "the monthly trend of the average of number of likes received",
                API: "monthly_trend",
                Type: "monthly",
                ItemType: "likes",
                Color: "rgba(255, 99, 132, 0.5)",
                BorderColor: "rgba(255, 99, 132, 0.8)"
            },
            {
                Name: "the monthly trend of the average of number of comments received",
                API: "monthly_trend",
                Type: "monthly",
                ItemType: "comments",
                Color: "rgba(132, 99, 255, 0.5)",
                BorderColor: "rgba(132, 99, 255, 0.8)"
            },
            {
                Name: "the trend of the number of likes received for recent media",
                API: "user_media",
                Type: "single",
                ItemType: "likes",
                Color: "rgba(255, 99, 132, 0.5)",
                BorderColor: "rgba(255, 99, 132, 0.8)"
            },
            {
                Name: "the trend of the number of comments received for recent media",
                API: "user_media",
                Type: "single",
                ItemType: "comments",
                Color: "rgba(132, 99, 255, 0.5)",
                BorderColor: "rgba(132, 99, 255, 0.8)"
            },
            {
                Name: "tags that have been used",
                API: "tags_insight",
                Type: "tags",
                ItemType: "tags",
                Color: "rgba(132, 255, 99, 0.5)",
                BorderColor: "rgba(132, 255, 99, 0.8)"
            }
        ];

        var _plot = function (params) {
            params = params || {};

            var chrt = new Chart(params.Canvas.getContext('2d'), {
                type: params.Type,
                data: {
                    labels: params.Labels,
                    datasets: params.Datasets || [{
                        label: params.Label,
                        backgroundColor: params.Color,
                        borderColor: params.BorderColor,
                        borderWidth: 2,
                        data: params.Data
                    }]
                },
                options: {
                    legend: { display: false },
                    animation: { duration: 1000, easing: "easeOutQuart" },
                    scales: !params.scales ? undefined : params.scales,
                    onClick: !params.OnClick ? null : function (evt, array) {
                        if (!(array || []).length) return;
                        params.OnClick({ DatasetIndex: array[0]._datasetIndex, Index: array[0]._index });
                    },
                    pan: { enabled: true, mode: 'xy', speed: 10, threshold: 10 },
                    zoom: { enabled: true, /* drag: true, */ mode: 'xy' }
                }
            });
        };

        var apiData = {};

        var _add_button = function (btn) {
            var iconOps = { IconName: "", IconColor: "", IconNameHover: "", IconColorHover: "", ChartType: "", Period: "" };
            
            var isWeek = btn.Name.toLowerCase().indexOf("week") >= 0;

            var chartType = btn.Name.toLowerCase().indexOf("trend") >= 0 ? "fa-line-chart" : "fa-bar-chart";
            var period = btn.Name.toLowerCase().indexOf("month") >= 0 ? "fa-calendar" :
                (isWeek ? "fa-calendar" : "fa-file-image-o");

            if (btn.Name.toLowerCase().indexOf("comments") >= 0) {
                iconOps = {
                    IconName: "fa-comments-o", IconColor: "rgb(75,180,235)",
                    IconNameHover: "fa-comments", IconColorHover: "rgb(75,180,235)",
                    ChartType: chartType, Period: period
                };
            }
            else if (btn.Name.toLowerCase().indexOf("likes") >= 0) {
                iconOps = {
                    IconName: "fa-heart-o", IconColor: "rgb(255,7,7)", 
                    IconNameHover: "fa-heart", IconColorHover: "rgb(255,7,7)",
                    ChartType: chartType, Period: period
                };
            }
            else if (btn.Name.toLowerCase().indexOf("media") >= 0) {
                iconOps = {
                    IconName: "fa-file-image-o", IconColor: "rgb(174,220,118)",
                    IconNameHover: "fa-file-image-o", IconColorHover: "rgb(124,187,47)",
                    ChartType: chartType, Period: period
                };
            }
            else if (btn.Name.toLowerCase().indexOf("tag") >= 0) {
                iconOps = {
                    IconName: "fa-tags", IconColor: "rgb(169,111,192)",
                    IconNameHover: "fa-tags", IconColorHover: "rgb(168,0,168)"
                };
            }
            
            var _set_icon = function (hover) {
                elements["icon"].setAttribute("class", "fa " + (hover ? iconOps.IconNameHover : iconOps.IconName) + " fa-3x");
                elements["icon"].style.color = hover ? iconOps.IconColorHover : iconOps.IconColor;
                if (elements["period"]) elements["period"].setAttribute("class", "fa " + iconOps.Period);
                if (elements["chart"]) elements["chart"].setAttribute("class", "fa " + iconOps.ChartType);
                if (elements["number"]) elements["number"].style.color = hover ? "rgb(100,100,100)" : "white";
            };
            
            var elements = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-6 large-3", Style: "padding:0.5rem;",
                    Childs: [
                        {
                            Type: "div", Name: "btn",
                            Class: "small-12 medium-12 large-12 rv-air-button rv-border-radius-half",
                            Style: "position:relative; height:100%; padding:1rem; text-align:center;",
                            Properties: [
                                { Name: "onmouseover", Value: function () { _set_icon(true); } },
                                { Name: "onmouseout", Value: function () { _set_icon(false); } }
                            ],
                            Childs: [
                                {
                                    Type: "div",
                                    Style: "position:absolute; top:0.5rem; right:0.5rem; width:1.2rem; text-align:center;",
                                    Childs: [
                                        { Type: "div", Childs: !iconOps.Period ? null : [{ Type: "i", Name: "period", Attributes: [{ Name: "aria-hidden", Value: true }] }] },
                                        { Type: "div", Childs: !iconOps.ChartType ? null : [{ Type: "i", Name: "chart", Attributes: [{ Name: "aria-hidden", Value: true }] }] }
                                    ]
                                },
                                {
                                    Type: "div",
                                    Style: "position:absolute; top:0.5rem; right:0.5rem; width:1.2rem; text-align:center;",
                                    Childs: !isWeek ? null : [
                                        {
                                            Type: "div", Name: "number",
                                            Style: "display:inline-block; font-size:0.6rem; font-weight:bolder; color:white;",
                                            Childs: [{ Type: "text", TextValue: "7" }]
                                        }
                                    ]
                                },
                                {
                                    Type: "middle",
                                    Childs: [
                                        {
                                            Type: "div", Class: "small-12 medium-12 large-12",
                                            Style: "text-align:center; margin-bottom:1rem;",
                                            Childs: [{ Type: "i", Name: "icon", Attributes: [{ Name: "aria-hidden", Value: true }] }]
                                        },
                                        {
                                            Type: "div", Class: "small-12 medium-12 large-12 rv-comic", Style: "font-size:0.9rem;",
                                            Childs: [{ Type: "text", TextValue: btn.Name }]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ], container);

            var button = elements["btn"];
            
            _set_icon(false);

            var data = apiData[btn.API] = apiData[btn.API] || {
                initialized: false,
                processing: false,
                datasets: null,
                counts: { media: [], likes: [], comments: [] },
                labels: [],
                scales: null,
                container: { media: null, likes: null, comments: null },
                callbacks: [],
                onclick: null
            };

            button.onclick = function () {
                if (data.container[btn.ItemType]) return GlobalUtilities.show(data.container[btn.ItemType]);

                var elems = GlobalUtilities.create_nested_elements([
                    {
                        Type: "div", Class: "small-10 medium-10 large-9 rv-border-radius-1 SoftBackgroundColor",
                        Style: "margin:0rem auto; padding:1rem;", Name: "container",
                        Childs: [
                            {
                                Type: "div", Class: "small-10 medium-10 large-8 rv-comic rv-circle WarmBackgroundColor",
                                Style: "margin:0rem auto; text-align:center; margin-bottom:1rem;" +
                                    "color:white; padding:0.5rem 2rem; font-weight:bold;",
                                Childs: [{ Type: "text", TextValue: btn.Name }]
                            },
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
                                Type: "div", Name: "chart",
                                Class: "small-12 medium-12 large-12 rv-border-radius-1",
                                Style: "position:relative; padding:1rem; background-color:white; display:none;",
                                Childs: [{ Type: "canvas", Name: "canvas" }]
                            }
                        ]
                    }
                ]);

                data.container[btn.ItemType] = elems["container"];

                GlobalUtilities.show(elems["container"]);

                var canvas = elems["canvas"];

                var _do = function () {
                    jQuery(elems["loading"]).fadeOut(500, function () {
                        jQuery(elems["chart"]).fadeIn(500);

                        _plot({
                            Canvas: canvas,
                            Type: btn.Type == "tags" ? "bubble" :
                                ((btn.Type == "monthly") || (btn.Type == "single") ? "line" : 'bar'),
                            Labels: data.labels,
                            Label: btn.ItemType,
                            scales: data.scales,
                            Color: btn.Color,
                            BorderColor: btn.BorderColor,
                            Data: data.datasets ? null : data.counts[btn.ItemType],
                            Datasets: data.datasets,
                            OnClick: data.onclick
                        });
                    });
                };

                var _check_if_follows = function (res) {
                    if (res.result != "nok") return true;

                    jQuery(elems["loading"]).fadeOut(500, function () {
                        elems["chart"].innerHTML = "";
                        
                        var msg = "in order to view insights about pages, you must follow them first!";

                        var _div = GlobalUtilities.create_nested_elements([
                            {
                                Type: "div", Class: "small-12 medium-12 large-12 rv-circle WarmBorder",
                                Style: "padding:0.5rem 1rem; text-align:center; color:rgb(150,150,150);" +
                                    "font-weight:bold; margin-bottom:1rem;",
                                Childs: [{Type: "text", TextValue: msg}]
                            },
                            {
                                Type: "div", Class: "small-12 medium-10 large-8",
                                Style: "margin:0rem auto;", Name: "_div"
                            }
                        ], elems["chart"])["_div"];

                        new UserMini(_div, that.Objects.User, {
                            TopClass: "small-12 medium-12 large-12",
                            Micro: true,
                            FollowButton: true,
                            FollowingStatus: res.relationship.outgoing_status
                        });

                        jQuery(elems["chart"]).fadeIn(500);
                    });

                    return false;
                };

                if (data.initialized)
                    return !data.processing ? _do() : data.callbacks.push(function () { _do(); });

                data.initialized = true;
                data.processing = true;

                RAPI[btn.API]({
                    timezone_offset: (new Date()).getTimezoneOffset(),
                    user_id: (that.Objects.User || {}).id || window.RVGlobal.user_id,
                    count: 50
                }, function (r) {
                    if (!_check_if_follows(r)) return;

                    var _add = function (i) {
                        data.counts.media.push(Number((r[String(i)] || {}).media_count || "0"));
                        data.counts.likes.push(Number(Number((r[String(i)] || {}).likes_count_avg || "0").toFixed(2)));
                        data.counts.comments.push(Number(Number((r[String(i)] || {}).comments_count_avg || "0").toFixed(2)));
                    };

                    if (btn.Type == "hourly") {
                        data.labels = [
                            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
                            "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
                        ];

                        for (var i = 0; i < 24; ++i) _add(i);
                    }
                    else if (btn.Type == "daily") {
                        data.labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                        for (var i = 1; i <= 7; ++i) _add(i);
                    }
                    else if (btn.Type == "monthly") {
                        var months = [
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ];

                        for (var i in r) {
                            var lbl = i.substring(0, i.indexOf("-"));
                            lbl = months[Number(i.substring(i.indexOf("-") + 1)) - 1] + " " + lbl;

                            data.labels.push(lbl);

                            _add(i);
                        }
                    }
                    else if (btn.Type == "single") {
                        var _arr = (r.items || []).reverse();

                        for (var i = 0, lnt = _arr.length; i < lnt; ++i) {
                            data.labels.push("");

                            data.counts.likes.push(Number((_arr[i] || {}).likes_count || "0"));
                            data.counts.comments.push(Number((_arr[i] || {}).comments_count || "0"));
                        }
                    }
                    else if (btn.Type == "tags") {
                        data.datasets = [];

                        data.scales = {
                            yAxes: [{ scaleLabel: { display: true, labelString: "Average of Comments Count" } }],
                            xAxes: [{ scaleLabel: { display: true, labelString: "Average of Likes Count" } }]
                        };

                        var newDic = {};

                        for (var i in r) {
                            var likes = Number(r[i].likes_count_avg.toFixed(2));
                            var comments = Number(r[i].comments_count_avg.toFixed(2));

                            var newId = likes + "," + comments;
                            newDic[newId] = newDic[newId] || { name: [], likes: likes, comments: comments, media: 0 };

                            newDic[newId].name.push(i);
                            newDic[newId].media = Math.max(newDic[newId].media, r[i].media_count);
                        }

                        for (var i in newDic) {
                            var color = GlobalUtilities.generate_color(newDic[i].name.join(""));

                            data.datasets.push({
                                label: newDic[i].name,
                                backgroundColor: color.Color,
                                borderColor: color.Dark,
                                data: [{ x: newDic[i].likes, y: newDic[i].comments, r: newDic[i].media }]
                            });
                        }

                        data.onclick = function (item) {
                            var names = data.datasets[item.DatasetIndex].label;
                            that.show_tags(names, r);
                        };
                    }

                    _do();

                    while (data.callbacks.length) {
                        data.callbacks[data.callbacks.length - 1]();
                        data.callbacks.pop();
                    }

                    data.processing = false;
                });
                //end of 'RAPI[btn.API]({...'
            };
        };

        for (var i = 0, lnt = statNames.length ; i < lnt; ++i)
            _add_button(statNames[i]);
    };

    RStats.prototype = {
        show_tags: function (tagNames, dic) {
            var that = this;

            var _div = GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "small-12 medium-8 large-6 rv-border-radius-1", Name: "_div",
                    Style: "margin:0rem auto; padding:1rem; text-align:center; background-color:white;"
                }
            ])["_div"];

            GlobalUtilities.show(_div);

            for (var i = 0; i < tagNames.length; ++i)
                that.add_tag_stat(_div, tagNames[i], dic[tagNames[i]]);
        },

        add_tag_stat: function (container, name, data) {
            var likes = Number(data.likes_count_avg.toFixed(2));
            var comments = Number(data.comments_count_avg.toFixed(2));

            GlobalUtilities.create_nested_elements([
                {
                    Type: "div", Class: "rv-air-button",
                    Style: "padding:0.2rem 0.4rem; margin:0.2rem; display:inline-block; font-size:0.8rem;" +
                        GlobalUtilities.border_radius("0.2rem"),
                    Properties: [{ Name: "onclick", Value: function () { new TagMedia({ TagName: name }); } }],
                    Childs: [
                        {
                            Type: "div", Style: "display:inline-block;",
                            Childs: [{ Type: "text", TextValue: name }]
                        },
                        {
                            Type: "div", Style: "display:inline-block; padding-left:0.5rem; font-weight:bold;",
                            Childs: [{ Type: "text", TextValue: data.media_count }]
                        },
                        {
                            Type: "div",
                            Style: "display:" + (likes ? "inline-block" : "none") + "; padding-left:0.5rem;",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-heart",
                                    Style: "margin-right:0.3rem; color:rgb(255,7,7); font-size:1rem;",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                },
                                {
                                    Type: "div", Style: "display:inline-block;",
                                    Childs: [{ Type: "text", TextValue: likes }]
                                }
                            ]
                        },
                        {
                            Type: "div",
                            Style: "display:" + (comments ? "inline-block" : "none") + "; padding-left:0.5rem;",
                            Childs: [
                                {
                                    Type: "i", Class: "fa fa-comments-o",
                                    Style: "margin-right:0.3rem; color:rgb(54,198,46); font-size:1rem;",
                                    Attributes: [{ Name: "aria-hidden", Value: true }]
                                },
                                {
                                    Type: "div", Style: "display:inline-block;",
                                    Childs: [{ Type: "text", TextValue: comments }]
                                }
                            ]
                        }
                    ]
                }
            ], container);
        }
    };
})();