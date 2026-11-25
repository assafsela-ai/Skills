'use strict';

const { readFileSync } = require('node:fs');
const { calculate } = require('../assets/roi-engine.js');

try {
  const input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
  process.stdout.write(JSON.stringify(calculate(input), null, 2) + '\n');
} catch (error) {
  const failure = {
    field: error.field ?? 'input',
    code: error.code ?? (error instanceof SyntaxError ? 'invalid_json' : 'cannot_read_input')
  };
  process.stderr.write(JSON.stringify(failure) + '\n');
  process.exitCode = 1;
}
