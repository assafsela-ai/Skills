'use strict';

const roiChart = (() => {
  const canvas = document.querySelector('#cumulative-chart');
  const legend = document.querySelector('#chart-legend');
  const colors = ['#edbd7e', '#9ed4d2', '#aebfff', '#f1a9c6', '#c7d88c', '#91c6f4'];
  const patterns = [[], [7, 4], [2, 4], [9, 3, 2, 3]];
  let chart;

  function draw() {
    if (!chart) return;
    const { width, height } = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context || width === 0 || height === 0) return;

    const density = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.scale(density, density);
    context.font = '12px system-ui, sans-serif';
    context.direction = 'ltr';

    const { scenarios, months, tickCurrency, ticks } = chart;
    const magnitude = scenarios.reduce((max, scenario) => (
      Math.max(max, scenario.setupCost, Math.abs(scenario.periodSavings))
    ), 0) || 1;
    const bounds = scenarios.reduce(({ low, high }, scenario) => ({
      low: Math.min(low, -scenario.setupCost / magnitude, scenario.periodSavings / magnitude),
      high: Math.max(high, scenario.periodSavings / magnitude)
    }), { low: 0, high: 0 });
    const gridValues = [...new Set([bounds.high, 0, bounds.low])];
    const labelWidth = Math.max(...gridValues.map(value => context.measureText(tickCurrency.format(value * magnitude)).width));

    const left = labelWidth + 12;
    const right = width - 14;
    const top = 17;
    const bottom = height - 43;
    const spread = bounds.high - bounds.low || 1;
    const paddedLow = bounds.low - spread * .07;
    const paddedHigh = bounds.high + spread * .07;
    const y = value => bottom - (value - paddedLow) / (paddedHigh - paddedLow) * (bottom - top);
    const x = month => left + (month / months) * (right - left);

    function line(x1, y1, x2, y2, color, weight) {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = color;
      context.lineWidth = weight;
      context.stroke();
    }

    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillStyle = '#b4becb';
    const labelPositions = [];
    for (const value of [0, ...gridValues.filter(value => value !== 0)]) {
      const row = y(value);
      line(left, row, right, row, value === 0 ? '#778597' : '#343d49', 1);
      if (labelPositions.every(position => Math.abs(row - position) >= 15)) {
        context.fillText(tickCurrency.format(value * magnitude), left - 7, row);
        labelPositions.push(row);
      }
    }

    context.textAlign = 'center';
    const tickMonths = width < 390 ? [0, months] : ticks;
    for (const month of tickMonths) {
      const align = month === months ? 'right' : month === 0 ? 'left' : 'center';
      context.textAlign = align;
      context.fillText(month.toLocaleString('en-US'), x(month), height - 29);
    }
    context.textAlign = 'center';
    context.fillText('Months', (left + right) / 2, height - 10);

    scenarios.forEach((scenario, index) => {
      const color = colors[index % colors.length];
      const end = y(scenario.periodSavings / magnitude);
      context.setLineDash(index === 0 ? [] : patterns[1 + (index - 1) % (patterns.length - 1)]);
      line(left, y(-scenario.setupCost / magnitude), right, end, color, 2.5);
      context.beginPath();
      context.arc(right, end, 3, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
    context.setLineDash([]);
  }

  function render(result) {
    const { currency, months } = result.baseline;
    chart = {
      scenarios: result.scenarios,
      months,
      ticks: [...new Set([0, Math.round(months / 3), Math.round(2 * (months / 3)), months])],
      tickCurrency: new Intl.NumberFormat('en-US', {
        style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1
      })
    };

    legend.replaceChildren(...result.scenarios.map((scenario, index) => {
      const entry = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = 'legend-line';
      swatch.style.borderColor = colors[index % colors.length];
      if (index > 0) swatch.style.borderBlockStartStyle = (index - 1) % 3 === 1 ? 'dotted' : 'dashed';
      swatch.setAttribute('aria-hidden', 'true');
      const label = document.createElement('bdi');
      label.textContent = scenario.name;
      entry.append(swatch, label);
      return entry;
    }));
    draw();
  }

  new ResizeObserver(draw).observe(canvas);
  return { render };
})();
