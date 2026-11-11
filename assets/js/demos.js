// "See it work" demos. No network, no storage, no tracking, no innerHTML, no eval.
// Each demo is plain HTML. Steps come from the <ol class="demo-steps"> list (one <li> per step, data-ms = how long to hold).
// Elements with data-at="N" appear at step N; elements with data-until="N" fade out at step N.
(function () {
  "use strict";
  var section = document.getElementById("see-it-work");
  if (!section) return;
  document.documentElement.classList.add("js");

  var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(reduceQuery && reduceQuery.matches); }
  var current = null; // the one demo that is allowed to play

  function makeDemo(root) {
    var cap = root.querySelector(".demo-cap");
    var playBtn = root.querySelector(".dbtn-play");
    var pauseBtn = root.querySelector(".dbtn-pause");
    var scenes = root.querySelectorAll(".scene");
    var lists = root.querySelectorAll(".demo-steps");
    var variantBtns = root.querySelectorAll(".variant");
    var key = scenes[0].getAttribute("data-scene");
    var step = 0, state = "idle", timer = null, started = false, autoPaused = false;

    function sceneEl() { return root.querySelector('.scene[data-scene="' + key + '"]'); }
    function listEl() { return root.querySelector('.demo-steps[data-for="' + key + '"]'); }
    function items() { return listEl().querySelectorAll("li"); }
    function hold(li, idx) { return Number(li[Math.max(idx, 0)].getAttribute("data-ms")) || 2500; }

    function render() {
      var sc = sceneEl(), li = items(), i, n;
      var ats = sc.querySelectorAll("[data-at]");
      for (i = 0; i < ats.length; i++) ats[i].classList.toggle("on", step >= Number(ats[i].getAttribute("data-at")));
      var untils = sc.querySelectorAll("[data-until]");
      for (i = 0; i < untils.length; i++) untils[i].classList.toggle("gone", step >= Number(untils[i].getAttribute("data-until")));
      for (i = 0, n = li.length; i < n; i++) li[i].classList.toggle("now", i === step - 1);
      if (cap) cap.textContent = step > 0 ? li[step - 1].textContent : (cap.getAttribute("data-intro") || "");
    }

    function buttons() {
      if (playBtn) playBtn.textContent = state === "idle" ? "Play" : "Replay";
      if (pauseBtn) {
        pauseBtn.disabled = !(state === "playing" || state === "paused");
        pauseBtn.textContent = state === "paused" ? "Resume" : "Pause";
      }
    }

    function next() {
      var li = items();
      step++;
      render();
      if (step >= li.length) { state = "done"; buttons(); return; }
      timer = setTimeout(next, hold(li, step - 1));
    }

    function stop() {
      clearTimeout(timer);
      state = "idle"; step = 0; autoPaused = false;
      render(); buttons();
      if (current === api) current = null;
    }

    function showFinal() {
      clearTimeout(timer);
      step = items().length; state = "done";
      root.classList.add("reduced");
      render(); buttons();
    }

    function play() {
      started = true; autoPaused = false;
      if (reduced()) { showFinal(); return; }
      root.classList.remove("reduced");
      if (current && current !== api) current.stop();
      current = api;
      clearTimeout(timer);
      step = 0; state = "playing";
      next();
      buttons();
    }

    function pause() {
      if (state !== "playing") return;
      clearTimeout(timer); state = "paused"; buttons();
    }

    function resume() {
      if (state !== "paused") return;
      if (current && current !== api) current.stop();
      current = api; state = "playing"; buttons();
      timer = setTimeout(next, hold(items(), step - 1));
    }

    function setVariant(name) {
      var i;
      stop();
      key = name;
      for (i = 0; i < scenes.length; i++) scenes[i].hidden = scenes[i].getAttribute("data-scene") !== name;
      for (i = 0; i < lists.length; i++) lists[i].hidden = lists[i].getAttribute("data-for") !== name;
      for (i = 0; i < variantBtns.length; i++) variantBtns[i].setAttribute("aria-pressed", variantBtns[i].getAttribute("data-variant") === name ? "true" : "false");
      render();
    }

    if (playBtn) playBtn.addEventListener("click", play);
    if (pauseBtn) pauseBtn.addEventListener("click", function () { if (state === "paused") resume(); else pause(); });
    variantBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("aria-pressed") === "true") return;
        setVariant(b.getAttribute("data-variant"));
        play();
      });
    });

    var api = {
      play: play, stop: stop,
      visible: function (on) {
        if (reduced()) { if (on && state !== "done") showFinal(); return; }
        if (on) {
          if (!started) play();
          else if (autoPaused && state === "paused") { autoPaused = false; resume(); }
        } else if (state === "playing") { autoPaused = true; pause(); }
      },
      fresh: function () { stop(); started = false; }
    };
    render(); buttons();
    return api;
  }

  var demoEls = section.querySelectorAll("[data-demo]");
  var demos = [];
  for (var i = 0; i < demoEls.length; i++) demos.push(makeDemo(demoEls[i]));

  // ----- tabs: one demo at a time -----
  var tabs = section.querySelectorAll(".demo-tab");
  function select(index, focus) {
    for (var i = 0; i < tabs.length; i++) {
      var on = i === index;
      tabs[i].setAttribute("aria-selected", on ? "true" : "false");
      tabs[i].tabIndex = on ? 0 : -1;
      demoEls[i].hidden = !on;
      if (!on) demos[i].stop();
    }
    if (focus) tabs[index].focus();
    demos[index].fresh();
    demos[index].play(); // plays, or shows the final frame when the visitor prefers reduced motion
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { select(index, false); });
    tab.addEventListener("keydown", function (e) {
      var to = -1;
      if (e.key === "ArrowRight") to = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft") to = (index + tabs.length - 1) % tabs.length;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = tabs.length - 1;
      if (to >= 0) { e.preventDefault(); select(to, true); }
    });
  });
  if (reduced()) demos.forEach(function (d) { d.visible(true); });
  // First demo shown, others hidden. The first one starts when it scrolls into view.
  for (var j = 1; j < demoEls.length; j++) demoEls[j].hidden = true;

  // ----- play when scrolled into view, pause when scrolled away -----
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var idx = Array.prototype.indexOf.call(demoEls, en.target);
        if (idx < 0 || demoEls[idx].hidden) return;
        demos[idx].visible(en.isIntersecting);
      });
    }, { threshold: 0.25 });
    for (var k = 0; k < demoEls.length; k++) io.observe(demoEls[k]);
  } else {
    demos[0].visible(true);
  }

  // If the visitor switches "reduce motion" on while the page is open, show the final frames.
  if (reduceQuery && reduceQuery.addEventListener) {
    reduceQuery.addEventListener("change", function () {
      if (reduced()) demos.forEach(function (d) { d.visible(true); });
    });
  }
})();
