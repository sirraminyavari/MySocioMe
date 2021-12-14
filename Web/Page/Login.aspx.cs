using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using DBUtil;

namespace MySocioMe.Web.Page
{
    public partial class Login : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string code = Request.Params["code"];
            string redirectUri = Request.Params["redirect_uri"];

            if (!string.IsNullOrEmpty(code))
            {
                Session[Util.API.CodeSessionVariableName] = code;

                User user = new DBUtil.User();

                string token = string.Empty;
                Util.API.get_token(ref token, code, ref user);

                string invitedByUserId = string.IsNullOrEmpty(Request.Params["invitedby"]) ? 
                    (string)Session["invitedby"] : Request.Params["invitedby"];

                if (user != null && !string.IsNullOrEmpty(user.UserID) && !string.IsNullOrEmpty(user.UserName))
                {
                    if (string.IsNullOrEmpty(redirectUri))
                    {
                        if (!string.IsNullOrEmpty(token)) Session[Util.API.TokenSessionVariableName] = token;
                        if (!string.IsNullOrEmpty(user.UserID)) Session[Util.API.UserIDSessionVariableName] = user.UserID;
                    }

                    string localToken = PublicMethods.local_token(token);
                    
                    DBController.activate_user(user.UserID, user.UserName, user.FullName, 
                        code, token, localToken, invitedByUserId, user.ImageURL);

                    if (string.IsNullOrEmpty(redirectUri)) Response.Redirect(PublicConsts.HomePage);
                    else Response.Redirect(redirectUri + (redirectUri.IndexOf("?") > 0 ? "&" : "?") + "token=" + localToken);
                }
            }
            else
            {
                string invitedBy = Request.Params["invitedby"];
                if (!string.IsNullOrEmpty(invitedBy)) Session["invitedby"] = invitedBy;
            }
        }
    }
}