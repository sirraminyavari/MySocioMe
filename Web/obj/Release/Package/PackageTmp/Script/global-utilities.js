﻿
///////////////////////////////////////////
//////////--> GlobalUtilities <--//////////
///////////////////////////////////////////

if (!window.GlobalUtilities) window.GlobalUtilities = {
    ScriptsFolder: "Global_JavaScripts",
    AccessTokenParameterName: "acstkn",

    generate_new_guid: (function () {
        var S4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).toUpperCase().substring(1); }
        return function () { return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()); }
    })(),

    generate_color: function (id) {
        //prepare id
        var str = String( "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")  ;
        var numbers = [2, 35, 23, 6, 9, 4, 274, 742, 45, 565, 456, 34, 798, 12, 56, 776, 665];
        id = String(!id ? "" : id);
        var initialLength = id.length;
        while (id.length < 15)
            id += str.charAt((id.charCodeAt(id.length % initialLength) * numbers[id.length]) % str.length);
        //end of prepare id

        var hue = 1, saturation = 1, lightness = 1;
        
        for (var i = 0; i < 8; ++i) hue = (10 * hue) + String(id).charCodeAt(i);
        for (var i = 9; i < 13; ++i) saturation = (10 * saturation) + String(id).charCodeAt(i);
        //for (var i = 14; i < 18; ++i) lightness = (10 * lightness) + String(id).charCodeAt(i);

        var color = "hsl(" + (hue % 360) + "," + ((saturation % 80) + 20) + "%,85%)";
        var hover = "hsl(" + (hue % 360) + "," + ((saturation % 80) + 20) + "%,60%)";
        var dark = "hsl(" + (hue % 360) + "," + ((saturation % 80) + 20) + "%,30%)";

        return { Color: color, Hover: hover, Dark: dark };
    },

    request_params: function () {
        var params = { get_value: function (str) { } };
        var loc = window.location.toString();
        if (loc.indexOf("?") < 0) return params;
        var parameters = loc.substr((loc.indexOf("?") + 1)).split("&");

        for (var i = 0; i < parameters.length; i++) {
            var index = parameters[i].indexOf("=");
            if (index < 0 || index == parameters[i].length - 1) continue;

            var key = parameters[i].substr(0, index);
            params[key] = params[key.toLowerCase()] = parameters[i].substr(index + 1);
        }

        params.get_value = function (str) { return params[String(str).toLowerCase()]; }

        return params;
    },

    random: function (min, max) {
        if (!min || isNaN(min)) min = 0;
        if (!max || isNaN(max)) max = 9999999999;
        if (max < min) { var t = min; min = max; max = t; }
        if (min == max) return min;
        var lnt = String(max).length;
        return (Math.random() * Math.pow(10, lnt + 1)).toFixed(0) % (max - min + 1) + min;
    },

    zindex: (function () {
        var _z = function (p) { return p * 10000000; }

        return {
            alert: (function () { var z = _z(3); return function () { return ++z; } })(),
            tooltip: (function () { var z = _z(2); return function () { return ++z; } })(),
            dialog: (function () { var z = _z(1); return function () { return ++z; } })()
        }
    })(),

    border_radius: (function () {
        var str = String("border-radius:VALUE; -webkit-border-radius:VALUE; -moz-border-radius:VALUE; -op-border-radius:VALUE;");
        var regExp = new RegExp("VALUE", 'g');
        return function (value) { return str.replace(regExp, (isNaN(+value) ? value : String(value) + "px")); }
    })(),

    transform_rotate: (function () {
        var str = String("-ms-transform: rotate(45deg); -webkit-transform: rotate(VALUEdeg); -moz-transform: rotate(VALUEdeg);" +
            "-op-transform: rotate(VALUEdeg); transform: rotate(VALUEdeg);")
        var regExp = new RegExp("VALUE", 'g');
        return function (value) { return str.replace(regExp, String(value)); }
    })(),

    linear_background_gradient: (function () {
        var _base = String("background: [x]linear-gradient(Degree Top Bottom);");
        var str = _base.replace("[x]", "") + _base.replace("[x]", "-moz-") + _base.replace("[x]", "-webkit-") + _base.replace("[x]", "-o-");
        var topRegExp = new RegExp("Top", 'g'), bottomRegExp = new RegExp("Bottom", 'g'), degRegExp = new RegExp("Degree", 'g');
        return function (topColor, bottomColor, params) {
            var params = params || {};
            return str.replace(degRegExp, params.Degree ? String(params.Degree) + "," : "").replace(topRegExp, String(topColor) + ",").replace(bottomRegExp, String(bottomColor));
        }
    })(),

    add_to_escape_queue: (function () {
        var arr = [];

        var wait = false;

        var _init = function () {
            if (!window.jQuery) setTimeout(function () { _init(); }, 100);

            jQuery(document).keydown(function (e) {
                if (wait || (e.which != 27)) return;

                while (arr.length > 0) {
                    var itm = arr[arr.length - 1];
                    arr.pop();

                    if (GlobalUtilities.is_element_in_document(itm.Element)) {
                        itm.Done({ wait: function () { wait = true; }, go: function () { wait = false; } }); return;
                    }
                }
            });
        }

        _init();

        return function (element, done) { arr.push({ Element: element, Done: done }); }
    })(),

    is_element_in_document: function (element) {
        while (element = (element || {}).parentNode)
            if (element == document) return true;
        return false;
    },

    is_visible: (function () {
        var _check = function (elem) { return ((elem || {}).style || {}).display != "none"; }

        return function (element) {
            var elem = element;
            if (!_check(element)) return false;
            while (element = (element || {}).parentNode) if (!_check(element)) return false;
            return GlobalUtilities.is_element_in_document(elem);
        }
    })(),

    cheat_code: (function () {
        var codes = {};
        var str = String("");

        jQuery(document).ready(function () {
            jQuery(document.body).on("keydown", function (e) {
                var char = String.fromCharCode(e.which) || "";

                if (char != "") str += String(char == "4" && e.shiftKey ? "$" : char).toLowerCase();
                for (var c in codes) {
                    if (!codes[c]) continue;
                    if (str.length > c.length && str.substr(str.length - c.length) == c &&
                        str[str.length - c.length - 1] == "$") codes[c]();
                }
            });
        });

        return function (cheatCode, done) {
            codes[String(cheatCode).toLowerCase()] = done;
        }
    })(),

    cheadget: (function () {
        var _names = {};

        var _add = function (item) {
            var name = String(item.Name || item).toLowerCase();
            var alias = String(item.Alias || name).toLowerCase();

            GlobalUtilities.cheat_code(alias, function () {
                if (_names[name]) {
                    if (((window.RVCheadget || {})[name] || {}).show) RVCheadget[name].show();
                    return;
                }
                _names[name] = true;

                GlobalUtilities.load_files(["Cheadget/" + name + "/" + name + ".js"]);
            });
        }

        return function () {
            for (var i = 0, lnt = (arguments || []).length; i < lnt; ++i) _add(arguments[i]);
        }
    })(),

    icon: function (params) { return "../../ReDesign/images/" + ((params || {}).Name || params || "") + ((params || {}).NoCache ? "?timeStamp=" + new Date().getTime() : ""); },
    js: function (params) { return "../../Global_JavaScripts/" + ((params || {}).Name || params || ""); },
    css: function (params) { return "../../ReDesign/css/" + ((params || {}).Name || params || ""); },

    append_clear_div: function (_div) {
        var clearDiv = document.createElement("div");
        clearDiv.style.clear = "both";
        if (_div == null) return clearDiv;
        _div.appendChild(clearDiv);
    },

    escape_html: (function () {
        var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': '&quot;', "'": '&#39;', "/": '&#x2F;' };
        return function (str) { return String(str).replace(/[&<>"'\/]/g, function (s) { return map[s]; }); }
    })(),

    get_css_property: function (selector, attribute) {
        var value;

        [ ].some.call(document.styleSheets || [], function (sheet) {
            return [].some.call(sheet.cssRules || sheet.rules || [], function (rule) {
                if (selector !== rule.selectorText) return false;

                var index = rule.cssText.indexOf(attribute);
                if (index < 0) return false;

                var cssText = rule.cssText.substr(index + attribute.length + 2);
                value = cssText.substr(0, cssText.indexOf(";"));

                return true;
            });
        });

        return value;
    },

    request_param: function (paramName) {
        if (paramName = (new RegExp('[?&]' + encodeURIComponent(paramName) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(paramName[1]);
    },

    append_tooltip: function (_obj, value, params) {
        params = params || {};
        if (GlobalUtilities.trim(value || "") == "") return;
        if (typeof (_obj) != "object") _obj = document.getElementById(_obj);
        if (_obj) _obj.title = "<div style='" + (params.Direction ? "direction:" + params.Direction + ";" : "") + "'>" + value + "</div>";
        try { jQuery(_obj).tooltip({ align: (params.Align ? String(params.Align).toLowerCase() : 'autoTop'), html: true, fade: true }); }
        catch (e) { }
    },

    stick: function (elem, sticker, params) {
        params = params || {};
        elem = jQuery(elem);
        sticker = jQuery(sticker);
        var align = String(params.Align || "bottom").toLowerCase().charAt(0);

        var pos = jQuery.extend({}, elem.offset(), { width: elem[0].offsetWidth, height: elem[0].offsetHeight });

        var _css = GlobalUtilities.extend({ position: 'absolute', zIndex: GlobalUtilities.zindex.dialog() },
            (params.Fit === true ? { width: pos.width } : {}));

        sticker.css(_css);

        sticker.appendTo(document.body);

        var actualWidth = sticker[0].offsetWidth;
        var actualHeight = sticker[0].offsetHeight;
        var dir = align === 'autotop' ? (pos.top > (jQuery(document).scrollTop() + jQuery(window).height() / 2) ? 't' : 'b') :
            (pos.left > (jQuery(document).scrollLeft() + jQuery(window).width() / 2) ? 'l' : 'r');
        
        sticker.css({ top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 });

        var _newTop = 0;
        var _newLeft = 0;
        var _leftOffset = 0, _topOffset = 0;

        var stickeePosition = {};

        switch (align === 'a' ? dir : align) {
            case 'b':
                _newTop = pos.top + pos.height;
                _leftOffset = params.LeftOffset ? params.LeftOffset : 0;
                _newLeft = pos.left + pos.width / 2 - actualWidth / 2 + _leftOffset;
                stickeePosition = { Top: _newTop, Left: pos.left + pos.width / 2, Dir: "bottom" };
                break;
            case 't':
                _newTop = pos.top - actualHeight;
                _leftOffset = params.LeftOffset ? params.LeftOffset : 0;
                _newLeft = pos.left + pos.width / 2 - actualWidth / 2 + _leftOffset;
                stickeePosition = { Top: pos.top, Left: pos.left + pos.width / 2, Dir: "top" };
                break;
            case 'l':
                _topOffset = params.TopOffset ? params.TopOffset : 0;
                _newTop = pos.top + pos.height / 2 - actualHeight / 2 + _topOffset;
                _newLeft = pos.left - actualWidth;
                stickeePosition = { Top: pos.top + pos.height / 2, Left: pos.left, Dir: "left" };
                break;
            case 'r':
                _topOffset = params.TopOffset ? params.TopOffset : 0;
                _newTop = pos.top + pos.height / 2 - actualHeight / 2 + _topOffset;
                _newLeft = pos.left + pos.width;
                stickeePosition = { Top: pos.top + pos.height / 2, Left: _newLeft, Dir: "right" };
                break;
        }
        
        var scrollTop = 0;
        if (align == 'l' || align == 'r') {
            var obj = elem.get(0);
            while (obj) {
                if (((obj.style || {}).position || "").toLowerCase() == "fixed" || (scrollTop = jQuery(obj).scrollTop())) break;
                obj = obj.parentNode;
            }
        }

        var windowWidth = jQuery(window).width();
        var windowHeight = jQuery(window).height();
        var rightOut = _newLeft + actualWidth - windowWidth;
        var bottomOut = _newTop + actualHeight - (windowHeight + scrollTop);
        var browserBorderMargin = 4; //Minimum distance to browser window borders

        var computedLeft = 0;
        var computedTop = 0;

        if (rightOut > 0) computedLeft = _newLeft - rightOut - browserBorderMargin;
        else computedLeft = _newLeft <= browserBorderMargin ? browserBorderMargin : _newLeft;

        if (bottomOut > 0) computedTop = _newTop - bottomOut - browserBorderMargin;
        else computedTop = _newTop <= browserBorderMargin ? browserBorderMargin : _newTop;

        sticker.PositionInfo = {
            Width: actualWidth, Height: actualHeight,
            Left: computedLeft, Top: _newTop, LeftMovement: computedLeft - _newLeft + _leftOffset,
            TopMovement: computedTop - _newTop + _topOffset, StickeePosition: stickeePosition, Dir: stickeePosition.Dir
        };

        return sticker.css({
            top: align == 't' || align == 'b' ? _newTop : computedTop,
            left: align == 'l' || align == 'r' ? _newLeft : computedLeft
        });
    },

    popup_menu: function popup_menu(container, content, params) {
        params = params || {};
        var align = String(params.Align || "bottom").toLowerCase().charAt(0);

        var contentDiv = null;

        var containerStyle = "";
        var arrowDivStyle = "";
        var contentDivStyle = "";

        var elems = GlobalUtilities.create_nested_elements([
            {
                Type: "div", Name: "container",
                Childs: [
                    { Type: "div", Name: "arrow", Class: "SoftBackgroundColor SoftBorder" },
                    { Type: "div", Class: "SoftBackgroundColor SoftBorder", Style: "display:inline-block;", Name: "content" }
                ]
            }
        ], document.body);

        contentDiv = elems["content"];

        if (content) contentDiv.appendChild(content);
        
        var _reposition = function () {
            var contentWidth = jQuery(contentDiv)[0].offsetWidth;
            var contentHeight = jQuery(contentDiv)[0].offsetHeight;
            
            switch (align) {
                case 't':
                    {
                        containerStyle = "margin-top:-2px;";
                        arrowDivStyle = "border-top-width:0px; border-left-width:0px; position:absolute; bottom:0px;" +
                            "left:" + (contentWidth / 2 - 5) + "px;";
                        contentDivStyle = "margin-bottom:6px;";
                    }
                    break;
                case 'r':
                    {
                        containerStyle = "padding-left:2px;";
                        arrowDivStyle = "border-right-width:0px; border-top-width:0px; float:left;" +
                            "margin-top:" + ((contentHeight / 2) - 5) + "px;";
                        contentDivStyle = "margin-left:6px;";
                    }
                    break;
                case 'b':
                    {
                        containerStyle = "margin-top:2px;";
                        arrowDivStyle = "border-bottom-width:0px; border-right-width:0px; margin:0px auto 0px auto;";
                        contentDivStyle = "margin-top:-7px;";
                    }
                    break;
                case 'l':
                    {
                        containerStyle = "padding-right:2px;";
                        arrowDivStyle = "border-left-width:0px; border-bottom-width:0px; float:right;" +
                            " margin-top:" + ((contentHeight / 2) - 5) + "px;";
                        contentDivStyle = "margin-right:6px;";
                    }
                    break;
            }

            elems["container"].setAttribute("style", containerStyle);

            elems["arrow"].setAttribute("style", "width:12px; height:12px;" +
                GlobalUtilities.transform_rotate(45) + arrowDivStyle);
            
            contentDiv.setAttribute("style", /* "width:" + contentWidth + "px; height:" + contentHeight + "px;" + */
                GlobalUtilities.border_radius(8) + contentDivStyle);
            
            var stk = GlobalUtilities.stick(container, elems["container"], params);
            
            var _moveOffset = 6, _movement = 0, simeMargin = 0;
            
            if (stk.PositionInfo.LeftMovement != 0 && (align == 't' || align == 'b')) {
                var movedRight = stk.PositionInfo.LeftMovement > 0;
                _movement = stk.PositionInfo.LeftMovement + ((movedRight ? 1 : -1) * _moveOffset);
                sideMargin = (contentWidth / 2) - _movement;
                if (!movedRight) sideMargin = stk.PositionInfo.Width - sideMargin - 1;

                elems["container"].style.direction = movedRight ? "ltr" : "rtl";

                if (align == 'b') {
                    elems["arrow"].style.margin = "0px " + (movedRight ? 0 : sideMargin) + "px 0px " + (movedRight ? sideMargin : 0) + "px";
                } else {
                    var curLeft = String(jQuery(elems["arrow"]).css("left"));
                    curLeft = curLeft.length ? Number(curLeft.substr(0, curLeft.length - 2)) : 0;
                    elems["arrow"].style.left = (curLeft - stk.PositionInfo.LeftMovement) + "px";
                }
            }

            if (stk.PositionInfo.TopMovement != 0 && (align == 'l' || align == 'r')) {
                var curTopMargin = String(jQuery(elems["arrow"]).css("marginTop"));
                curTopMargin = curTopMargin.length ? Number(curTopMargin.substr(0, curTopMargin.length - 2)) : 0;

                elems["arrow"].style.marginTop = (curTopMargin - stk.PositionInfo.TopMovement) + "px";
            }

            if (params.OnAfterShow) params.OnAfterShow(retVal);
        }

        var retVal = {
            Container: elems["container"], Arrow: elems["arrow"],
            Content: contentDiv, Reposition: _reposition,
            Show: function (done) { elems["container"].style.display = "inline-block"; _reposition(); if (done) done(); },
            Hide: function (done) { jQuery(elems["container"]).fadeOut(done); }
        }

        _reposition();

        return retVal;
    },

    enable_by_mouse_over: function (target, content, params) {
        if (!(params || {}).OnStart || !(params || {}).OnEnd) return;
        var jqTarget = (target ? jQuery(target) : null), jqContent = (content ? jQuery(content) : null);
        var started = params.Started === true;
        var ended = !started;
        var start = function () { started = true; if (ended) { params.OnStart(function () { ended = false; }); } }
        var end = function () {
            started = false;
            setTimeout(function () { if (!started) { params.OnEnd(function () { ended = true; }); } }, isNaN(params.Delay) ? 500 : params.Delay);
        }
        if (jqTarget) jqTarget.mouseover(start);
        if (jqTarget) jqTarget.mouseout(end);
        if (jqContent) jqContent.mouseover(start);
        if (jqContent) jqContent.mouseout(end);
        return { Start: start, End: end };
    },

    total_height: function (element) {
        if (typeof (element) != "object") element = document.getElementById(element);
        return jQuery(element)[0].scrollHeight + parseInt(jQuery(element).css('padding-top'), 10) + parseInt(jQuery(element).css('padding-bottom'), 10) +
            parseInt(jQuery(element).css('border-top-width'), 10) + parseInt(jQuery(element).css('border-bottom-width'), 10);
    },

    scrolltop: function (element, value) {
        var isTopElem = element == window || element == document || element == document.body;
        var obj = jQuery(isTopElem ? 'html, body' : element);

        if (GlobalUtilities.get_type(value) == "number") obj.animate({ scrollTop: isNaN(value) ? 0 : value }, 'slow');
        else return obj.scrollTop();
    },

    scroll: function (element, params) {
        if (typeof (element) != "object") element = document.getElementById(element);
        params = params || {};

        var divTotalHeight = GlobalUtilities.total_height(element);

        jQuery(element == window || element == document || element == document.body ? 'html, body' : element).animate({
            scrollTop: params.Value ? (params.Value < 0 ? "-=" : "+=") + Math.abs(params.Value) :
                (params.Top ? jQuery(element).offset().top : divTotalHeight)
        }, params.Animate === false ? 0 : 'slow');
    },

    onscrollend: function (element, params, done) {
        if (typeof (element) != "object") element = document.getElementById(element);
        params = params || {};
        if (GlobalUtilities.get_type(done) != "function") return;

        var _offset = +(params.Offset ? params.Offset : 0);
        if (isNaN(_offset) || _offset < 0) _offset = 0;

        if (element === document || element === window || element === document.body)
            return jQuery(window).scroll(function () { if (jQuery(window).scrollTop() + jQuery(window).height() >= jQuery(document).height() - _offset) done(); });

        jQuery(element).bind('scroll', function () {
            var scrollTop = jQuery(this).scrollTop();
            var scrollPosition = scrollTop + jQuery(this).outerHeight();
            var divTotalHeight = GlobalUtilities.total_height(element);

            if ((params.Top && scrollTop >= 0 && scrollTop <= _offset) || (!params.Top && scrollPosition >= (divTotalHeight - _offset))) done();
        });
    },

    scroll_into_view: (function(){
		var unitSize = null;
		
		return function (_elem, params) {
			params = params || {};
			unitSize = unitSize || jQuery("body").css("font-size").replace(/(^\d+)(.+$)/i,'$1');
			if (typeof (_elem) != "object") _elem = document.getElementById(_elem);
			jQuery('html, body').animate({ scrollTop: jQuery(_elem).offset().top /* - ((params.Offset || 3) * unitSize) */ }, 'slow', params.Done);
		}
	})(), 

    append_scrollbar: function (divObj, params) {
        if (typeof (divObj) != "object" && !(divObj = document.getElementById(divObj))) return;
        params = params || {};
        
        var elems = GlobalUtilities.create_nested_elements([
            {
                Type: "div", Class: "nano has-scrollbar", Name: "main",
                Childs: [
                    {
                        Type: "div", Class: "overthrow nano-content", Style: "overflow-y:hidden;", Name: "container",
                        Childs: [
                            {
                                Type: "div", Name: "__",
                                Childs: [
                                    { Type: "div", Name: "content" },
                                    { Type: "div", Style: "clear:both;" }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);

        jQuery(elems["main"]).on("mousewheel", function (event) {
            event.stopPropagation();
            GlobalUtilities.scroll(elems["container"], { Value: -1 * event.deltaY * event.deltaFactor, Animate: false });
            return false;
        });

        while (divObj.firstChild) elems["content"].appendChild(divObj.firstChild);

        elems["__"].style.paddingTop = window.getComputedStyle(divObj, null).getPropertyValue('padding-top');
        elems["__"].style.paddingRight = window.getComputedStyle(divObj, null).getPropertyValue('padding-right');
        elems["__"].style.paddingBottom = window.getComputedStyle(divObj, null).getPropertyValue('padding-bottom');
        elems["__"].style.paddingLeft = window.getComputedStyle(divObj, null).getPropertyValue('padding-left');
        divObj.style.padding = "0px";

        divObj.appendChild(elems["main"]);
        
        var maxHeight = parseInt(divObj.style.maxHeight || "0");
        var containerHeight = parseInt(divObj.style.height || divObj.style.maxHeight || "0");
        
        var get_height = params.GetHeight || function () { return parseInt(jQuery(elems["__"])["0"].scrollHeight || "0"); }

        var height = get_height();

        setInterval(function () {
            var newHeight = get_height();
            
            if (height == newHeight || !GlobalUtilities.is_visible(elems["__"])) return;
            height = newHeight;
            
            var computedNewHeight = containerHeight > height ? height : containerHeight;
            computedNewHeight = maxHeight == 0 ? computedNewHeight : Math.min(computedNewHeight, maxHeight);
            jQuery(divObj).animate({ height: computedNewHeight }, null, function () { jQuery(elems["main"]).nanoScroller(); });
        }, 1000);

        jQuery(elems["main"]).nanoScroller();

        if (params.Done) params.Done({ Scrollee: elems["container"] });

        return elems["content"];
    },

    sidebox: function (container, params) {
        params = params || {};

        var arr = [];

        if (params.Title) arr.push({
            Type: "div", Class: "Float SoftBorder SoftBackgroundColor BorderRadius3",
            Style: "color: gray; font-family: AMitra; height: 20px; margin: 4px 10px -12px 0px; padding: 1px 5px 3px 5px;",
            Childs: [{ Type: "text", TextValue: params.Title }]
        });

        if (params.Button) arr.push({
            Type: "div", Name: "moreButton", Class: "RevFloat SoftBorder",
            Style: "margin-" + RV_RevFloat + ":10px; background-color:white; cursor:pointer;" +
                "margin-bottom:-12px; width: 26px; height:26px; font-weight: bold;" +
                "color: #808080; text-align: center; padding: 1px;" + GlobalUtilities.border_radius(14)
        });

        if (arr.length) arr.push({ Type: "div", Style: "clear:both;" });

        arr.push({
            Type: "div", Class: "NormalPadding SoftBorder BorderRadius3", Style: "padding-top:14px;",
            Childs: [{ Type: "div", Name: "content" }]
        });

        var elems = GlobalUtilities.create_nested_elements(arr, container);

        return { Content: elems["content"], Button: elems["moreButton"] }
    },

    open_window: function (params) {
        params = params || {};

        var url = params.URL || "";
        var requestParams = params.RequestParams || {};
        var method = params.Method || "post";

        var _target = GlobalUtilities.generate_new_guid();

        var form = GlobalUtilities.create_nested_elements([
            { Type: "form", Name: "form",
                Attributes: [{ Name: "method", Value: method }, { Name: "action", Value: url }, { Name: "target", Value: _target}]
            }
        ], document.body)["form"];

        var _add_param = function (name, value) {
            if ((name || "") == "" || value == undefined) return;

            GlobalUtilities.create_nested_elements([
                { Type: "input",
                    Attributes: [{ Name: "type", Value: "hidden" }, { Name: "name", Value: name }, { Name: "value", Value: value}]
                }
            ], form);
        }

        for (var p in requestParams) _add_param(p, requestParams[p]);

        if ((window.RVGlobal || {}).AccessToken)
            _add_param(GlobalUtilities.AccessTokenParameterName, window.RVGlobal.AccessToken);

        window.open("", _target);

        form.submit();
    },

    toggle: function (elem) {
        if (typeof (elem) != "object") elem = document.getElementById(elem);
        elem.style.display = elem.style.display == "none" ? "block" : "none";
    },

    confirm: function (message, callback) {
        var result = confirm(message);
        if (callback) callback(result);
    },

    dialog: null, //It will be created using jAlerts after loading the page

    login_dialog: (function () {
        var _div = null;
        var _obj = null;
        var showedDiv = null;

        return function () {
            if (_div) {
                if (GlobalUtilities.is_element_in_document(_div)) return;
                if ((_obj || {}).clear) _obj.clear();
                showedDiv = GlobalUtilities.show(_div);
                return;
            }

            _div = GlobalUtilities.create_nested_elements([{ Type: "div", Name: "_div"}])["_div"];

            GlobalUtilities.loading(_div);
            showedDiv = GlobalUtilities.show(_div);

            GlobalUtilities.load_files(["USR/LoginControl.js"], {
                OnLoad: function () {
                    _obj = new LoginControl(_div, { Title: RVDic.Checks.PleaseLogin, OnLogin: function () { showedDiv.Close(); } });
                }
            });
        }
    })(),

    show: function (_div, params) {
        params = params || {};

        var bodyScroll = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        var elems = GlobalUtilities.create_nested_elements([
            {
                Type: "div", Name: "container",
                Style: "direction:ltr; position:fixed; top:0; bottom:0; left:0; right:0; margin:auto; width:100%;" +
                    "overflow:auto;" + (params.IgnoreZIndex ? "" : " z-index: " + GlobalUtilities.zindex.dialog() + ";") +
                    (params.NoBackground === true ? "" : "background: rgba(0, 0, 0, 0.5);"),
                Childs: [
                    {
                        Type: "div", Name: "exit",
                        Style: "position:fixed; cursor:pointer; left:1vw; right:1vw; top:1vw;" +
                            "font-weight:bolder; color:white;" + (params.NoBackground === true ? "display:none;" : ""),
                        Properties: [
                            { Name: "onmouseover", Value: function () { this.style.color = "red"; } },
                            { Name: "onmouseout", Value: function () { this.style.color = "white"; } },
                            { Name: "onclick", Value: function () { hide(); } }
                        ],
                        Childs: [{ Type: "text", TextValue: "X" }]
                    },
                    {
                        Type: "div", Name: "content",
                        Style: "margin-top:5vw; margin-bottom:5vw;" + (params.Style ? params.Style : "")
                    }
                ]
            }
        ], document.body);

        if (_div) {
            if (typeof (_div) != "object") _div = document.getElementById(_div);
            _div.style.display = "none";
            elems["content"].appendChild(_div);

            jQuery(_div).fadeIn(500);

            jQuery(elems["container"]).bind('click', function (event) {
                if (!jQuery(event.target).closest(_div).length && GlobalUtilities.is_visible(event.target)) hide();
            });
        }

        var _dispose = function (tools) {
            elems["container"].parentNode.removeChild(elems["container"]);
            document.body.style.overflow = bodyScroll;
            tools.go();
            if (params.OnClose) params.OnClose();
        }

        var hide = function (tools) {
            tools = GlobalUtilities.extend({ wait: function () { }, go: function () { } }, tools || {});

            if (!GlobalUtilities.is_element_in_document(elems["container"])) return;

            tools.wait();

            if (_div) jQuery(_div).fadeOut(500, function () { _dispose(tools); });
            else _dispose(tools);
        }

        GlobalUtilities.add_to_escape_queue(elems["container"], function (tools) { hide(tools); });
        
        return { Close: function () { hide(); } }
    },

    find_path: function (value, data) {
        var result = null;

        if (data == value) return [data];
        else if (GlobalUtilities.get_type(data) == "array") {
            for (var i = 0, lnt = data.length; i < lnt; ++i) if (result = find(value, data[i])) { result.push(i); return result; }
        }
        else if (GlobalUtilities.get_type(data) == "json") {
            for (var i in data) if (result = find(value, data[i])) { result.push(i); return result; }
        }
    },

    get_type: (function () {
        var f = (function () { }).constructor;
        var j = ({}).constructor;
        var a = ([]).constructor;
        var s = ("gesi").constructor;
        var n = (2).constructor;
        var b = (true).constructor;
        var t = (new Date()).constructor;

        return function (value) {
            if (value === null) return "null";
            else if (value === undefined) return "undefined";

            switch (value.constructor) {
                case f:
                    return "function";
                case j:
                    return "json";
                case a:
                    return "array";
                case s:
                    return "string";
                case n:
                    return "number";
                case b:
                    return "boolean";
                case t:
                    return "datetime";
                default:
                    return String(typeof (value));
            }
        }
    })(),

    extend: function (jsonValue) {
        var hasLevel = arguments.length > 0 && GlobalUtilities.get_type(arguments[arguments.length - 1]) == "number";
        var level = hasLevel ? arguments[arguments.length - 1] : 3;

        var args = arguments.length == (hasLevel ? 2 : 1) && GlobalUtilities.get_type(jsonValue) == "array" ? jsonValue : arguments;

        var first = args.length > 0 ? args[0] : null;
        var second = args.length > 1 ? args[1] : null;

        if (GlobalUtilities.get_type(first) != "json" || GlobalUtilities.get_type(second) != "json") return first;

        for (var o in second) {
            var type = GlobalUtilities.get_type(second[o]);
            if (type == "undefined") continue;

            if (GlobalUtilities.get_type(first[o]) == "json" && GlobalUtilities.get_type(second[o]) == "json" && level > 0)
                first[o] = GlobalUtilities.extend((first[o] || {}), second[o], level - 1);
            else
                first[o] = second[o];
        }

        var newArgs = [first];
        for (var i = 2, lnt = args.length; i < lnt; ++i)
            newArgs.push(args[i]);

        return GlobalUtilities.extend(newArgs, level);
    },

    secure_string: function (str) {
        if (!str) return "";
        else str = String(str);

        var _dic = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#x27;" /* "&#039;" */ /*, "/": "&#x2F;" */ }; //the last one is incompatible with @ tags because of base64

        for (var k in _dic) str = str.replace(k, _dic[k]);

        return str;
    },

    verify_string: function (str) {
        return str == null ? str : String(str).replace(/ي/g, "ی").replace(/ك/g, "ک");
    },

    escape4regexp: function (str) { return String(str).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"); },

    is_url: function (str) { return /((([hH][tT][tT][pP][sS]?)|([fF][tT][pP])):\/\/[^\s<>]+)/g.test(str); },

    is_base64: function (str) {
        return (new RegExp("^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$", "g")).test(str);
    },

    trim: function (str) {
        str = str ? str.replace(/^\s+/, '') : "";
        for (var i = str.length - 1; i >= 0; i--) {
            if (/\S/.test(str.charAt(i))) {
                str = str.substring(0, i + 1);
                break;
            }
        }
        return str;
    },

    trim2pix: (function () {
        var _getSpan = function () {
            return GlobalUtilities.create_nested_elements([{ Type: "span", Style: "visibility:hidden;", Name: "spn"}], document.body)["spn"];
        }

        String.prototype.visualLength = function (style) {
            var _span = _getSpan();
            _span.setAttribute("style", "visibility:hidden; " + (style ? style : ""));
            _span.innerHTML = this;
            var retVal = _span.offsetWidth;
            _span.parentNode.removeChild(_span);
            return retVal;
        }

        String.prototype.trim2pix = function (length, params) {
            params = params || {};
            var postfix = params.Postfix || "";
            var tmp = this;
            var trimmed = this;

            if (tmp.visualLength(params.Style) <= length) return tmp;

            var blockSize = (tmp.length / 2).toFixed(0), pos = (tmp.length / 2).toFixed(0) - 1;

            while (true) {
                trimmed = tmp.substring(0, pos + 1) + postfix;
                var newVLength = trimmed.visualLength(params.Style);
                
                if (newVLength == length || blockSize <= 1) return trimmed;

                blockSize = Number((blockSize / 2).toFixed(0));
                pos += newVLength < length ? blockSize : -1 * blockSize;
            }

            return trimmed;
        }

        return function (str, length, params) {
            return String(str).trim2pix(length, params)
        }
    })(),

    remove_empty_tags: function (container) {
        jQuery(container).children('p,div,span,pre').each(function () {
            var jQuerythis = jQuery(this);
            if (jQuerythis.html().replace(/\s|&nbsp;/g, '').length == 0) jQuery(this).remove();
        });

        jQuery(container).children('br').each(function () {
            var br = jQuery(this).get(0);
            if (!br.nextSibling || !br.previousSibling || ((br.nextSibling || {}).tagName || " ").toLowerCase() == "br" ||
                ((br.previousSibling || {}).tagName || " ").toLowerCase() == "br") jQuery(br).remove();
        });
    },

    inner_text: function (element, params) {
        params = params || {};

        var text = "";

        if (((element || {}).nodeName || " ").toLowerCase() == "#text")
            text = element.data;
        else {
            var firstChild = (element || {}).firstChild;

            while (firstChild) {
                text += " " + GlobalUtilities.inner_text(firstChild) + (params.DontTrim ? " " : "");
                firstChild = firstChild.nextSibling;
            }
        }
        
        return params.DontTrim ? text : GlobalUtilities.trim(text);
    },

    show_text_changes: (function () {
        var loaded = false;

        var _do = function (container, newText, oldText) {
            container.innerHTML = "";
            
            var d = document.createElement("div");

            d.innerHTML = newText || " ";
            newText = GlobalUtilities.inner_text(d, { DontTrim: true });
            
            d.innerHTML = oldText || " ";
            oldText = GlobalUtilities.inner_text(d, { DontTrim: true });
            
            var diff = diffString(oldText, newText);

            GlobalUtilities.append_markup_text(container, diff, {
                RichText: true, IgnoreBreaks: true,
                Done: function () {
                    var els = container.getElementsByTagName("del");
                    for (var i = 0, lnt = els.length; i < lnt; ++i) els[i].style.color = "red";

                    els = container.getElementsByTagName("ins");
                    for (var i = 0, lnt = els.length; i < lnt; ++i) els[i].style.color = "green";
                }
            });
        }

        return function (container, newText, oldText) {
            if (loaded) return _do(container, newText, oldText);

            GlobalUtilities.loading(container);

            GlobalUtilities.load_files(["Lib/jsDiff.js"], {
                OnLoad: function () { _do(container, newText, oldText); loaded = true; }
            });
        }
    })(),

    textdirection: (function () {
        //Arabic - Range: 0600–06FF, Arabic Supplement - Range: 0750–077F, Arabic Presentation Forms-A - Range: FB50–FDFF, Arabic Presentation Forms-B - Range: FE70–FEFF
        var rtlChars = '\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF';

        //ASCII Punctuation - Range: 0000-0020, General Punctuation - Range: 2000-200D
        var controlChars = '\u0000-\u0020\u2000-\u200D*"\'.0-9()$%^&@!#,=?/\\+-:<>|;';

        var reRTL = new RegExp('^[' + controlChars + ']*[' + rtlChars + ']');
        var reControl = new RegExp('^[' + controlChars + ']*$');

        return function (input) { return input.match(reRTL) ? 'rtl' : (input.match(reControl) ? false : 'ltr'); }
    })(),

    is_empty_text: function (content) {
        var _div = document.createElement("div");
        _div.innerHTML = content;

        var text = _div.innerText || _div.textContent;
        return GlobalUtilities.trim(text) == "" ? true : false;
    },

    get_text_begining: function (text, length, postfix) {
        postfix = String(postfix || "");
        var _testDiv = document.createElement("div");
        _testDiv.innerHTML = text;
        var _desc = String(_testDiv.innerText || _testDiv.textContent);
        if (_desc.length > length) _desc = _desc.substr(0, length - postfix.length) + postfix;
        return _desc;
    },

    is_valid_email: function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    append_autosuggest: function (_div, params) {
        if (typeof (_div) != "object") _div = document.getElementById(_div);
        if (_div == null) return;

        params = params || {};

        var elems = GlobalUtilities.create_nested_elements([
            { Type: "input", Class: params.InputClass || "TextInput" || "FormInputs", InnerTitle: params.InnerTitle,
                Style: params.InputStyle || "width:300px; margin-bottom:10px; margin-" + RV_Float + ":25px;",
                Attributes: [{ Name: "type", Value: "text"}], Name: "inputId"
            }
        ], _div);

        var inputElem = elems["inputId"];

        var objAutoSuggest = new autosuggest(inputElem, params.ArrayDataSource || "", params.AjaxDataSource || "", params.OnSelect);
        initialize_autosuggest(objAutoSuggest, { ResponseParser: params.ResponseParser, OnEnter: params.OnEnter });

        objAutoSuggest.InputElement = inputElem;
        if (params.InnerTitle) {
            GlobalUtilities.set_inner_title(inputElem, params.InnerTitle);
            objAutoSuggest.InnerTitle = params.InnerTitle;
        }
        return objAutoSuggest;
    },

    _load_editor: (function () {
        var loading = false, loaded = false;

        window.CKE_VERSION = "4.5.6";

        return function (done) {
            if (loaded) return done();
            else if (loading) {
                var x = setInterval(function () { if (!loaded) return; clearInterval(x); done(); }, 100);
                return;
            }

            loading = true;

            var editorUrl = window.location.protocol + "//" + window.location.host + "/" +
                GlobalUtilities.ScriptsFolder + "/CK_Editor_" + window.CKE_VERSION + "/ckeditor.js";
            
            GlobalUtilities.load_files([{ Childs: [editorUrl], Check: function () { return true; } }], {
                OnLoad: function () {
                    var y = setInterval(function () {
                        if (String((window.CKEDITOR || {}).status || " ").toLowerCase() != "loaded") return;
                        clearInterval(y);
                        loaded = !(loading = false);
                        done();
                        
                        //if (!(window.CKEDITOR || {}).on) return;
                        //clearInterval(y);
                        //CKEDITOR.on("loaded", function (evt) { loaded = !(loading = false); done(); });
                    }, 50);
                }
            });
        }
    })(),

    _append_rich_text_editor: function (_div, params, done) {
        params = params || {};

        var rvButtons = [], editor;
        
        if (params.EnableTagging === true) rvButtons.push('RVTag');
        if (params.EnableUploader === true) rvButtons.push('RVUploader');
        if (params.EnableCodeHighlighter === true) rvButtons.push('RVCodeHighlighter');
        
        var toolbar = [
            ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
            ['Find', 'Replace', '-', 'SelectAll'], ['Link', 'Unlink'], ['Bold', 'Italic', 'Underline', 'Strike'],
            ['TextColor', 'BGColor', '-', 'SpecialChar', '-', 'Maximize'], rvButtons,
            ['NumberedList', 'BulletedList', 'Outdent', 'Indent', '-', 'Blockquote', '-',
                'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'
            ]
        ];
        
        if (window.RV_RTL) {
            for (var i = 0, lnt = toolbar.length; i < lnt; ++i) toolbar[i] = toolbar[i].reverse();
        }

        //Config
        CKEDITOR.config.plugins = 'bbcode,dialogui,dialog,dialogadvtab,basicstyles,' +
                'bidi,blockquote,clipboard,button,panelbutton,panel,floatpanel,colorbutton,colordialog,' +
                'templates,menu,contextmenu,div,resize,toolbar,elementspath,enterkey,entities,popup,' +
                'find,fakeobjects,flash,floatingspace,listblock,richcombo,font,forms,format,' +
                'horizontalrule,htmlwriter,iframe,wysiwygarea,indent,indentblock,indentlist,smiley,justify,' +
                'menubutton,language,link,list,liststyle,magicline,maximize,newpage,pagebreak,pastetext,pastefromword,' +
                'preview,removeformat,selectall,showblocks,showborders,specialchar,scayt,' +
                'tab,table,tabletools,undo,wsc,autogrow';
        CKEDITOR.config.allowedContent = { a: { attributes: 'href' }, img: { attributes: 'src', styles: 'width,height' } };
        CKEDITOR.config.skin = 'moono';
        //end of Config
        
        var _get_editor = function (data) {
            return CKEDITOR.appendTo(_div, {
                on: { instanceReady: function (evt) { _onInstanceReady(); if (data) editor.set_data(data); done(editor); } },
                language: 'fa', extraPlugins: 'RVCodeHighlighter,colorbutton,colordialog,RVTag,RVUploader,autogrow',
                toolbar: toolbar, startupFocus: true
            }, "");
        }
        
        var editor = _get_editor();
        
        var _onInstanceReady = function () {
            editor.rebuild = function (data) { editor = _get_editor(data); }

            if (params.EnableTagging === true) {
                GlobalUtilities.load_files(["CK_Editor_" + window.CKE_VERSION + "/RaaivanPlugins/CKE_RVTag.js"], {
                    OnLoad: function () { new CKE_RVTag(_div, { Editor: editor }); }
                });
            }

            if (!(params.EnableUploader === false)) {
                GlobalUtilities.load_files(["CK_Editor_" + window.CKE_VERSION + "/RaaivanPlugins/CKE_RVUploader.js"], {
                    OnLoad: function () {
                        new CKE_RVUploader(_div, {
                            Editor: editor,
                            Removable: !!(params.Upload || {}).Removable,
                            OwnerID: (params.Upload || {}).OwnerID,
                            OwnerType: (params.Upload || {}).OwnerType,
                            AttachedFiles: (params.Upload || {}).AttachedFiles || [],
                            OnUpload: (params.Upload || {}).OnUpload,
                            OnRemove: (params.Upload || {}).OnRemove
                        });
                    }
                });
            }

            if (!(params.EnableCodeHighlighter === false)) {
                GlobalUtilities.load_files(["CK_Editor_" + window.CKE_VERSION + "/RaaivanPlugins/CKE_RVCodeHighlighter.js"], {
                    OnLoad: function () { new CKE_RVCodeHighlighter(_div, { Editor: editor }); }
                });
            }

            editor.insert_data = function (_htmlText) {
                editor.insertHtml(_htmlText);
            }

            editor._setData = editor.set_data = function (_htmlText) {
                editor.editable().setHtml(_htmlText);
                //editor.setData('', function () { editor.insertHtml(_htmlText); });
                //setTimeout(function () { editor.insertHtml(_htmlText); }, 1000);
            }

            editor._getData = editor.get_data = function () {
                var _div = GlobalUtilities.create_nested_elements([{ Type: "div", Name: "_div" }])["_div"];
                _div.innerHTML = editor.document.getBody().getHtml();

                jQuery(_div).contents().filter(function () {
                    //Hazf tag haye commenti ke editor ezafe karde ast
                    return this.nodeType == 8;
                }).remove();

                jQuery(_div).find("[data-rv_tagid][data-rv_tagtype][data-rv_tagvalue]").each(function (index) {
                    var _text = jQuery(this).text(), _info = null, _type = jQuery(this).attr("data-rv_tagtype").split("_")[0] || "", count = 0;

                    if (jQuery(this).attr("data-rv_taginfo")) {
                        _info = JSON.parse(Base64.decode(jQuery(this).attr("data-rv_taginfo")));
                        var _ext = (_info.Extension || "").toString().toLowerCase();

                        if (_type == "File" && (_ext == 'jpg' || _ext == 'jpeg' || _ext == 'png' || _ext == 'gif')) {
                            _info.W = jQuery(this).width() == 0 ? 100 : jQuery(this).width();
                            _info.H = jQuery(this).height() == 0 ? 100 : jQuery(this).height();
                        }
                        else if (_type == "Link")
                            _info.href = Base64.encode(jQuery(this).attr("href"));

                        for (var key in _info) if (_info[key] != null || _info[key] != "") count++;
                    }

                    var _tag_text = "@[[" + jQuery(this).attr("data-rv_tagid") + ":" + _type + ":" +
                        (_text == "" ? jQuery(this).attr("data-rv_tagvalue") : Base64.encode(_text)) +
                        (count == 0 ? "" : ":" + Base64.encode(JSON.stringify(_info))) + "]]";

                    jQuery(this).before(_tag_text);
                    jQuery(this).remove();
                });

                var re = new RegExp("((([hH][tT][tT][pP][sS]?)|([fF][tT][pP])):\/\/[^\s<>]+)");
                jQuery(_div).find("a[data-cke-saved-href]").each(
                    function (index) {
                        if (re.test(jQuery(this).attr("href"))) {
                            var _tag_text = "@[[Link:Link:" + Base64.encode(jQuery(this).text()) + ":" +
                                Base64.encode("{\"href\":\"" + Base64.encode(jQuery(this).attr("href")) + "\"}") + "]]";

                            jQuery(this).before(_tag_text);
                            jQuery(this).remove();
                        }
                    }
                );

                jQuery(_div).find('pre code').each(
                    function () {
                        var _codeText = GlobalUtilities.trim(jQuery(this).text());
                        if (_codeText == "") { jQuery(this).remove(); }
                    }
                );

                return _div.innerHTML;
            } //end of 'editor._getData = editor.get_data = function () {'
        }
    },

    append_rich_text_editor: function (_div, params, done) {
        if (typeof (_div) != "object") _div = document.getElementById(_div);

        GlobalUtilities.loading(_div);
        
        GlobalUtilities._load_editor(function () {
            _div.innerHTML = "";
            GlobalUtilities._append_rich_text_editor(_div, params, done);
        });
    },

    append_checkbox: function (element, params) {
        params = params || {};

        params.Checked = params.checked = params.checked === true || params.Checked === true;

        var img = GlobalUtilities.create_nested_elements([{ Type: "img", Name: "image",
            Style: params.Style || ("width:" + (params.Width || 20) + "px; height:" + (params.Height || 20) + "px; cursor:pointer;"),
            Attributes: [{ Name: "src", Value: GlobalUtilities.icon("Checkbox-" + (params.Checked === true ? "C" : "Unc") + "hecked.png")}]
        }])["image"];

        if (element) element.appendChild(img);
        img.Checked = img.checked = params.Checked;

        var onClick = params.OnClick || function (e, d) { };
        var processing = false;

        var succeed = function (result) {
            if (processing === false) return;
            processing = false;
            if (result === false) return;
            img.Checked = img.checked = !(img.Checked === true);
            img.setAttribute("src", GlobalUtilities.icon("Checkbox-" + (img.Checked === true ? "C" : "Unc") + "hecked.png"));
        }

        img.check = img.Check = function () {
            if (processing) return;

            img.Checked = img.checked = true;
            img.setAttribute("src", GlobalUtilities.icon("Checkbox-Checked.png"));
        }

        img.uncheck = img.Uncheck = function () {
            if (processing) return;

            img.Checked = img.checked = false;
            img.setAttribute("src", GlobalUtilities.icon("Checkbox-Unchecked.png"));
        }

        img.onclick = function () {
            if (processing) return;
            processing = true;

            var prevented = false;

            if (onClick.call(img, { preventDefault: function () { prevented = true } }, succeed) === false) succeed(false);
            else if (processing === true && !prevented) succeed();
        }

        return img;
    },

    append_number_input: function (element, params) {
        params = params || {};

        var elems = GlobalUtilities.create_nested_elements([
            { Type: "input", Class: "TextInput", Name: "_input", Style: params.Style || "", InnerTitle: params.InnerTitle,
                Attributes: [{ Name: "type", Value: "text"}],
                Properties: [
                    { Name: "onkeypress",
                        Value: function (evt) {
                            var theEvent = evt || window.event;
                            var key = theEvent.keyCode || theEvent.which;
                            if (key == 8 || key == 27 || key == 9) return;
                            key = String.fromCharCode(key);
                            var regex = params.Float ? /[0-9]|\./ : /[0-9]/;
                            var val = GlobalUtilities.trim(elems["_input"].value);
                            if (!regex.test(key) || (key == "." && (val.indexOf(".") >= 0 || val == "")) ||
                                (params.MaxLength > 0 && val.length >= params.MaxLength)) {
                                theEvent.returnValue = false;
                                if (theEvent.preventDefault) theEvent.preventDefault();
                            }
                        }
                    }
                ]
            }
        ], element);

        return elems["_input"];
    },

    necessary_input: (function () {
        var _check = function (item) {
            var obj = item.Input || item;

            if (obj.value.length == 0 || obj.value == (item.InnerTitle || "")) obj.style.backgroundColor = "rgba(255, 231, 231, 1)";
            else obj.style.backgroundColor = "white";
        }

        var func = function (item) {
            jQuery(item.Input || item).focus(function () { _check(item); });
            jQuery(item.Input || item).blur(function () { _check(item); });

            _check(item);
        }

        return function (items) {
            items = GlobalUtilities.get_type(arguments) == "array" ? arguments : (GlobalUtilities.get_type(items) != "array" ? [items] : items);
            for (var i = 0, lnt = (items || []).length; i < lnt; i++) func(items[i]);
        }
    })(),

    move_element: function (element, moveDown, predicate) {
        moveDown = moveDown === true ? true : false;

        var parentNode = element.parentNode;
        var nextItem = moveDown === true ? element.nextSibling : element.previousSibling;
        if (nextItem == null) return false;

        while (nextItem.parentNode == parentNode) {
            if (predicate === undefined || predicate(nextItem)) {
                if (moveDown === true) {
                    nextItem.parentNode.replaceChild(element, nextItem);
                    element.parentNode.insertBefore(nextItem, element);
                }
                else {
                    element.parentNode.replaceChild(nextItem, element);
                    nextItem.parentNode.insertBefore(element, nextItem);
                }
                return true;
            }

            nextItem = moveDown === true ? nextItem.nextSibling : nextItem.previousSibling;
        }

        return false;
    },

    get_next_element: function (element, moveDown, predicate) {
        moveDown = moveDown === true;

        var nextItem = moveDown === true ? element.nextSibling : element.previousSibling;
        if (nextItem == null) return null;

        while (nextItem.parentNode == element.parentNode) {
            if (predicate === undefined || predicate(nextItem)) return nextItem;
            nextItem = moveDown === true ? nextItem.nextSibling : nextItem.previousSibling;
        }

        return null;
    },

    create_nested_elements: function (elements, parent) {
        var retJSON = arguments.length > 2 ? arguments[2] || {} : {};

        for (var i = 0, lnt = elements.length; i < lnt; ++i) {
            var _elem = elements[i];
            if (!_elem.Type || _elem.Type == "") return retJSON;
            if (parent && typeof (parent) != "object") parent = document.getElementById(parent);

            var newElement = null;
            var _elemType = String(_elem.Type).toLowerCase();

            switch (_elemType) {
                case "text":
                    var val = _elem.TextValue || "";
                    newElement = document.createTextNode(val);
                    break;
                case "checkbox":
                    newElement = GlobalUtilities.append_checkbox(document.createElement("div"), _elem.Params);
                    break;
                case "number":
                    newElement = GlobalUtilities.append_number_input(document.createElement("div"), _elem.Params);
                    break;
                case "middle":
                case "bottom":
                    _elem = {
                        Type: "div", Style: "display:table; width:100%; height:100%;",
                        Childs: [
                            {
                                Type: "div",
                                Style: "display:table-cell; vertical-align:" + _elemType + ";",
                                Childs: [GlobalUtilities.extend(_elem, { Type: "div" })]
                            }
                        ]
                    };

                    newElement = document.createElement(_elem.Type);
                    break;
                default:
                    newElement = document.createElement(_elem.Type);
                    break;
            }

            if (_elem.ID) newElement.id = _elem.ID;
            if (_elem.Class) newElement.setAttribute("class", _elem.Class);
            if (_elem.Style) newElement.setAttribute("style", _elem.Style);

            if (_elem.Link) {
                if (!(_elem.Params || {}).IgnoreMouseEvents) {
                    newElement.style.color = "rgb(80,80,80)";
                    newElement.style.cursor = "pointer";
                    newElement.onmouseover = function () { this.style.color = "blue"; }
                    newElement.onmouseout = function () { this.style.color = "rgb(80,80,80)"; }
                }
                newElement.__RVLink = _elem.Link;
                newElement.onclick = function (e) { GlobalUtilities.link_click(e, this.__RVLink, _elem.Params); }
            }

            if (_elem.Attributes) {
                var _attribs = _elem.Attributes;
                for (var j = 0, _len = _attribs.length; j < _len; ++j)
                    newElement.setAttribute(_attribs[j].Name, _attribs[j].Value);
            }

            //if (_elem.Type.toLowerCase() == "input") newElement.setAttribute("dir", "auto");

            if (_elem.Properties) {
                var _properties = _elem.Properties;
                for (var j = 0, _len = _properties.length; j < _len; ++j)
                    newElement[_properties[j].Name] = _properties[j].Value;
            }

            if (parent != null) parent.appendChild(newElement);

            var elemName = _elem.Name || _elem.ID;
            if (elemName) retJSON[elemName] = newElement;

            if (_elem.Tooltip) GlobalUtilities.append_tooltip(newElement, _elem.Tooltip, { Align: _elem.TooltipAlign });
            if (_elem.InnerTitle) GlobalUtilities.set_inner_title(newElement, _elem.InnerTitle);
            if (_elem.Childs) GlobalUtilities.create_nested_elements(_elem.Childs, newElement, retJSON);
        }

        return retJSON;
    },

    block: function (_elem, params) {
        params = params || {};

        if (typeof (_elem) != "object") _elem = document.getElementById(_elem);
        if (!_elem) return;

        try {
            var newParams = GlobalUtilities.extend({}, jQuery.blockUI.defaults, {
                title: '', css: { cursor: 'default' }, overlayCSS: { cursor: 'default', opacity: 0.6 }, message: ''
            });

            if (GlobalUtilities.get_type(params.Opacity) == "number") newParams.overlayCSS.opacity = params.Opacity;

            jQuery(_elem).block(newParams);
        }
        catch (e) { }
    },

    unblock: function (_elem) {
        if (typeof (_elem) != "object") _elem = document.getElementById(_elem);
        try { jQuery(_elem).unblock(); } catch (e) { }
    },

    set_onenter: function (input, onenter) {
        var _onkeydown = function (event) {
            event = event || window.event;
            if (event.keyCode == 13) onenter.call(input);
        }

        jQuery(input).keypress(_onkeydown);
    },

    set_onchange: function (input, callback, params) {
        var _do = (function () {
            var _timeout = null;

            return function (p) {
                if (_timeout) clearTimeout(_timeout);

                _timeout = setTimeout(function () {
                    _timeout = null;
                    callback();
                }, (p || {}).Timeout || 2000);
            }
        })();

        jQuery(input).on("keydown", function (e) {
            if (e.which == 13) return;
            _do({ Timeout: (params || {}).Timeout || 1000 });
        });
    },

    set_onchangeorenter: function (input, callback, params) {
        var _do = (function () {
            var _timeout = null;

            return function (p) {
                if (_timeout) clearTimeout(_timeout);

                _timeout = setTimeout(function () {
                    _timeout = null;
                    callback({ Enter: p.Enter });
                }, (p || {}).Timeout || 2000);
            }
        })();

        jQuery(input).on("keydown", function (e) {
            _do({ Timeout: e.which == 13 ? 1 : (params || {}).Timeout || 1000, Enter: e.which == 13 });
        });
    },

    set_inner_title: function (input, title) {
        title = title.replace(/\.\.\.+/ig, "");
        if ((input || {}).setAttribute) input.setAttribute("placeholder", title);
    },

    convert_numbers_to_persian: (function () {
        var persian = { 0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹' };

        var _do = function (text) {
            if (!text) return text;
            var list = text.match(/[0-9]/g);
            if ((list || []).length > 0) {
                for (var i = 0; i < list.length; i++) text = text.replace(list[i], persian[list[i]]);
            }
            return text;
        }

        var traverse = function (el) {
            if (el.nodeType == 3) el.data = _do(el.data);
            for (var i = 0; i < el.childNodes.length; i++) traverse(el.childNodes[i]);
        }

        return function (elem) {
            return !elem ? elem : (GlobalUtilities.get_type(elem) == "string" ? _do(elem) : traverse(elem));
        }
    })(),

    append_markup_text: function (_div, text, params) {
        try {
            params = params || {};
            
            var richText = new RegExp("<.*?>", "g").test(text || " ");

            AdvancedTextArea.replace_markups(text, {
                IgnoreBreaks: richText, IgnoreURLs: false, // params.RichText,
                Done: function (txt, p) {
                    if (!richText) {
                        var d = document.createElement("div");
                        d.innerHTML = txt;
                        var tt = d.innerText || d.textContent;
                        _div.style.direction = GlobalUtilities.textdirection(tt);
                    }

                    _div.innerHTML = txt;

                    if (window.RV_Lang == "fa") GlobalUtilities.convert_numbers_to_persian(_div);

                    if (params.Done) setTimeout(function () { params.Done(txt, p); }, 0);
                }
            });
        }
        catch (e) { setTimeout(function () { GlobalUtilities.append_markup_text(_div, text, params); }, 100); }
    },

    link_click: function (e, url, params) {
        if (e.ctrlKey || (params || {}).Open) window.open(url);
        else window.location.href = url;
    },

    goto_page: function (page, params) {
        params = params || {};

        var requestParams = "";

        var isFirst = true;
        for (var item in params) {
            requestParams += isFirst ? "?" : "&";
            isFirst = false;

            requestParams += item + "=" + params[item];
        }

        window.open(page + requestParams);
    },

    set_cookie: function (c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString()) + "; path=/";
        document.cookie = c_name + "=" + c_value;
    },

    get_cookie: function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
    },

    window: function (containerDiv, params, done) {
        GlobalUtilities.load_files([
            "WindowsManager/WindowsManager.js",
            { Root: "jQuery/", Childs: ["jquery-ui.css", "jquery-ui.js", "jquery.dialogextend.js"] }
        ], { LoadSequential: true,
            OnLoad: function () {
                var wm = new WindowsManager(containerDiv, params);
                if (done) done(wm);
            }
        });
    },

    uploader: function (containerDiv, params, done) {
        GlobalUtilities.load_files([
            { Root: "Dropzone/", Childs: ["dropzone.js", { Root: "css/", Ext: "css", Childs: ["basic", "dropzone"]}] },
            "AjaxUploader/AjaxUploader.js"
        ], {
            OnLoad: function () {
                var au = new AjaxUploader(containerDiv, params);
                if (done) done(au);
            }
        });
    },

    load_calendar: function (done) {
        var _lang = "calendar-" + ((window.RV_Lang || "") == "fa" ? "fa" : "en");

        GlobalUtilities.load_files([
            "Calendar.css",
            { Root: "JalaliJSCalendar-1.4/", Ext: "js",
                Childs: [{ Root: "skins/", Ext: "css", Childs: ["calendar-blue"] }, "jalali.js", "calendar", "calendar-setup", _lang]
            }
        ], { LoadSequential: true, OnLoad: done });
    },

    append_calendar: function (element, params, done) {
        params = params || {};

        GlobalUtilities.load_calendar(function () {
            if (params.OnLoad) params.OnLoad();

            var _width = params.Width || 120;

            var emptyLabel = params.Label || RVDic.Select;

            var elems = GlobalUtilities.create_nested_elements([
                { Type: "div", Style: "_background-color:rgb(222,237,245); background-color:white; padding:" +
                        (typeof (params.Padding) == "undefined" ? 4 : params.Padding) + "px; width:" + (_width + 40) + "px;" +
                        " border-radius:4px;border:1px solid #003366; height:" + (params.Height || 18) + "px;",
                    Childs: [
                        { Type: "div", Name: "viewArea",
                            Style: "cursor:pointer; width:" + _width + "px; " +
                                "text-align:center; padding-" + RV_Float + ":20px; " +
                                "background-image:url('" + GlobalUtilities.icon("Calendar.png") + "'); " +
                                "background-position:" + RV_Float + "; " +
                                "background-repeat:no-repeat; background-size:12px 15px;",
                            Childs: [{ Type: "text", TextValue: emptyLabel}]
                        }
                    ]
                },
                { Type: "input", Name: "hiddenArea", Attributes: [{ Name: "type", Value: "hidden" }, { Name: "name", Value: "date"}] }
            ], element);

            Calendar.setup({ inputField: elems["hiddenArea"], displayArea: elems["viewArea"],
                ifFormat: "%Y-%m-%d", dateType: (window.RV_Lang || "") == "fa" ? 'jalali' : 'gregorian',
                showOthers: true, ifDateType: 'gregorian', weekNumbers: false, onUpdate: params.OnSelect
            });

            done({ ViewArea: elems["viewArea"], Hidden: elems["hiddenArea"],
                Clear: function () {
                    elems["hiddenArea"].value = "";
                    elems["viewArea"].innerHTML = emptyLabel;
                },
                Get: function () {
                    var label = elems["viewArea"].innerText || elems["viewArea"].textContent;
                    return { Value: elems["hiddenArea"].value || "", Label: label == emptyLabel ? "" : label }
                },
                Set: function (params) {
                    if ((params || {}).Value) elems["hiddenArea"].value = params.Value;
                    if ((params || {}).Label) elems["viewArea"].innerHTML = params.Label;
                }
            });
        });
    },

    loading: function (element, params) {
        if (typeof (element) != "object") element = document.getElementById(element);
        if (!element) return;
        params = params || {};

        GlobalUtilities.create_nested_elements([
            { Type: "div",
                Style: (GlobalUtilities.get_type(params.Style) == "string" ? params.Style : "margin:8px auto 8px auto;"),
                Childs: [
                    { Type: "div", Style: "text-align:center;",
                        Childs: [{ Type: "img", Attributes: [{ Name: "src", Value: GlobalUtilities.icon("loading_progress_bar.gif")}]}]
                    }
                ]
            }
        ], element);
    },

    load_files: function (files, params) {
        files = files || [];
        for (var i = 0, lnt = files.length; i < lnt; ++i) files[i] = files[i].File || files[i] || "";
        if (files.length == 0) return;

        var _prefixRegExp = function () {
            return new RegExp("^((" + GlobalUtilities.escape4regexp(GlobalUtilities.js().toLowerCase()) + ")|(" +
                GlobalUtilities.escape4regexp("../") + "))", "g");
        }

        var checkFuncs = {};

        //clarify files
        var _newFiles = [];

        var _tree2array = function (obj, prefix, ext) {
            var root = (prefix ? prefix : "") + (obj || {}).Root, ext = (obj || {}).Ext || ext || "";

            if (root && !_prefixRegExp().test(root.toLowerCase())) root = GlobalUtilities.js(root);
            if (ext && ext.length > 0 && ext[0] == ".") ext = ext.substr(1);

            for (var i = 0, lnt = ((obj || {}).Childs || []).length; i < lnt; ++i) {
                if (obj.Childs[i].Root) _tree2array(obj.Childs[i], root, ext);
                else {
                    var _isUrl = GlobalUtilities.is_url(obj.Childs[i]);

                    obj.Childs[i] = obj.Childs[i] +
                        (_isUrl ? "" : ((new RegExp("(\.css)|(\.js)$", "g")).test(obj.Childs[i].toLowerCase()) ? "" : (ext ? "." + ext : "")));

                    _newFiles.push((_isUrl ? "" : root) + obj.Childs[i]);

                    if (obj.Check) checkFuncs[String((_isUrl ? "" : root) + obj.Childs[i]).toLowerCase()] = obj.Check;
                }
            }
        }

        for (var i = 0, lnt = files.length; i < lnt; ++i)
            GlobalUtilities.get_type(files[i]) == "json" ? _tree2array(files[i]) : _newFiles.push(files[i]);

        files = _newFiles;

        for (var i = 0, lnt = files.length; i < lnt; ++i) {
            var _fname = String(files[i]).toLowerCase();
            var isJs = _fname.substring(_fname.lastIndexOf(".") + 1, _fname.length) !== String("css");

            //if (!_prefixRegExp().test(_fname)) files[i] = isJs ? GlobalUtilities.js(files[i]) : GlobalUtilities.css(files[i]);

            if (files[i].Check) checkFuncs[_fname] = files[i].Check;

            if (!GlobalUtilities.is_url(_fname) && !_prefixRegExp().test(_fname))
                files[i] = isJs ? GlobalUtilities.js(files[i]) : GlobalUtilities.css(files[i]);
        }
        //end of clarify files

        params = params || {};
        params.__Interval = null;
        var loadSequential = params.LoadSequential === true;

        if (loadSequential && files.length > 1) {
            var _fls = [];
            for (var i = 1, lnt = files.length; i < lnt; ++i) _fls.push(files[i]);

            var _onload = function (newFiles, prms) { GlobalUtilities.load_files(newFiles, prms); }

            var _sp = {};
            for (var _item in params) _sp[_item] = params[_item];
            _sp.LoadSequential = false;
            _sp.OnLoad = function () { _onload(_fls, params) }
            return GlobalUtilities.load_files([files[0]], _sp);
        }

        var _execute = function () { if (params.OnLoad) params.OnLoad(params.LoadParams); }

        if (DynamicFileUtilities.files_exist(files, checkFuncs) === true) return _execute();

        if (params.DivToBlock) GlobalUtilities.block(params.DivToBlock);

        for (var j = 0, lnt = files.length; j < lnt; ++j) {
            var fileName = String(files[j].File || files[j] || "");
            var extension = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
            var isJs = extension.toLowerCase() !== String("css");

            isJs ? DynamicFileUtilities.load_js(fileName) : DynamicFileUtilities.load_css(fileName);
        }

        var _failCount = 0;
        var _intervalMiliseconds = 50;
        var _errorThreshold = 2000000 / _intervalMiliseconds;

        var check_files = function () {
            if (++_failCount > _errorThreshold) {
                var _failedItems = [];

                for (var i = 0; i < files.length; ++i)
                    if (!DynamicFileUtilities.files_exist([files[i]]), checkFuncs) _failedItems.push(files[i]);

                var errorText = "<div class='Direction TextAlign' style='margin-bottom:8px; text-align:center; font-weight:bold;'>" +
                    RVDic.MSG.LoadingFilesFailed + "</div>";

                for (var i = 0; i < _failedItems.length; ++i)
                    errorText += "<div>" + (_failedItems[i].File || _failedItems[i] || "") + "</div>";

                errorText = "<div style='direction:ltr; text-align:left;'>" + errorText + "</div>";

                //alert(errorText, { Timeout: 1000000 });

                return clearInterval(params.__Interval);
            }

            if (!DynamicFileUtilities.files_exist(files, checkFuncs)) return false;
            clearInterval(params.__Interval);
            var _to = +params.Timeout;
            if (isNaN(_to)) _to = 0;
            _to == 0 ? _execute() : setTimeout(_execute, _to);
            if (params.UnblockOnLoad === true) GlobalUtilities.unblock(params.DivToBlock);
        }

        params.__Interval = setInterval(check_files, _intervalMiliseconds);
    }
}


//////////////////////////////////////////////////
//////////--> end of GlobalUtilities <--//////////
//////////////////////////////////////////////////




////////////////////////////////////////////////
//////////--> DynamicFileUtilities <--//////////
////////////////////////////////////////////////

if (!window.DynamicFileUtilities) window.DynamicFileUtilities = {
    AddedFiles: {},

    _create_js_file_object: function (fileName, data) {
        var scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "text/javascript");

        if (data) scriptTag.innerHTML = data;
        else scriptTag.setAttribute("src", fileName);

        return scriptTag;
    },

    _create_css_file_object: function (fileName, data) {
        var linkTag = document.createElement("link");
        linkTag.setAttribute("rel", "stylesheet");
        linkTag.setAttribute("type", "text/css");
        linkTag.setAttribute("href", fileName + "?timeStamp=" + new Date().getTime());

        return linkTag;
    },

    load_js: function (fileName) {
        fileName = String(fileName).toLowerCase();
        if (DynamicFileUtilities.AddedFiles[fileName]) return;
        DynamicFileUtilities.AddedFiles[fileName] = { Exists: false };

        if (GlobalUtilities.is_url(fileName))
            document.getElementsByTagName("head")[0].appendChild(DynamicFileUtilities._create_js_file_object(fileName));
        else {
            return send_get_request(fileName + "?timeStamp=" + new Date().getTime(), function (responseText) {
                document.getElementsByTagName("head")[0].appendChild(DynamicFileUtilities._create_js_file_object(fileName, responseText));
                DynamicFileUtilities.AddedFiles[fileName] = { Exists: true };
            });
        }
    },

    load_css: function (fileName) {
        fileName = String(fileName).toLowerCase();
        if (DynamicFileUtilities.AddedFiles[fileName]) return;
        DynamicFileUtilities.AddedFiles[fileName] = { Exists: false };

        document.getElementsByTagName("head")[0].appendChild(DynamicFileUtilities._create_css_file_object(fileName));

        DynamicFileUtilities.AddedFiles[fileName] = { Exists: true };
    },

    remove_css: function (fileName) {
        var linkTags = document.getElementsByTagName("link");
        for (var i = 0; i < linkTags.length; ++i)
            if (linkTags[i].getAttribute("href") == fileName) linkTags[i].parentNode.removeChild(linkTags[i]);
    },

    replace_css: function (oldFileName, newFileName) {
        var linkTags = document.getElementsByTagName("link");
        for (var i = 0; i < linkTags.length; ++i) {
            var href = String(linkTags[i].getAttribute("href"));
            if (href.indexOf("?") >= 0) href = href.substr(0, href.indexOf("?"));
            if (href == oldFileName) linkTags[i].parentNode.replaceChild(DynamicFileUtilities._create_css_file_object(newFileName), linkTags[i]);
        }
    },

    _init_added_items: (function () {
        var inited = false;

        return function () {
            if (inited) return;
            inited = true;

            var _scripts = document.getElementsByTagName("script");
            for (var i = 0; i < _scripts.length; ++i) {
                var _attr = _scripts.item(i).getAttribute("src");
                if (_attr) _attr = String(_attr).toLowerCase();
                if (_attr && !DynamicFileUtilities.AddedFiles[_attr]) DynamicFileUtilities.AddedFiles[_attr] = { Exists: true };
            }

            var _links = document.getElementsByTagName("link");
            for (var i = 0; i < _links.length; ++i) {
                var _attr = _links.item(i).getAttribute("href");
                if (_attr) _attr = String(_attr).toLowerCase();
                if (_attr && !DynamicFileUtilities.AddedFiles[_attr]) DynamicFileUtilities.AddedFiles[_attr] = { Exists: true };
            }
        }
    })(),

    files_exist: function (files, checkFuncs) {
        DynamicFileUtilities._init_added_items();

        if (GlobalUtilities.get_type(files) != "array") files = [files];

        for (var i = 0, lnt = files.length; i < lnt; ++i) {
            var fileName = String(files[i].File || files[i] || "").toLowerCase();

            if (!DynamicFileUtilities.AddedFiles[fileName]) return false;
            else if (DynamicFileUtilities.AddedFiles[fileName].Exists) continue;
            else if (checkFuncs && checkFuncs[fileName]) {
                if (checkFuncs[fileName]()) DynamicFileUtilities.AddedFiles[fileName].Exists = true;
                else return false;
            }
            else if (GlobalUtilities.get_type(DynamicFileUtilities.AddedFiles[fileName].Exists) == "boolean" &&
                !DynamicFileUtilities.AddedFiles[fileName].Exists) return false;
        }

        return true;
    }
};

///////////////////////////////////////////////////////
//////////--> end of DynamicFileUtilities <--//////////
///////////////////////////////////////////////////////