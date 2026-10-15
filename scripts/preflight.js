#!/usr/bin/env node
'use strict';
// Public CLI for the dependency-free project checks.
require('../js/preflight.js');
const assert=require('node:assert/strict');
const {scan,load,languages}=require('./localization-sanity.js');
const result=scan(load(require('node:path').resolve(__dirname,'..')));
assert.equal(result.errors.length,0,JSON.stringify(result.errors));
const values=Object.fromEntries(languages.map(language=>[language,'Team {team}: {count}']));
assert.equal(scan([{source:'Team {team}: {count}',values}]).errors.length,0);
const corrupt={...values,ar:'فترة '.repeat(30)+'{team} {count}',ko:'등'.repeat(80)+'{team} {count}',ru:'Team {team}',fr:'\uFFFD {team} {count}'};
const fixture=scan([{source:'Team {team}: {count}',values:corrupt}]);
assert(fixture.errors.some(item=>item.language==='ru'&&item.reason.includes('placeholders')));
assert(fixture.errors.some(item=>item.language==='fr'&&item.reason.includes('Unicode')));
assert(fixture.warnings.some(item=>item.language==='ar'&&item.reason.includes('repetition')));
assert(fixture.warnings.some(item=>item.language==='ko'&&item.reason.includes('sequence')));
console.log(`PASS localization integrity and corruption detector (${result.warnings.length} warnings require contextual review)`);
