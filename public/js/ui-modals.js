"use strict";
!(function () {
  const t = document.querySelector("#youTubeModal"),
    e = t.querySelector("iframe");
  t.addEventListener("hidden.bs.modal", function () {
    e.setAttribute("src", "");
  });
  {
    const o = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="modal"]')
    );
    o.map(function (t) {
      t.onclick = function () {
        const t = this.getAttribute("data-bs-target"),
          e = this.getAttribute("data-theVideo"),
          o = e + "?autoplay=1",
          c = document.querySelector(t + " iframe");
        c && c.setAttribute("src", o);
      };
    });
  }
})();
