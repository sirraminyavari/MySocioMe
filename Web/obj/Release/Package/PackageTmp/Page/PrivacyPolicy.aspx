<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="PrivacyPolicy.aspx.cs" Inherits="MySocioMe.Web.Page.PrivacyPolicy" 
    MasterPageFile="~/Page/TopMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style type="text/css">
        .title {
            font-weight:bold;
            text-align:center;
        }
    </style>

    <script type="text/javascript">
        document.title = document.title + " - " + "Privacy Policy";
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="small-12 medium-12 large-12" style="padding:0vw 8vw; text-align:justify;">
        <div class="small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" 
            style="padding:1rem; background-color:white; margin:1rem 0rem;">
            <p class="title">My Socio Me’s Privacy Policy</p>
            <p>My Socio Me is a service providing registered users of Instagram to use their Instagram's media. My Socio Me also allows you to locate other Instagram’s users.</p>
            <p>This Privacy Policy describes how and when My Socio Me collects and uses your information when you use our Services. My Socio Me receives your information through our APIs and applications. When using any of our Services you consent to the collection, transfer, manipulation, storage, disclosure and other uses of your information as described in this Privacy Policy. Irrespective of which country you reside in or supply information from, you authorize My Socio Me to use your information in any country where My Socio Me operates.</p>
            <p>If you have any questions or comments about this Privacy Policy, please contact us at <a href="mailto:info@mysociome.com">info@mysociome.com</a>.</p>
        </div>

        <div class="small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" 
            style="padding:1rem; background-color:white; margin:1rem 0rem;">
            <p class="title">Information Collection and Use</p>
            <p>We collect and use your information below to provide our Services and to measure and improve our Services from time to time.</p>
            
            <p><span class="title">Share, Re-post & Settings</span>: Our Services are primarily designed to help you share your Instagram’s albums with the world. Most of the information you provide us is information you are asking us to make public. This includes not only your photos or videos under your Instagram’s account and the metadata provided with My Socio Me, such as when you re-post or share your Instagram photo album, and many other bits of information that result from your use of the Services. We may use this information to customize the content we show you, including advertisements or our promotions. Our default setting is almost always to make the information you provide public for as long as you do not delete it from My Socio Me, but we generally give you settings to make the information more private if you want. Our Services broadly and instantly disseminate your public information to a wide range of users, customers, and services. When you share information or content like photos, videos, and links via the Services, you should think carefully about what you are making public.</p>
        
            <p><span class="title">Location Information</span>: We may use other data from your device to determine location, for example, information about wireless networks or cell towers near your mobile device, or your IP address. We may use and store information about your location to provide features of our Services to improve and customize the Services, for example, with more relevant content like local trends, stories, ads, and suggestions for people to follow.</p>

            <p><span class="title">Links</span>: My Socio Me may keep track of how you interact with links across our Services, including our third-party services, and client applications, by redirecting clicks or through other means. We do this to help improve our Services, to provide more relevant advertising, and to be able to share aggregate statistics such as the frequency of a particular link being clicked on.</p>

            <p><span class="title">Cookies</span>: Like many apps, we use cookies and similar technologies to collect additional application usage data and to improve our Services, but we do not require cookies for many parts of our Services such as searching and looking at public user profiles. My Socio Me may use both session cookies and persistent cookies to better understand how you interact with our Services, to monitor aggregate usage by our users and traffic routing on our Services, and to customize and improve our Services. Most applications automatically accept cookies.</p>

            <p><span class="title">Google Analytics</span>: We will also install Google Analytics in the apps, devices, or mobile apps to collect your behaviors in using our Services. We will also recommend some other services that may be suitable or appeal to you based on our analysis.</p>

            <p><span class="title">Log Data</span>: When you use My Socio Me, we may receive information ("Log Data") such as your IP address, device information (including device and application IDs) and search terms. My Socio Me uses Log Data to provide, understand, and improve our Services.</p>
        </div>
        
        <div class="small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" 
            style="padding:1rem; background-color:white; margin:1rem 0rem;">
            <p class="title">Information Sharing and Disclosure</p>
            <p>We do not disclose your private personal information except in the limited circumstances described here.</p>

            <p><span class="title">Your Consent</span>: We may share or disclose your information at your direction, such as when you authorize a third-party web client or application to access your My Socio Me account.</p>

            <p><span class="title">Law and Harm</span>: Notwithstanding anything to the contrary in this Policy, we may preserve or disclose your information if we believe that it is reasonably necessary to comply with a law, regulation or legal request; to protect the safety of any person; to address fraud, security or technical issues; or to protect My Socio Me's rights or property. However, nothing in this Privacy Policy is intended to limit any legal defenses or objections that you may have to a third party, including a government, request to disclose your information.</p>

            <p><span class="title">Business Transfers and Affiliates</span>: In the event that My Socio Me is involved in a bankruptcy, merger, acquisition, reorganization or sale of assets, your information may be sold or transferred as part of that transaction. This Privacy Policy will apply to your information as transferred to the new entity. We may also disclose information about you to our corporate affiliates in order to help provide, understand, and improve our Services including the delivery of ads.</p>

            <p><span class="title">Non-Private or Non-Personal Information</span>: We may share or disclose your non-private, aggregated or otherwise non-personal information, such as your public user profile information, the people you share your information with, or the number of users who clicked on a particular link (even if only one did), or reports to advertisers about unique users who saw or clicked on their ads after we have removed any private personal information (such as your name or contact information).</p>
        </div>

        <div class="small-12 medium-12 large-12 rv-border-radius-1 SoftShadow" 
            style="padding:1rem; background-color:white; margin:1rem 0rem;">
            <p class="title">Changes to this Policy</p>
            <p>We may revise this Privacy Policy from time to time. The most current version of the policy will govern our use of your information and will always be at <a href="http://mysociome.com/privacypolicy">http://mysociome.com/privacypolicy</a>. If we make a change to this policy that, in our sole discretion, is material, we will update <a href="http://mysociome.com/privacypolicy">http://mysociome.com/privacypolicy</a>. By continuing to access or use the Services after those changes become effective, you agree to be bound by the revised Privacy Policy.</p>
        </div>

        <p style="font-style:italic; font-size:0.8rem; font-weight:bold; text-align:center;">Effective: 1st June 2017</p>
    </div>
</asp:Content>