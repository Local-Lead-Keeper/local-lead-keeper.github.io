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
  function fallbackCopy(text, host) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "offscreen";
    (host || document.body).appendChild(ta); // inside an open menu, so the menu stays open
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

  // ----- Book-a-call menu (round 4) -----
  // Without JavaScript each button is a plain mailto link. With JavaScript it opens a small menu: Gmail, Outlook,
  // the computer's mail app, or copy the address. Disclosure pattern: Esc or a click/tap outside closes it.
  var openMenu = null;

  function closeMenu(focusToggle) {
    if (!openMenu) return;
    openMenu.menu.hidden = true;
    openMenu.toggle.setAttribute("aria-expanded", "false");
    if (focusToggle) openMenu.toggle.focus();
    openMenu = null;
  }

  document.querySelectorAll("[data-book]").forEach(function (toggle) {
    var menu = document.getElementById(toggle.getAttribute("data-book"));
    if (!menu) return; // no menu: the plain mailto link keeps working
    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", menu.id);

    function openIt() {
      if (openMenu && openMenu.menu !== menu) closeMenu(false);
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      openMenu = { menu: menu, toggle: toggle };
      var first = menu.querySelector(".book-item");
      if (first) first.focus();
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      if (openMenu && openMenu.menu === menu) closeMenu(false);
      else openIt();
    });
    toggle.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle.click();
      }
    });
    menu.querySelectorAll("a.book-item").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(false); });
    });

    var copy = menu.querySelector(".book-copy");
    var status = menu.querySelector(".book-status");
    if (copy) {
      var label = copy.textContent;
      copy.addEventListener("click", function () {
        var text = copy.getAttribute("data-copy") || "";
        var show = function (ok) {
          copy.textContent = ok ? "Copied" : label;
          if (status) status.textContent = ok ? "Email address copied." : "Could not copy. The address is " + text + ".";
          setTimeout(function () {
            copy.textContent = label;
            if (status) status.textContent = "";
          }, 2500);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(fallbackCopy(text, menu)); });
        } else {
          show(fallbackCopy(text, menu));
        }
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openMenu) closeMenu(true);
  });
  document.addEventListener("click", function (e) {
    if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.toggle.contains(e.target)) closeMenu(false);
  });
  document.addEventListener("focusin", function (e) {
    if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.toggle.contains(e.target)) closeMenu(false);
  });
})();
