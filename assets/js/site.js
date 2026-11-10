// Mobile menu + "Copy email" button. No tracking, no storage, no network.
(function () {
  "use strict";
  // Don't let other sites show this page inside a frame.
  if (window.top !== window.self) {
    try { window.top.location = window.location.href; } catch (e) { document.documentElement.hidden = true; }
  }
  document.documentElement.classList.add("js");

  // ----- mobile menu -----
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
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
  }

  // ----- copy email -----
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "offscreen";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function selectText(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  document.querySelectorAll(".copy-btn").forEach(function (b) {
    var box = b.closest(".email-box");
    var status = box ? box.querySelector(".copy-status") : null;
    var addr = box ? box.querySelector(".email-addr") : null;
    var label = b.textContent;
    var timer = null;
    b.hidden = false;

    function done(ok) {
      clearTimeout(timer);
      if (ok) {
        b.textContent = "Copied!";
        b.classList.add("copied");
        if (status) status.textContent = "Email address copied.";
      } else {
        if (addr) selectText(addr);
        b.textContent = "Select and copy";
        if (status) status.textContent = "Address selected. Copy it with Ctrl+C, Cmd+C, or press and hold on a phone.";
      }
      timer = setTimeout(function () {
        b.textContent = label;
        b.classList.remove("copied");
        if (status) status.textContent = "";
      }, 2500);
    }

    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy") || "";
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });
})();
