// Mobile menu only. No tracking, no storage, no network.
(function () {
  "use strict";
  // Don't let other sites show this page inside a frame.
  if (window.top !== window.self) {
    try { window.top.location = window.location.href; } catch (e) { document.documentElement.hidden = true; }
  }
  document.documentElement.classList.add("js");
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  btn.addEventListener("click", function () {
    setOpen(btn.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      btn.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) setOpen(false);
  });
})();
