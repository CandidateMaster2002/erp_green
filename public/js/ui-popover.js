"use strict";
!(function () {
  const t = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  t.map(function (t) {
    return new bootstrap.Popover(t, { html: !0, sanitize: !1 });
  });
})();
