"use strict";
document.addEventListener("DOMContentLoaded", function () {
  var e, t, l;
  (e = document.getElementById("vertical-example")),
    (t = document.getElementById("horizontal-example")),
    (l = document.getElementById("both-scrollbars-example")),
    e && new PerfectScrollbar(e, { wheelPropagation: !1 }),
    t && new PerfectScrollbar(t, { wheelPropagation: !1, suppressScrollY: !0 }),
    l && new PerfectScrollbar(l, { wheelPropagation: !1 });
});
