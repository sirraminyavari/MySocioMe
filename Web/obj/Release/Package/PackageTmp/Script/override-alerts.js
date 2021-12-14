(function () {
    if (window.OverrideAlerts) return;
    window.OverrideAlerts = true;
    
    var init = function () {
        window._alert = window.alert;

        jQuery.alerts.verticalOffset = 0;
        
        window.alert = function (message, params, callback) {
            params = params || {};
            if (params.Original === true) { _alert(message); return; }
            jQuery.alerts.okButton = "confirm";

            var _msg = '<div style="text-align:center; margin-right:35px;">' + message + '</div>';

            setTimeout(function () {
                jAlert(_msg, '', callback, { Timeout: typeof (params.Timeout) == "undefined" ? 3000 : params.Timeout });
            }, 100);
        }
        
        GlobalUtilities.confirm = function (message, callback) {
            jQuery.alerts.okButton = "yes";
            jQuery.alerts.cancelButton = "no";
            jConfirm('<div style="text-align:center; margin-right:35px;">' + message + '</div>', '',
                function (result) { if (callback) callback(result); });
        }
        
        GlobalUtilities.dialog = function (containerDiv, title, params) {
            var dlg = jDialog(containerDiv, title, params);
            return { Close: function () { jQuery.alerts._hide(dlg); }, Refresh: function () { jQuery.alerts._reposition(dlg); } }
        }
    }

    init();
})();