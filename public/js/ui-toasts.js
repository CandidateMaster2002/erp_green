"use strict";
!(function () {
  const t = document.querySelector(".toast-placement-ex"),
    e = document.querySelector("#showToastPlacement");
  let o, s, c;
  e &&
    (e.onclick = function () {
      var e;
      c &&
        (e = c) &&
        null !== e._element &&
        (t &&
          (t.classList.remove(o),
          DOMTokenList.prototype.remove.apply(t.classList, s)),
        e.dispose()),
        (o = document.querySelector("#selectTypeOpt").value),
        (s = document.querySelector("#selectPlacement").value.split(" ")),
        t.classList.add(o),
        DOMTokenList.prototype.add.apply(t.classList, s),
        (c = new bootstrap.Toast(t)).show();
    });
})();
