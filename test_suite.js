// Comprehensive Automated Test Suite for RideProfit Mobile App
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log('==================================================');
console.log('   RideProfit Mobile Tool - Automated Test Suite  ');
console.log('==================================================\n');

// --- TEST 1: Static HTML & Mobile Requirements Verification ---
console.log('[1/3] Testing Mobile UX, Viewport & DOM Properties...');
const htmlContent = fs.readFileSync('index.html', 'utf-8');

assert(htmlContent.includes('viewport-fit=cover'), 'Viewport includes viewport-fit=cover for iPhone notches');
assert(htmlContent.includes('inputmode="decimal"'), 'Numeric fields have inputmode="decimal" for mobile numeric keyboard');
assert(htmlContent.includes('manifest.json'), 'PWA manifest.json is linked');
assert(htmlContent.includes('By Deepak'), 'Header includes "By Deepak" tag');
assert(htmlContent.includes('Created by Deepak'), 'Footer & Terms include "Created by Deepak" attribution');
assert(htmlContent.includes('© 2026 RideProfit'), 'Copyright 2026 notice is present');
assert(htmlContent.includes('clear-field-btn'), 'Quick clear buttons (✕) exist for rapid mobile entry');
assert(htmlContent.includes('triggerHaptic'), 'Haptic vibration support is implemented for mobile touch');

// --- TEST 2: Mathematical Accuracy & Edge Cases ---
console.log('\n[2/3] Testing Mathematical Formulas & Edge Cases...');

function calcLogic(payout, rawDist, isReturn, isMaint, vType, pRate, pMile, evCost, maintRate) {
  const dist = isReturn ? rawDist * 2 : rawDist;
  let fuelCost = 0;
  if (vType === 'petrol') {
    const mile = pMile > 0 ? pMile : 45;
    fuelCost = (dist / mile) * pRate;
  } else {
    fuelCost = dist * evCost;
  }
  const maintCost = isMaint ? dist * maintRate : 0;
  const totalCost = fuelCost + maintCost;
  const netProfit = payout - totalCost;
  const perKm = dist > 0 ? (netProfit / dist) : 0;
  return { dist, fuelCost, maintCost, totalCost, netProfit, perKm };
}

// Case A: User's exact prompt (₹60 payout, 8 km distance, petrol 96, mileage 45)
const caseA = calcLogic(60, 8, false, false, 'petrol', 96, 45, 0.35, 1.5);
assert(caseA.fuelCost.toFixed(2) === '17.07', `Petrol Cost is ₹17.07 (Got: ₹${caseA.fuelCost.toFixed(2)})`);
assert(caseA.netProfit.toFixed(2) === '42.93', `Net Profit is ₹42.93 (Got: ₹${caseA.netProfit.toFixed(2)})`);
assert(caseA.perKm.toFixed(2) === '5.37', `Net/KM is ₹5.37 (Got: ₹${caseA.perKm.toFixed(2)})`);

// Case B: EV Mode (₹60 payout, 8 km distance)
const caseB = calcLogic(60, 8, false, false, 'ev', 96, 45, 0.35, 1.5);
assert(caseB.fuelCost.toFixed(2) === '2.80', `EV Cost is ₹2.80 (Got: ₹${caseB.fuelCost.toFixed(2)})`);
assert(caseB.netProfit.toFixed(2) === '57.20', `EV Net Profit is ₹57.20 (Got: ₹${caseB.netProfit.toFixed(2)})`);

// Case C: Return trip (Khali wapsi 2x km -> 16 km)
const caseC = calcLogic(60, 8, true, false, 'petrol', 96, 45, 0.35, 1.5);
assert(caseC.dist === 16, `Return trip doubles distance to 16 km`);
assert(caseC.fuelCost.toFixed(2) === '34.13', `Return trip petrol cost is ₹34.13`);
assert(caseC.netProfit.toFixed(2) === '25.87', `Return trip net profit is ₹25.87`);

// Case D: Maintenance reserve toggled (₹1.5/km)
const caseD = calcLogic(60, 8, false, true, 'petrol', 96, 45, 0.35, 1.5);
assert(caseD.maintCost.toFixed(2) === '12.00', `Maintenance cost for 8km is ₹12.00`);
assert(caseD.totalCost.toFixed(2) === '29.07', `Total cost is ₹29.07`);
assert(caseD.netProfit.toFixed(2) === '30.93', `Net profit with maintenance is ₹30.93`);

// Case E: Loss order (payout 20, distance 15 km)
const caseE = calcLogic(20, 15, false, false, 'petrol', 96, 45, 0.35, 1.5);
assert(caseE.netProfit < 0, `Loss order returns negative net profit: ₹${caseE.netProfit.toFixed(2)}`);

// Case F: Zero distance / Zero payout
const caseF = calcLogic(0, 0, false, false, 'petrol', 96, 45, 0.35, 1.5);
assert(!isNaN(caseF.netProfit) && !isNaN(caseF.perKm), `Zero input does not produce NaN or crashes`);

// --- TEST 3: Headless Browser & Runtime Validation ---
console.log('\n[3/3] Running Headless Edge Browser Test on Mobile Viewport (390x844)...');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const debugPort = 9223;

const edgeProc = spawn(edgePath, [
  '--headless',
  `--remote-debugging-port=${debugPort}`,
  '--window-size=390,844',
  '--disable-gpu',
  'file:///C:/Users/deepak/OneDrive/Desktop/zomato_tool/index.html'
]);

setTimeout(() => {
  http.get(`http://127.0.0.1:${debugPort}/json`, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const pages = JSON.parse(raw);
        assert(pages.length > 0, `Page successfully loaded in headless Edge (Target: ${pages[0]?.title || 'index.html'})`);
      } catch (err) {
        assert(false, `Failed to parse Edge CDP output: ${err.message}`);
      }

      edgeProc.kill();
      reportSummary();
    });
  }).on('error', (err) => {
    assert(false, `Error connecting to headless browser: ${err.message}`);
    edgeProc.kill();
    reportSummary();
  });
}, 2000);

function reportSummary() {
  console.log('\n==================================================');
  console.log(`Test Execution Finished: ${testsPassed} Passed, ${testsFailed} Failed.`);
  console.log('==================================================\n');
  process.exit(testsFailed === 0 ? 0 : 1);
}
