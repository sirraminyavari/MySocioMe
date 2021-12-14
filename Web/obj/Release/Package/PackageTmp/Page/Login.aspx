<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="MySocioMe.Web.Page.Login" 
    MasterPageFile="~/Page/TopMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style type="text/css">
        .rv-background-cover {
            -webkit-background-size: cover !important;
            -moz-background-size: cover !important;
            -o-background-size: cover !important;
            background-size: cover !important;
        }

        .rv-zoom-1 {
            transform:scale(1.25);
        }

        .rv-zoom-2 {
            transform:scale(1.1);
        }

        .rv-zoom-transition {
            transition:all 4s;
        }
    </style>

    <script type="text/javascript">
        document.title = document.title + " - " + "Login";
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="firstBackground" class="rv-background-cover" 
        style="position:fixed; top:0rem; left:0rem; width:100vw; height:100vh; z-index:1;">
    </div>

    <div id="secondBackground" class="rv-background-cover" 
        style="position:fixed; top:0rem; left:0rem; width:100vw; height:100vh; z-index:2;">
    </div>

    <div style="position:fixed; top:0rem; left:0rem; width:100vw; height:100vh; z-index:3;">
        <div style="display:table; width:100%; height:100%;">
            <div style="display:table-cell; vertical-align:middle;">
                <div class="small-12 medium-12 large-12 row align-center" style="margin:0rem;">
                    <div class="small-10 medium-8 large-6 row align-center rv-border-radius-1" 
                        style=" margin:0rem; background-color:rgba(255,255,255,0.8); padding:1rem;">
                        <div class="small-12 medium-12 large-12" style="margin-bottom:0.8rem; text-align:center; font-weight:bold;">
                            My Socio Me
                        </div>
                        <div class="small-12 medium-12 large-12" style="margin-bottom:1rem; text-align:center; font-size:0.8rem;">
                            visit your instagram account, give insights about your page and find out how to make more followers!
                        </div>
                        <div id="loginButton" class="small-12 medium-8 large-6 ActionButton" 
                            style="text-align:center; padding:0.5rem 0rem;">
                            <i class="fa fa-instagram fa-lg" style="margin-right:0.5rem;"></i>
                            <span>Log in with Instagram</span>
                        </div>
                        <div class="small-12 medium-12 large-12" style="margin-top:1rem; text-align:center; font-size:0.8rem;">
                            read our <span style="margin-left:0.2rem; font-weight:bold; color:blue; cursor:pointer;" onclick="window.open('../privacypolicy');">privacy policy</span>
                        </div>
                        <div class="small-12 medium-12 large-12 rv-border-radius-1" 
                            style="margin-top:1rem; text-align:center; padding:1rem; background-color:rgba(0, 0, 0, 0.4);">
                            <a href="https://cafebazaar.ir/app/com.android.instaprofilegrabber"
                                style="text-decoration:none; color:white; font-weight:bold; font-size:1.2rem;">
                                <img src="../image/ipg.png" style="width:3rem; height:3rem; margin-right:0.5rem;" alt="Insta Profile Grabber" />
                                Download our android application from 'Cafe Bazzar'
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        (function () {
            document.getElementById("loginButton").onclick = function () {
                window.location.href = window.location.href + "?go=1";
            };
        })();
    </script>

    <script type="text/javascript">
        (function () {
            var arr = [
                "01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg",
                "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg",
                "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", "26.jpg", "27.jpg", "28.jpg", "29.jpg", "30.jpg",
                "31.jpg", "32.jpg", "33.jpg"
            ];

            //shuffle the arr
            for (var i = 0, lnt = arr.length; i < lnt; ++i)
                arr[i] = Math.random() + "_" + arr[i];

            arr = arr.sort();

            for (var i = 0, lnt = arr.length; i < lnt; ++i)
                arr[i] = arr[i].substring(arr[i].indexOf("_") + 1);
            //end of shuffle the arr

            var counter = 0;

            var firstBackground = document.getElementById("firstBackground");
            var secondBackground = document.getElementById("secondBackground");

            var currentBackground = secondBackground;
            
            var _set = function () {
                var imageUrl = "../image/" + arr[(counter++) % arr.length];

                var other = currentBackground;
                currentBackground = currentBackground == firstBackground ? secondBackground : firstBackground;

                jQuery(currentBackground).fadeOut(0, function () {
                    currentBackground.style.zIndex = 2;
                    other.style.zIndex = 1;

                    currentBackground.setAttribute("class", "rv-background-cover");
                    currentBackground.style.background = "url('" + imageUrl + "') no-repeat center center fixed";

                    jQuery(currentBackground).fadeIn(1000);
                });

                setTimeout(function () {
                    currentBackground.classList.add("rv-zoom-" + GlobalUtilities.random(1, 2));
                    currentBackground.classList.add("rv-zoom-transition");
                }, 100);

                //jQuery(other).fadeOut(1000);
            };

            secondBackground.style.background = "url('../image/" + arr[arr.length - 1] + "') no-repeat center center fixed";

            setTimeout(function () {
                _set();

                setInterval(function () { _set(); }, 8000);
            }, 3000);
        })();
    </script>
</asp:Content>