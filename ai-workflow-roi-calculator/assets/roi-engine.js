(function exposeEngine(root) {
  'use strict';

  function invalid(field, code) {
    throw Object.assign(new Error(`${field}: ${code}`), { field, code });
  }

  function readObject(value, field) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      invalid(field, 'expected_object');
    }
    return value;
  }

  function readNumber(value, field, options = {}) {
    if (value === undefined) value = options.defaultValue;
    if (value === undefined) invalid(field, 'required');
    if (!Number.isFinite(value) || value < (options.min ?? 0) || value > (options.max ?? Infinity)) {
      invalid(field, 'out_of_range');
    }
    if (options.integer && !Number.isSafeInteger(value)) invalid(field, 'expected_integer');
    return value;
  }

  function checkResult(value, field) {
    if (!Number.isFinite(value)) invalid(field, 'result_out_of_range');
    return value;
  }

  // Cancel rounding noise when two amounts represent the same value.
  function difference(first, second) {
    const gap = first - second;
    const noise = Math.max(Math.abs(first), Math.abs(second)) * Number.EPSILON * 4;
    return Math.abs(gap) <= noise ? 0 : gap;
  }

  function operatingBreakEven(unitSavings, monthlyCost, field) {
    if (unitSavings <= 0) {
      const status = unitSavings === 0 && monthlyCost === 0 ? 'equal' : 'unreachable';
      return { status, tasksPerMonth: null };
    }

    const ratio = monthlyCost / unitSavings;
    const nearest = Math.round(ratio);
    const tasksPerMonth = nearest > 0 && difference(ratio, nearest) === 0
      ? nearest
      : monthlyCost === 0 ? 0 : Math.max(1, Math.ceil(ratio));
    if (!Number.isSafeInteger(tasksPerMonth)) invalid(field, 'result_out_of_range');
    return { status: 'threshold', tasksPerMonth };
  }

  function setupPayback(setupCost, monthlySavings, field) {
    if (setupCost === 0) return { status: 'no_setup_cost', months: null };
    if (monthlySavings <= 0) return { status: 'unreachable', months: null };
    return { status: 'months', months: checkResult(setupCost / monthlySavings, field) };
  }

  function readBaseline(input) {
    const baseline = readObject(input, 'baseline');
    const monthlyVolume = readNumber(baseline.monthlyVolume, 'baseline.monthlyVolume', { integer: true });
    const manualMinutes = readNumber(baseline.manualMinutes, 'baseline.manualMinutes');
    const hourlyCost = readNumber(baseline.hourlyCost, 'baseline.hourlyCost');
    const months = readNumber(baseline.months, 'baseline.months', { integer: true, min: 1, defaultValue: 12 });
    const currency = baseline.currency === undefined ? 'USD' : baseline.currency;
    if (typeof currency !== 'string' || !/^[a-z]{3}$/i.test(currency.trim())) {
      invalid('baseline.currency', 'expected_currency');
    }

    const manualUnitCost = checkResult((manualMinutes / 60) * hourlyCost, 'baseline.hourlyCost');
    const monthlyHours = checkResult((manualMinutes / 60) * monthlyVolume, 'baseline.manualMinutes');
    const manualMonthlyCost = checkResult(manualUnitCost * monthlyVolume, 'baseline.monthlyVolume');
    const manualPeriodCost = checkResult(manualMonthlyCost * months, 'baseline.months');
    return {
      monthlyVolume,
      manualMinutes,
      hourlyCost,
      currency: currency.trim().toUpperCase(),
      months,
      manualUnitCost,
      monthlyHours,
      manualMonthlyCost,
      manualPeriodCost
    };
  }

  function calculateScenario(input, index, baseline) {
    const field = `scenarios[${index}]`;
    const scenario = readObject(input, field);
    if (typeof scenario.name !== 'string' || !scenario.name.trim()) invalid(`${field}.name`, 'required');

    const modelCost = readNumber(scenario.modelCost, `${field}.modelCost`);
    const reviewMinutes = readNumber(scenario.reviewMinutes, `${field}.reviewMinutes`);
    const reviewPercent = readNumber(scenario.reviewPercent, `${field}.reviewPercent`, { max: 100, defaultValue: 100 });
    const monthlyCost = readNumber(scenario.monthlyCost, `${field}.monthlyCost`, { defaultValue: 0 });
    const setupCost = readNumber(scenario.setupCost, `${field}.setupCost`, { defaultValue: 0 });

    const reviewHoursPerTask = (reviewMinutes / 60) * (reviewPercent / 100);
    const automationUnitCost = checkResult(modelCost + reviewHoursPerTask * baseline.hourlyCost, field);
    const monthlyReviewHours = checkResult(reviewHoursPerTask * baseline.monthlyVolume, field);
    const monthlyHoursSaved = difference(baseline.monthlyHours, monthlyReviewHours);
    const automationMonthlyCost = checkResult(automationUnitCost * baseline.monthlyVolume + monthlyCost, field);
    const unitSavings = difference(baseline.manualUnitCost, automationUnitCost);
    const monthlySavings = checkResult(difference(unitSavings * baseline.monthlyVolume, monthlyCost), field);
    const automationPeriodCost = checkResult(automationMonthlyCost * baseline.months + setupCost, field);
    const periodSavings = checkResult(difference(monthlySavings * baseline.months, setupCost), field);
    const roiPercent = automationPeriodCost === 0
      ? null
      : checkResult((periodSavings / automationPeriodCost) * 100, field);

    return {
      name: scenario.name.trim(),
      setupCost,
      automationUnitCost,
      automationMonthlyCost,
      automationPeriodCost,
      monthlyHoursSaved,
      monthlySavings,
      periodSavings,
      roiPercent,
      operatingBreakEven: operatingBreakEven(unitSavings, monthlyCost, field),
      payback: setupPayback(setupCost, monthlySavings, field)
    };
  }

  function compare(scenarios) {
    const bestSavings = scenarios.reduce((best, scenario) => Math.max(best, scenario.periodSavings), -Infinity);
    const bestScenarioIndexes = scenarios.flatMap((scenario, index) => (
      difference(scenario.periodSavings, bestSavings) === 0 ? [index] : []
    ));
    let status = 'automation_cheaper';
    if (bestSavings < 0) status = 'manual_cheaper';
    if (bestSavings === 0) status = 'tied_with_manual';
    return { status, bestScenarioIndexes };
  }

  function calculate(input) {
    const request = readObject(input, 'input');
    const baseline = readBaseline(request.baseline);
    if (!Array.isArray(request.scenarios) || request.scenarios.length === 0) {
      invalid('scenarios', 'expected_nonempty_array');
    }
    const scenarios = Array.from(request.scenarios, (scenario, index) => calculateScenario(scenario, index, baseline));
    return { baseline, scenarios, comparison: compare(scenarios) };
  }

  const api = Object.freeze({ calculate });
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.WorkflowRoi = api;
  }
})(globalThis);
