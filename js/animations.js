(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el, target, suffix, duration) {
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateCounter(el, delay) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (Number.isNaN(target)) return;
    setTimeout(() => countUp(el, target, suffix, 1400), delay || 0);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;

      if (node.classList.contains('chart')) {
        node.classList.add('in-view');
        const values = node.querySelectorAll('.bar-value');
        values.forEach((v, i) => {
          const target = parseFloat(v.dataset.value);
          if (Number.isNaN(target)) return;
          setTimeout(() => countUp(v, target, '', 900), 550 + i * 130);
        });
      } else if (node.dataset.count) {
        animateCounter(node);
      }
      obs.unobserve(node);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
  const chart = document.querySelector('.chart');
  if (chart) observer.observe(chart);
})();
