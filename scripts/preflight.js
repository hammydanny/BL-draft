#!/usr/bin/env node
'use strict';
// Public CLI for the dependency-free project checks.
require('../js/preflight.js');
const assert=require('node:assert/strict');
const {scan,load,languages}=require('./localization-sanity.js');
const {scanCoverage,sourceStrings,resolver}=require('./localization-coverage.js');
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
const extracted=sourceStrings('<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description" content="Visible description"><button aria-label="width=device-width">Visible action</button>');
assert(!extracted.includes('width=device-width, initial-scale=1.0, viewport-fit=cover'));
assert(extracted.includes('Visible description')&&extracted.includes('Visible action')&&extracted.includes('width=device-width'));
const fixtureCovered=resolver({'KNOWN LABEL':{ms:'LABEL DIKENALI'}});
assert(fixtureCovered('KNOWN LABEL // 001'));
assert(!fixtureCovered('KNOWN LABEL // Untranslated action'));
const coverage=scanCoverage();
assert.equal(coverage.missing.length,0,JSON.stringify(coverage.missing,null,2));
console.log(`PASS localization source coverage (${coverage.catalogSize} catalog entries)`);

require('./replayability-tests.js').runReplayabilityTests();

require('./game-modes-tests.js').runGameModeTests();

require('./solo-draft-tests.js').runSoloDraftTests();
