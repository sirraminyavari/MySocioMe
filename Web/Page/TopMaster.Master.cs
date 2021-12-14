using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using DBUtil;

namespace MySocioMe.Web.Page
{
    public partial class TopMaster : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string code = (string)Session[Util.API.CodeSessionVariableName];
            string token = (string)Session[Util.API.TokenSessionVariableName];

            string redirectUri = Request.Params["redirect_uri"];

            if (Request.Url.AbsolutePath.ToLower().Contains("privacypolicy") ||
                Request.Url.AbsolutePath.ToLower().Contains("wellcome")) return;
            else if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(token))
            {
                bool doLogin = string.IsNullOrEmpty(Request.Params["go"]) ? false :
                Request.Params["go"].ToLower() == "1";

                if (doLogin) Util.API.login_request(Page);
                else if (!Request.Url.AbsolutePath.ToLower().Contains("login")) Response.Redirect(PublicConsts.LoginPage);
            }
            else if (!string.IsNullOrEmpty(redirectUri))
                Response.Redirect(redirectUri + (redirectUri.IndexOf("?") > 0 ? "&" : "?") + "token=" + PublicMethods.local_token(token));
            else if (!Request.Url.AbsolutePath.ToLower().Contains("home"))
                Response.Redirect(PublicConsts.HomePage);
            else
            {
                string userId = (string)Session[Util.API.UserIDSessionVariableName];

                bool wellcome = false;

                if (Session["wellcome-dialog"] == null) Session["wellcome-dialog"] = wellcome = true;
                else Session["wellcome-dialog"] = wellcome = false;

                initialJson.Value = "{" +
                    "\"user_id\":\"" + (string.IsNullOrEmpty(userId) ? string.Empty : userId) + "\"" +
                    ",\"wellcome\":" + wellcome.ToString().ToLower() +
                    "}";
            }
        }
    }
}