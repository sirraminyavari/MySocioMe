<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Wellcome.aspx.cs" Inherits="MySocioMe.Web.Page.Wellcome" 
    MasterPageFile="~/Page/TopMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="small-12 medium-12 large-12" style="padding:0vw 8vw; text-align:justify;">
        <div style="margin:1rem; background-color:white; padding:1rem; text-align:center; font-weight:bolder; font-size:2rem; line-height:4rem;">
            <div class="rv-circle SoftBorder" style="margin:0.5rem; display:inline-block; width:4rem; height:4rem; border-width:6px;">1</div>
            <div class="rv-circle SoftBorder" style="margin:0.5rem; display:inline-block; width:4rem; height:4rem; border-width:6px;">2</div>
            <div class="rv-circle SoftBorder" style="margin:0.5rem; display:inline-block; width:4rem; height:4rem; border-width:6px;">3</div>
            <div class="rv-circle SoftBorder" style="margin:0.5rem; display:inline-block; width:4rem; height:4rem; border-width:6px;">4</div>
        </div>

        <div class="small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" 
            style="padding:1rem; background-color:white; margin:1rem 0rem;">
            <div style="font-weight:bold; text-align:center; margin-bottom:1rem; color:rgb(100,100,100);">
                Wellcome, we are glad to have you in '<span style="color:black; font-weight:bold;">My Socio Me</span>'!
            </div>
            <div>
                My Socio Me is your private panel to get insights about your Instagram account. 
                Our insights & reports help you understand your social position. In addition you can 
                <span style="font-weight:bold; font-style:italic;"> find, follow and observe </span> 
                other competitors' social precense.
            </div>
            <div style="font-weight:bold; text-align:center; margin:1rem 0rem;">
                <div style="display:inline-block;">Let's go!</div>
                <div class="wellcome-more rv-air-button" style="display:inline-block; margin-left:1rem;">click me!</div>
            </div>
            <div style="margin:0.5rem 0rem;">
                <span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark pages:</span> to better know your competitors and get insights about them!
            </div>
            <div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">
                <img src="../image/help/bookmark-pages-2.png" class="rv-border-radius-half" style="max-width:80%;" />
            </div>
            <div style="margin:0.5rem 0rem;">
                <span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark tags:</span> to let us suggest other competitors and people to you and then bookmark or follow them!
            </div>
            <div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">
                <img src="../image/help/bookmark-tags-2.png" class="rv-border-radius-half" style="max-width:80%;" />
            </div>
            <div style="margin:0.5rem 0rem;">
                <span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Bookmark locations:</span> to let us find people in your target locations and suggest them to you for sending follow request!
            </div>
            <div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">
                <img src="../image/help/bookmark-locations-2.png" class="rv-border-radius-half" style="max-width:80%;" />
            </div>
            <div style="margin:0.5rem 0rem;">
                <span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">Finally:</span> find the right audience for your business and follow them!
            </div>
            <div style="text-align:center; margin:0.5rem 0rem 1.5rem 0rem;">
                <img src="../image/help/suggestions.png" class="rv-border-radius-half" style="max-width:80%;" />
            </div>
            <div style="margin:0.5rem 0rem;">
                <span style="font-weight:bold; font-style:italic; margin-right:0.5rem;">And one more thing!:</span> see our useful reports about your page.
            </div>
            <div style="text-align:center; margin-top:0.5rem;">
                <img src="../image/help/tags-report.png" class="rv-border-radius-half" style="max-width:80%;" />
            </div>
        </div>
    </div>
</asp:Content>