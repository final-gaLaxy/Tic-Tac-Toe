! function() {
    var r = { Etag: 1, "Last-Modified": 1, "Content-Length": 1, "Content-Type": 1 },
        p = {},
        c = {},
        f = {},
        i = {},
        v = !1,
        g = { html: 1, css: 1, js: 1 },
        w = {
            heartbeat: function() { document.body && (v || w.loadresources(), w.checkForChanges()), setTimeout(w.heartbeat, 1e3) },
            loadresources: function() {
                function e(e) {
                    var t = document.location,
                        o = new RegExp("^\\.|^/(?!/)|^[\\w]((?!://).)*$|" + t.protocol + "//" + t.host);
                    return e.match(o)
                }
                for (var t = document.getElementsByTagName("script"), o = document.getElementsByTagName("link"), a = [], n = 0; n < t.length; n++) {
                    var s = t[n].getAttribute("src");
                    if (s && e(s) && a.push(s), s && s.match(/\blive.js#/)) {
                        for (var r in g) g[r] = null != s.match("[#,|]" + r);
                        s.match("notify") && alert("Live.js is loaded.")
                    }
                }
                g.js || (a = []), g.html && a.push(document.location.href);
                for (n = 0; n < o.length && g.css; n++) {
                    var c = o[n],
                        i = c.getAttribute("rel"),
                        l = c.getAttribute("href", 2);
                    l && i && i.match(new RegExp("stylesheet", "i")) && e(l) && (a.push(l), f[l] = c)
                }
                for (n = 0; n < a.length; n++) {
                    var d = a[n];
                    w.getHead(d, function(e, t) { p[e] = t })
                }
                var u = document.getElementsByTagName("head")[0],
                    h = document.createElement("style"),
                    m = "transition: all .3s ease-out;";
                css = [".livejs-loading * { ", m, " -webkit-", m, "-moz-", m, "-o-", m, "}"].join(""), h.setAttribute("type", "text/css"), u.appendChild(h), h.styleSheet ? h.styleSheet.cssText = css : h.appendChild(document.createTextNode(css)), v = !0
            },
            checkForChanges: function() {
                for (var e in p) c[e] || w.getHead(e, function(e, t) {
                    var o = p[e],
                        a = !1;
                    for (var n in p[e] = t, o) {
                        var s = o[n],
                            r = t[n],
                            c = t["Content-Type"];
                        switch (n.toLowerCase()) {
                            case "etag":
                                if (!r) break;
                            default:
                                a = s != r
                        }
                        if (a) { w.refreshResource(e, c); break }
                    }
                })
            },
            refreshResource: function(e, t) {
                switch (t.toLowerCase()) {
                    case "text/css":
                        var o = f[e],
                            a = document.body.parentNode,
                            n = o.parentNode,
                            s = o.nextSibling,
                            r = document.createElement("link");
                        a.className = a.className.replace(/\s*livejs\-loading/gi, "") + " livejs-loading", r.setAttribute("type", "text/css"), r.setAttribute("rel", "stylesheet"), r.setAttribute("href", e + "?now=" + 1 * new Date), s ? n.insertBefore(r, s) : n.appendChild(r), f[e] = r, i[e] = o, w.removeoldLinkElements();
                        break;
                    case "text/html":
                        if (e != document.location.href) return;
                    case "text/javascript":
                    case "application/javascript":
                    case "application/x-javascript":
                        document.location.reload()
                }
            },
            removeoldLinkElements: function() {
                var t = 0;
                for (var e in i) {
                    try {
                        var o = f[e],
                            a = i[e],
                            n = document.body.parentNode,
                            s = o.sheet || o.styleSheet;
                        0 <= (s.rules || s.cssRules).length && (a.parentNode.removeChild(a), delete i[e], setTimeout(function() { n.className = n.className.replace(/\s*livejs\-loading/gi, "") }, 100))
                    } catch (e) { t++ }
                    t && setTimeout(w.removeoldLinkElements, 50)
                }
            },
            getHead: function(a, n) {
                c[a] = !0;
                var s = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XmlHttp");
                s.open("HEAD", a, !0), s.onreadystatechange = function() {
                    if (delete c[a], 4 == s.readyState && 304 != s.status) {
                        s.getAllResponseHeaders();
                        var e = {};
                        for (var t in r) { var o = s.getResponseHeader(t); "etag" == t.toLowerCase() && o && (o = o.replace(/^W\//, "")), "content-type" == t.toLowerCase() && o && (o = o.replace(/^(.*?);.*?$/i, "$1")), e[t] = o }
                        n(a, e)
                    }
                }, s.send()
            }
        };
    "file:" != document.location.protocol ? (window.liveJsLoaded || w.heartbeat(), window.liveJsLoaded = !0) : window.console && console.log("Live.js doesn't support the file protocol. It needs http.")
}();