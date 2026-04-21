(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Chart data for the three series ---
  const SERIES = {
    hires: {
      values: [18, 47, 92, 168, 245],
      max: 260,
      legend: [
        { value: 570, suffix: '+', label: 'Total developers hired' },
        { value: 14, suffix: 'x',  label: 'Growth vs. year one' },
        { value: 94, suffix: '%',  label: 'Placement success rate' },
      ],
    },
    projects: {
      values: [12, 34, 68, 124, 189],
      max: 210,
      legend: [
        { value: 427, suffix: '+', label: 'Total projects handled' },
        { value: 99,  suffix: '%', label: 'On-time delivery rate' },
        { value: 31,  suffix: '',  label: 'Avg. projects / month' },
      ],
    },
    interviews: {
      values: [64, 180, 420, 880, 1420],
      max: 1600,
      legend: [
        { value: 2964, suffix: '+', label: 'Interviews conducted' },
        { value: 92,   suffix: '%', label: 'Interview pass rate' },
        { value: 4.8,  suffix: '/5',label: 'Avg. coach rating' },
      ],
    },
  };

  function countUp(el, target, suffix, duration) {
    const decimals = (String(target).split('.')[1] || '').length;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;
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

  // --- Chart rendering ---
  const chart = document.querySelector('.chart');
  const tabs = document.querySelectorAll('.chart-tab');
  const legendEls = document.querySelectorAll('.chart-legend > div');

  function renderSeries(key) {
    if (!chart) return;
    const series = SERIES[key];
    if (!series) return;

    const bars = chart.querySelectorAll('.bar');
    const values = chart.querySelectorAll('.bar-value');

    bars.forEach((bar, i) => {
      const v = series.values[i] || 0;
      const pct = Math.max(4, Math.round((v / series.max) * 96));
      bar.style.setProperty('--h', pct + '%');
      bar.style.height = pct + '%';
    });

    values.forEach((el, i) => {
      const v = series.values[i] || 0;
      el.dataset.value = v;
      countUp(el, v, '', 900);
    });

    legendEls.forEach((wrap, i) => {
      const numEl = wrap.querySelector('.legend-num');
      const lblEl = wrap.querySelector('.legend-label');
      const entry = series.legend[i];
      if (!entry || !numEl || !lblEl) return;
      numEl.dataset.count = entry.value;
      numEl.dataset.suffix = entry.suffix;
      lblEl.textContent = entry.label;
      countUp(numEl, entry.value, entry.suffix, 1400);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      renderSeries(tab.dataset.series);
    });
  });

  // --- Intersection observer for counters + first chart render ---
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;

      if (node.classList.contains('chart')) {
        node.classList.add('in-view');
        const activeTab = document.querySelector('.chart-tab.is-active');
        const key = (activeTab && activeTab.dataset.series) || 'hires';
        renderSeries(key);
      } else if (node.dataset.count) {
        animateCounter(node);
      }
      obs.unobserve(node);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach((el) => {
    // Skip chart legend counters — they are driven by renderSeries
    if (el.closest('.chart-legend')) return;
    observer.observe(el);
  });

  if (chart) observer.observe(chart);
})();
