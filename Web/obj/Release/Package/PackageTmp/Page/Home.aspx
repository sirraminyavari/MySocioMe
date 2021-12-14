<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Home.aspx.cs" Inherits="MySocioMe.Web.Page.Home"
    MasterPageFile="~/Page/TopMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Script/tooltip/style.css" />

    <style type="text/css">
        .tab-button {
            width:2.5rem; 
            height:2.5rem; 
            text-align:center; 
            margin-bottom:0.2rem; 
            cursor:pointer;
        }
    </style>

    <script type="text/javascript" src="../Script/tooltip/jquery.tooltip.js"></script>

    <script type="text/javascript" src="../Script/chart/Chart.min.js"></script>
    <script type="text/javascript" src="../Script/chart/hammer.min.js"></script>
    <script type="text/javascript" src="../Script/chart/chart.zoom.js"></script>

    <script type="text/javascript" src="../Script/r-stats.js"></script>
    <script type="text/javascript" src="../Script/r-discover.js"></script>

    <script type="text/javascript" src='https://maps.googleapis.com/maps/api/js?key=AIzaSyAJdVa1UEEkCgCwfS5-W3lBtabXhMKU7YQ&sensor=false&libraries=places'></script>
    <script type="text/javascript" src="../Script/location/locationpicker.jquery.js"></script>
    <script type="text/javascript" src="../Script/location-picker.js"></script>

    <script type="text/javascript" src="../Script/user-mini.js"></script>
    <script type="text/javascript" src="../Script/tag-mini.js"></script>
    <script type="text/javascript" src="../Script/media-mini.js"></script>
    <script type="text/javascript" src="../Script/location-mini.js"></script>
    <script type="text/javascript" src="../Script/tag-media.js"></script>
    <script type="text/javascript" src="../Script/location-media.js"></script>
    <script type="text/javascript" src="../Script/my-bookmarks.js"></script>
    <script type="text/javascript" src="../Script/profile-page.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div style="position:fixed; top:0.25rem; left:0.25rem; height:80vh;">
        <div style="display:table; width:100%; height:100%;">
            <div style="display:table-cell; vertical-align:middle;">
                <div id="profileButton" class="rv-border-radius-quarter SoftBackgroundColor SoftBorder tab-button">
                    <i class="fa fa-home fa-lg" aria-hidden="true" style="line-height:2.5rem;"></i>
                </div>

                <div id="bookmarkButton" class="rv-border-radius-quarter SoftBackgroundColor SoftBorder tab-button">
                    <i class="fa fa-bookmark fa-lg" aria-hidden="true" style="line-height:2.5rem;"></i>
                </div>

                <div id="discoverButton" class="rv-border-radius-quarter SoftBackgroundColor SoftBorder tab-button">
                    <i class="fa fa-globe fa-lg" aria-hidden="true" style="line-height:2.5rem;"></i>
                </div>

                <div id="statsButton" class="rv-border-radius-quarter SoftBackgroundColor SoftBorder tab-button">
                    <i class="fa fa-bar-chart fa-lg" aria-hidden="true" style="line-height:2.5rem;"></i>
                </div>

                <div id="logoutButton" class="rv-border-radius-quarter SoftBackgroundColor SoftBorder tab-button">
                    <i class="fa fa-power-off fa-lg" aria-hidden="true" style="line-height:2.5rem;"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="small-12 medium-12 large-12 row align-center" style="padding:2rem 4rem;">
        <div id="profileArea" class="small-12 medium-12 large-12"></div>
        <div id="bookmarksArea" class="small-12 medium-12 large-12" style="display:none;"></div>
        <div id="discoverArea" class="small-12 medium-12 large-12 row align-center" style="margin:0rem; display:none;"></div>
        <div id="statsArea" class="small-12 medium-12 large-12 row align-center" style="margin:0rem; display:none;"></div>
    </div>

    <script type="text/javascript">
        (function () {
            var initialJson = window.RVGlobal = JSON.parse(document.getElementById("initialJson").value);

            var bookmarkedLocations = null; statsObj = null, profileObj = null, discoverObj = null;

            var pages = [
                {
                    Page: "profileArea", Button: "profileButton", Tooltip: "home",
                    OnSelect: function () {
                        if (!profileObj) profileObj = new ProfilePage("profileArea", { UserID: initialJson.user_id });
                        else profileObj.show_actions();
                    },
                    OnClose: function () {
                        if (profileObj) profileObj.hide_actions();
                    }
                },
                {
                    Page: "bookmarksArea", Button: "bookmarkButton", Tooltip: "bookmarks",
                    OnSelect: function () {
                        if (!bookmarkedLocations) bookmarkedLocations = new MyBookmarks("bookmarksArea");
                    }
                },
                {
                    Page: "discoverArea", Button: "discoverButton", Tooltip: "discover",
                    OnSelect: function () {
                        if (!discoverObj) discoverObj = new RDiscover(document.getElementById("discoverArea"));
                    }
                },
                {
                    Page: "statsArea", Button: "statsButton", Tooltip: "statistics",
                    OnSelect: function () {
                        if (!statsObj) statsObj = new RStats(document.getElementById("statsArea"));
                    }
                }
            ];

            var current = null;
            var changingPage = false;

            var _set = function (item) {
                item.Page = document.getElementById(item.Page);
                item.Button = document.getElementById(item.Button);

                GlobalUtilities.append_tooltip(item.Button, item.Tooltip, { Align: "right" });

                item.Button.onclick = function () {
                    if (changingPage || (item.Page == (current || {}).Page)) return;
                    changingPage = true;

                    var cls = "rv-border-radius-quarter [x]BackgroundColor SoftBorder tab-button";

                    if (current) current.Button.setAttribute("class", cls.replace("[x]", "Soft"));
                    item.Button.setAttribute("class", cls.replace("[x]", "Warm"));

                    if (current && current.OnClose) current.OnClose();

                    if (!current) {
                        jQuery(item.Page).fadeIn(500, function () { if (item.OnSelect) item.OnSelect(); });
                        changingPage = false;
                    }
                    else {
                        jQuery(current.Page).fadeOut(500, function () {
                            jQuery(item.Page).fadeIn(500, function () { if (item.OnSelect) item.OnSelect(); });
                            changingPage = false;
                        });
                    }

                    current = item;
                };
            };

            for (var i = 0, lnt = pages.length; i < lnt; ++i)
                _set(pages[i]);

            jQuery(pages[0].Button).click();

            //logout
            var logoutButton = document.getElementById("logoutButton");

            GlobalUtilities.append_tooltip(logoutButton, "sign out", { Align: "right" });

            var loggingOut = false;

            logoutButton.onclick = function () {
                if (loggingOut) return;
                loggingOut = true;

                RAPI.logout({}, function (r) {
                    if (r.logged_out) window.location = "../login";
                    loggingOut = false;
                });
            };
            //end of logout
        })();
    </script>
</asp:Content>