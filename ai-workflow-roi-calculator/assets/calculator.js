'use strict';

(() => {
  const form = document.querySelector('#calculator');
  const baselineFields = form.querySelector('.baseline');
  const scenarioList = document.querySelector('#scenarios');
  const scenarioTemplate = document.querySelector('#scenario-template');
  const addButton = document.querySelector('#add-scenario');
  const formError = document.querySelector('#form-error');
  const status = document.querySelector('#status');
  const resultBody = document.querySelector('#result-body');
  const staleResult = document.querySelector('#stale-result');
  const sampleIndicator = document.querySelector('#sample-indicator');
  const mobileSummary = document.querySelector('#mobile-summary');
  const tableHead = document.querySelector('#comparison-head');
  const tableBody = document.querySelector('#comparison-body');
  const integer = new Intl.NumberFormat('he-IL');
  const decimal = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
  const percent = new Intl.NumberFormat('he-IL', { style: 'percent', maximumFractionDigits: 1 });
  const nameList = new Intl.ListFormat('he-IL');
  let nextId = 0;
  let exampleLoaded = false;
  let pendingUpdate = 0;

  function markResultsStale() {
    if (resultBody.hidden) return;
    staleResult.hidden = false;
    document.querySelector('#mobile-summary-label').textContent = 'תוצאה קודמת';
  }

  function paintRange(range) {
    const value = range.valueAsNumber;
    range.style.setProperty('--range-progress', `${100 * (value / Number(range.max))}%`);
    range.setAttribute('aria-valuetext', range.dataset.initialMax
      ? `${integer.format(value)} משימות בחודש`
      : `${decimal.format(value)} אחוזים`);
  }

  function syncRangeFromNumber(range) {
    const input = document.getElementById(range.dataset.rangeFor);
    if (input.validity.badInput || !input.validity.valid && input.value !== '') return;
    const value = input.value === '' ? Number(input.defaultValue) : input.valueAsNumber;
    if (range.dataset.initialMax && Number.isSafeInteger(value)) {
      range.max = Math.max(Number(range.dataset.initialMax), value);
    }
    range.value = value;
    paintRange(range);
  }

  function renumberScenarios() {
    const scenarios = Array.from(scenarioList.children);
    scenarios.forEach((scenario, index) => {
      const title = `תרחיש ${index + 1}`;
      scenario.querySelector('legend').textContent = title;
      const removeButton = scenario.querySelector('.remove-scenario');
      removeButton.hidden = scenarios.length === 1;
      removeButton.setAttribute('aria-label', `הסרה של ${title}`);
    });
  }

  function addScenario(values = {}) {
    const scenario = scenarioTemplate.content.firstElementChild.cloneNode(true);
    nextId += 1;
    for (const input of scenario.querySelectorAll('input[name]')) {
      input.id = `scenario-${nextId}-${input.name}`;
      input.previousElementSibling.htmlFor = input.id;
      if (Object.hasOwn(values, input.name)) input.value = values[input.name];
    }
    const range = scenario.querySelector('input[type="range"]');
    const reviewInput = scenario.querySelector('[name="reviewPercent"]');
    const reviewLabel = reviewInput.previousElementSibling;
    reviewLabel.id = `${reviewInput.id}-label`;
    range.id = `${reviewInput.id}-range`;
    range.dataset.rangeFor = reviewInput.id;
    range.setAttribute('aria-labelledby', reviewLabel.id);
    const name = scenario.querySelector('[name="name"]');
    if (!name.value) {
      const existing = new Set(Array.from(scenarioList.querySelectorAll('[name="name"]'), input => input.value.trim()));
      let number = scenarioList.children.length + 1;
      while (existing.has(`תרחיש ${number}`)) number += 1;
      name.value = `תרחיש ${number}`;
    }
    scenarioList.append(scenario);
    syncRangeFromNumber(range);
    renumberScenarios();
    return name;
  }

  function clearFieldError(control) {
    if (!control.hasAttribute('aria-invalid')) return;
    document.getElementById(`${control.id}-error`)?.remove();
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  }

  function showFieldError(control, message) {
    const hint = document.createElement('span');
    hint.id = `${control.id}-error`;
    hint.className = 'field-error';
    hint.textContent = message;
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', hint.id);
    control.after(hint);
    control.focus();
    status.textContent = 'יש לתקן את השדה המסומן.';
  }

  function readFields(container, path, controls) {
    const values = {};
    for (const input of container.querySelectorAll('input[name], select[name]')) {
      controls.set(`${path}.${input.name}`, input);
      if (input.type === 'number') {
        if (input.validity.badInput || input.value !== '') values[input.name] = input.valueAsNumber;
      } else {
        values[input.name] = input.value;
      }
    }
    return values;
  }

  function validationMessage(error, control) {
    if (control.validity.badInput) return 'יש להזין מספר תקין.';
    if (error.code === 'required') return control.type === 'text' ? 'יש להזין שם לתרחיש.' : 'יש למלא את השדה.';
    if (error.code === 'expected_integer') return 'יש להזין מספר שלם בטווח הנתמך.';
    if (control.name === 'reviewPercent') return 'יש להזין אחוז בין 0 ל־100.';
    if (control.name === 'months') return 'יש להזין לפחות חודש אחד.';
    if (error.code === 'result_out_of_range') return 'התוצאה גדולה מדי. יש לבדוק את הערך שהוזן.';
    return 'יש להזין מספר גדול מאפס או שווה לו.';
  }

  function addCell(row, tag, value, scope) {
    const cell = document.createElement(tag);
    if (scope) cell.scope = scope;
    const text = document.createElement('bdi');
    text.textContent = value;
    cell.append(text);
    row.append(cell);
  }

  function renderTable(result, money) {
    const { baseline, scenarios } = result;
    const heading = document.createElement('tr');
    for (const name of ['מדד', 'עבודה ידנית', ...scenarios.map(scenario => scenario.name)]) {
      addCell(heading, 'th', name, 'col');
    }
    tableHead.replaceChildren(heading);

    function breakEvenLabel({ status, tasksPerMonth }) {
      if (status === 'equal') return 'שוויון בכל נפח';
      if (status === 'unreachable') return 'אין נקודת איזון';
      if (tasksPerMonth === 0) return 'בכל נפח חיובי';
      return integer.format(tasksPerMonth);
    }

    function paybackLabel({ status, months }) {
      if (status === 'no_setup_cost') return 'אין עלות הקמה';
      if (status === 'unreachable') return 'אין החזר';
      if (months < 0.01) return 'פחות מ־0.01';
      return decimal.format(months);
    }

    const metrics = [
      ['עלות חודשית', money(baseline.manualMonthlyCost), scenario => money(scenario.automationMonthlyCost)],
      ['חיסכון חודשי', money(0), scenario => money(scenario.monthlySavings)],
      ['שעות שמתפנות בחודש', '0', scenario => decimal.format(scenario.monthlyHoursSaved)],
      ['נקודת איזון (משימות בחודש)', '—', scenario => breakEvenLabel(scenario.operatingBreakEven)],
      ['זמן החזר (חודשים)', '—', scenario => paybackLabel(scenario.payback)],
      ['חיסכון מצטבר בחודש 0', money(0), scenario => money(-scenario.setupCost)],
      [`עלות כוללת ל־${integer.format(baseline.months)} חודשים`, money(baseline.manualPeriodCost), scenario => money(scenario.automationPeriodCost)],
      [`חיסכון אחרי ${integer.format(baseline.months)} חודשים`, money(0), scenario => money(scenario.periodSavings), 'period-total'],
      ['ROI לתקופה', '—', scenario => scenario.roiPercent === null ? 'לא מוגדר (עלות אפס)' : percent.format(scenario.roiPercent / 100)]
    ];

    tableBody.replaceChildren(...metrics.map(([title, manual, getValue, className]) => {
      const row = document.createElement('tr');
      if (className) row.className = className;
      addCell(row, 'th', title, 'row');
      addCell(row, 'td', manual);
      for (const scenario of scenarios) addCell(row, 'td', getValue(scenario));
      return row;
    }));
  }

  function renderDecision(result, money) {
    const { scenarios, comparison } = result;
    const best = comparison.bestScenarioIndexes.map(index => scenarios[index]);
    const names = nameList.format(best.map(scenario => `\u2068${scenario.name}\u2069`));
    const heading = document.querySelector('#decision-heading');
    const leading = best[0];
    const amount = money(leading.periodSavings);
    const metric = leading.periodSavings < 0 ? 'הפסד' : 'חיסכון';
    const period = integer.format(result.baseline.months);
    document.querySelector('#decision-metric').textContent = `${metric} אחרי ${period} חודשים, כולל הקמה`;
    document.querySelector('#decision-value').textContent = amount;
    document.querySelector('#decision-monthly').textContent = money(leading.monthlySavings);
    document.querySelector('#decision-roi').textContent = leading.roiPercent === null ? 'לא מוגדר' : percent.format(leading.roiPercent / 100);
    document.querySelector('#mobile-summary-label').textContent = `${metric} אחרי ${period} חודשים`;
    document.querySelector('#mobile-summary-value').textContent = amount;

    if (comparison.status === 'manual_cheaper') {
      heading.textContent = `עבודה ידנית זולה יותר מתרחיש האוטומציה המוביל (${names}).`;
    } else if (comparison.status === 'tied_with_manual') {
      heading.textContent = `עלות זהה לעבודה ידנית: ${names}.`;
    } else {
      heading.textContent = `החיסכון הגבוה ביותר: ${names}.`;
    }
  }

  function render(result) {
    const formatter = new Intl.NumberFormat('he-IL', { style: 'currency', currency: result.baseline.currency });
    const money = value => formatter.format(value === 0 ? 0 : value);
    renderDecision(result, money);
    renderTable(result, money);
    document.querySelector('#empty-result').hidden = true;
    staleResult.hidden = true;
    resultBody.hidden = false;
    mobileSummary.hidden = false;
    sampleIndicator.hidden = !exampleLoaded;
    roiChart.render(result);
  }

  function updateResults({ submit = false, announce = false } = {}) {
    cancelAnimationFrame(pendingUpdate);
    formError.hidden = true;
    if (submit) {
      status.textContent = '';
      for (const control of form.querySelectorAll('[aria-invalid]')) clearFieldError(control);
    }

    const controls = new Map();
    const baseline = readFields(baselineFields, 'baseline', controls);
    const scenarios = Array.from(scenarioList.children, (scenario, index) => (
      readFields(scenario, `scenarios[${index}]`, controls)
    ));

    let result;
    try {
      result = WorkflowRoi.calculate({ baseline, scenarios });
    } catch (error) {
      markResultsStale();
      if (!submit) return;
      const control = controls.get(error.field);
      if (control) {
        showFieldError(control, validationMessage(error, control));
      } else {
        formError.textContent = error.code === 'result_out_of_range'
          ? 'אחת התוצאות גדולה מדי. יש לבדוק את סדר הגודל של הערכים בתרחישים.'
          : 'החישוב נכשל. יש לבדוק את הנתונים ולנסות שוב.';
        formError.hidden = false;
        formError.focus();
      }
      return;
    }
    render(result);
    if (submit) document.querySelector('#results-title').focus();
    if (announce) {
      const metric = document.querySelector('#decision-metric').textContent;
      const amount = document.querySelector('#decision-value').textContent;
      status.textContent = `${metric}. ${amount}.`;
    }
  }

  function scheduleUpdate() {
    cancelAnimationFrame(pendingUpdate);
    pendingUpdate = requestAnimationFrame(() => updateResults());
  }

  form.noValidate = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateResults({ submit: true, announce: true });
  });

  form.addEventListener('input', event => {
    const control = event.target;
    if (control.type === 'range') {
      const input = document.getElementById(control.dataset.rangeFor);
      if (!control.dataset.initialMax) control.value = Number(control.valueAsNumber.toFixed(1));
      input.value = control.value;
      clearFieldError(input);
      paintRange(control);
    } else {
      clearFieldError(control);
      const range = document.getElementById(`${control.id}-range`);
      if (range) syncRangeFromNumber(range);
    }
    scheduleUpdate();
  });

  form.addEventListener('change', event => {
    if (event.target.type === 'range') updateResults({ announce: true });
  });

  addButton.addEventListener('click', () => {
    addScenario().focus();
    scheduleUpdate();
  });

  scenarioList.addEventListener('click', event => {
    const button = event.target.closest('.remove-scenario');
    if (!button || scenarioList.children.length < 2) return;
    const scenario = button.closest('.scenario');
    const neighbor = scenario.nextElementSibling ?? scenario.previousElementSibling;
    scenario.remove();
    renumberScenarios();
    neighbor.querySelector('[name="name"]').focus();
    scheduleUpdate();
  });

  function loadExample() {
    for (const control of form.querySelectorAll('[aria-invalid]')) clearFieldError(control);
    const example = { monthlyVolume: 400, manualMinutes: 10, hourlyCost: 120, months: 12, currency: 'ILS' };
    for (const [name, value] of Object.entries(example)) {
      const input = form.elements.namedItem(name);
      input.value = value;
    }
    scenarioList.replaceChildren();
    addScenario({
      name: 'בדיקה מלאה', modelCost: 1, reviewMinutes: 3, monthlyCost: 1300, setupCost: 3900
    });
    addScenario({
      name: 'בדיקה מדגמית', modelCost: 1, reviewMinutes: 3, reviewPercent: 40, monthlyCost: 2000, setupCost: 7500
    });
    exampleLoaded = true;
    syncRangeFromNumber(document.querySelector('#monthly-volume-range'));
  }

  document.querySelector('#load-example').addEventListener('click', () => {
    loadExample();
    updateResults({ announce: true });
  });

  document.querySelector('#clear-form').addEventListener('click', () => {
    cancelAnimationFrame(pendingUpdate);
    for (const control of form.querySelectorAll('[aria-invalid]')) clearFieldError(control);
    form.reset();
    scenarioList.replaceChildren();
    addScenario();
    exampleLoaded = false;
    syncRangeFromNumber(document.querySelector('#monthly-volume-range'));
    formError.hidden = true;
    sampleIndicator.hidden = true;
    resultBody.hidden = true;
    staleResult.hidden = true;
    mobileSummary.hidden = true;
    document.querySelector('#empty-result').hidden = false;
    status.textContent = 'הטופס אופס.';
    document.querySelector('#monthly-volume').focus();
  });

  loadExample();
  updateResults();
})();
