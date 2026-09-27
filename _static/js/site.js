/* CoPlanAI shared page behaviour (scroll-reveal, pricing toggle, before/after slider) -- was shipped base64-encoded inside
   window.eval(decodeURIComponent(escape(window.atob(...)))).  Decoded verbatim
   on 2026-08-04 and moved to an external file: identical behaviour, readable in
   review, and no inline/eval script for a future Content-Security-Policy. */

/* 1. Scroll reveal. Elements marked .rise start at opacity 0 and fade up once
      12% of them has entered the viewport. Staggered 0/70/140/210ms in fours. */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  })
}, { threshold: .12 });
document.querySelectorAll('.rise').forEach(function (el, i) {
  el.style.transitionDelay = ((i % 4) * 70) + 'ms';
  io.observe(el)
});

/* 2. Pricing period toggle (#prToggle, use-coplanai only). Each price/billing
      node carries data-monthly and data-annual; the buttons swap between them. */
(function () {
  var t = document.getElementById("prToggle");
  if (!t) return;
  function set(b) {
    t.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x.dataset.b === b) });
    document.querySelectorAll(".pr-price b,.pr-bill").forEach(function (el) {
      var v = el.getAttribute("data-" + b);
      if (v) el.innerHTML = v
    })
  }
  t.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () { set(btn.dataset.b) })
  });
  set("annual");
})();

/* 3. Before/after comparison sliders (.cmp). The range input drives the --pos
      custom property that clips the "after" image. */
(function () {
  document.querySelectorAll(".cmp").forEach(function (c) {
    var r = c.querySelector('input[type=range]');
    if (!r) return;
    var set = function () { c.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });
})();
