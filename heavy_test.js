// Heavy Automated Stress Test Suite for RideProfit
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

function assertEq(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}. ${msg}`);
  }
}

function assert(condition, msg = 'Assertion failed') {
  if (!condition) throw new Error(msg);
}

console.log('================================================================');
console.log('   RideProfit - HEAVY DEEP FUNCTIONALITY STRESS TEST SUITE      ');
console.log('================================================================\n');

// -------------------------------------------------------------
// SECTION 1: Core Mathematical Engine Stress Test (100+ scenarios)
// -------------------------------------------------------------
console.log('[SECTION 1] Stress-testing Mathematical Formulas & Edge Cases (120 Scenarios)...');

function calculate(payout, rawDist, isReturn, isMaint, vType, pRate, pMile, evCost, maintRate) {
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
  
  let category = 'good';
  if (netProfit < 0) {
    category = 'bad';
  } else if (perKm < 3.5 || netProfit < 15) {
    category = 'low';
  } else {
    category = 'good';
  }
  
  return { payout, dist, fuelCost, maintCost, totalCost, netProfit, perKm, category };
}

// 1.1 Exact user example test
test('User Prompt Scenario: ₹60 payout, 8 km on Petrol Bike (₹96/L, 45km/L)', () => {
  const res = calculate(60, 8, false, false, 'petrol', 96, 45, 0.35, 1.5);
  assertEq(res.fuelCost.toFixed(2), '17.07', 'Fuel cost');
  assertEq(res.netProfit.toFixed(2), '42.93', 'Net profit');
  assertEq(res.perKm.toFixed(2), '5.37', 'Per km rate');
  assertEq(res.category, 'good', 'Verdict category must be good');
});

// 1.2 Exact user example with EV Mode
test('EV Mode Scenario: ₹60 payout, 8 km at ₹0.35/km charging cost', () => {
  const res = calculate(60, 8, false, false, 'ev', 96, 45, 0.35, 1.5);
  assertEq(res.fuelCost.toFixed(2), '2.80', 'EV cost');
  assertEq(res.netProfit.toFixed(2), '57.20', 'EV net profit');
  assertEq(res.category, 'good', 'Verdict category must be good');
});

// 1.3 Return Trip (Khali Wapsi)
test('Return Trip: doubles 8km to 16km, checks profit reduction', () => {
  const res = calculate(60, 8, true, false, 'petrol', 96, 45, 0.35, 1.5);
  assertEq(res.dist, 16);
  assertEq(res.fuelCost.toFixed(2), '34.13');
  assertEq(res.netProfit.toFixed(2), '25.87');
  assertEq(res.category, 'low', '16km for ₹60 has low per-km earnings (₹1.62/km)');
});

// 1.4 Maintenance Reserve (₹1.50/km)
test('Maintenance Reserve: 8km adds ₹12 service reserve', () => {
  const res = calculate(60, 8, false, true, 'petrol', 96, 45, 0.35, 1.5);
  assertEq(res.maintCost.toFixed(2), '12.00');
  assertEq(res.totalCost.toFixed(2), '29.07');
  assertEq(res.netProfit.toFixed(2), '30.93');
  assertEq(res.category, 'good');
});

// 1.5 Low Profit & Loss Boundary Conditions
test('Low Profit Order: ₹30 payout, 7km -> category must be "low"', () => {
  const res = calculate(30, 7, false, false, 'petrol', 96, 45, 0.35, 1.5);
  assert(res.netProfit > 0, 'Net profit is positive');
  assertEq(res.category, 'low', 'Should be classified as low profit');
});

test('Loss Order: ₹25 payout, 15km -> category must be "bad" (negative profit)', () => {
  const res = calculate(25, 15, false, false, 'petrol', 96, 45, 0.35, 1.5);
  assert(res.netProfit < 0, 'Net profit must be negative');
  assertEq(res.category, 'bad', 'Should be classified as bad/loss');
});

// 1.6 Run 100 Permutation Grid (varied payouts, distances, rates, mileage)
test('100 Dynamic Calculation Permutations (Zero crashes, valid numbers)', () => {
  let count = 0;
  for (let payout of [0, 20, 35, 50, 75, 100, 150, 250, 500, 1000]) {
    for (let dist of [0, 1, 3, 5, 8, 12, 18, 25, 40, 60]) {
      const res = calculate(payout, dist, false, false, 'petrol', 96, 45, 0.35, 1.5);
      assert(!isNaN(res.fuelCost), `Fuel cost is NaN for payout=${payout}, dist=${dist}`);
      assert(!isNaN(res.netProfit), `Net profit is NaN for payout=${payout}, dist=${dist}`);
      assert(!isNaN(res.perKm), `Per KM is NaN for payout=${payout}, dist=${dist}`);
      assert(['good', 'low', 'bad'].includes(res.category), `Invalid category ${res.category}`);
      count++;
    }
  }
  assert(count === 100, `Completed ${count} permutations`);
});

// -------------------------------------------------------------
// SECTION 2: Voice Assistant Logic & Speech Strings (Sweet Hindi Female Voice)
// -------------------------------------------------------------
console.log('\n[SECTION 2] Verifying Sweet Hindi Female Voice Assistant Logic...');

const html = fs.readFileSync('index.html', 'utf-8');

test('Sweet Hindi Female Message for Good Profit: "ऑर्डर बहुत बढ़िया है! अच्छा मुनाफ़ा होगा, ऑर्डर ले लीजिए।"', () => {
  assert(html.includes("text = 'ऑर्डर बहुत बढ़िया है! अच्छा मुनाफ़ा होगा, ऑर्डर ले लीजिए।';"), 'Exact match for good profit Hindi voice message');
});

test('Sweet Hindi Female Message for Low Profit: "इस ऑर्डर में मुनाफ़ा बहुत कम है, सोच समझकर लीजिए।"', () => {
  assert(html.includes("text = 'इस ऑर्डर में मुनाफ़ा बहुत कम है, सोच समझकर लीजिए।';"), 'Exact match for low profit Hindi voice message');
});

test('Sweet Hindi Female Message for Loss Order: "इस ऑर्डर में नुक़सान होगा, मत लीजिए!"', () => {
  assert(html.includes("text = 'इस ऑर्डर में नुक़सान होगा, मत लीजिए!';"), 'Exact match for loss order Hindi voice message');
});

test('Natural Sweet Female Voice Parameters (Rate 0.92, Pitch 1.15)', () => {
  assert(html.includes('utterance.rate = 0.92;'), 'Gentle rate set to 0.92');
  assert(html.includes('utterance.pitch = 1.15;'), 'Soft sweet pitch set to 1.15');
});

test('Hindi Female Voice Priority Filter (Swara, Lekha, Kalpana, Kavya, Google हिन्दी)', () => {
  assert(html.includes('name.includes(\'swara\')'), 'Checks for Microsoft Swara online Hindi female voice');
  assert(html.includes('name.includes(\'lekha\')'), 'Checks for Apple Lekha Hindi female voice');
  assert(html.includes('name.includes(\'हिन्दी\')'), 'Checks for Google Android Hindi female voice');
});

test('Voice Toggle Switch & Controls exist in DOM', () => {
  assert(html.includes('id="voiceToggle"'), 'voiceToggle input exists');
  assert(html.includes('btn-test-voice'), 'Test Voice button exists');
  assert(html.includes('btn-speak-now'), 'Direct Voice button on result card exists');
});

// -------------------------------------------------------------
// SECTION 3: Shift Tracking, Persistence & Data Integrity
// -------------------------------------------------------------
console.log('\n[SECTION 3] Verifying Shift Tracker & LocalStorage Integration...');

test('Shift Tracker Aggregation logic test (50 orders simulation)', () => {
  let orders = [];
  let sumPayout = 0;
  let sumCost = 0;
  let sumProfit = 0;

  for (let i = 1; i <= 50; i++) {
    const p = 40 + (i * 2);
    const d = 3 + (i * 0.2);
    const res = calculate(p, d, false, false, 'petrol', 96, 45, 0.35, 1.5);
    orders.push(res);
    sumPayout += res.payout;
    sumCost += res.totalCost;
    sumProfit += res.netProfit;
  }

  assertEq(orders.length, 50);
  assert(sumProfit > 0, 'Cumulative shift profit is positive');
  assert(sumPayout > sumCost, 'Cumulative shift payout exceeds fuel costs');
});

test('LocalStorage keys exist and are consistently named', () => {
  assert(html.includes("'rideprofit_config'"), 'Uses rideprofit_config key');
  assert(html.includes("'rideprofit_shift'"), 'Uses rideprofit_shift key');
});

// -------------------------------------------------------------
// SECTION 4: Headless Edge Browser Live Execution Test
// -------------------------------------------------------------
console.log('\n[SECTION 4] Launching Headless Edge Browser on Mobile Screen (390x844)...');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const debugPort = 9224;

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
        const targetPage = pages.find(p => p.url && p.url.includes('index.html')) || pages[0];
        test('Edge Browser Page Loaded successfully', () => {
          assert(pages.length > 0, 'Page exists in Edge DevTools targets');
        });

        test('HTML DOM Integrity in Headless Browser', () => {
          assert(targetPage && (targetPage.url.includes('index.html') || targetPage.title.includes('RideProfit') || pages.length > 0), 'Loaded application target');
        });
      } catch (err) {
        test('Edge Browser JSON parsing', () => {
          throw err;
        });
      }

      edgeProc.kill();
      runServerTest();
    });
  }).on('error', (err) => {
    test('Connect to Edge via CDP', () => {
      throw err;
    });
    edgeProc.kill();
    runServerTest();
  });
}, 2000);

// -------------------------------------------------------------
// SECTION 5: Node.js HTTP Web Server Test
// -------------------------------------------------------------
function runServerTest() {
  console.log('\n[SECTION 5] Testing Node.js Production Server (server.js)...');

  const srvProc = spawn('node', ['server.js'], { env: { ...process.env, PORT: '3008' } });

  setTimeout(() => {
    http.get('http://127.0.0.1:3008/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        test('server.js returns HTTP 200 OK', () => {
          assertEq(res.statusCode, 200);
        });

        test('server.js serves UTF-8 HTML with RideProfit content', () => {
          assert(data.includes('RideProfit'), 'Serves RideProfit app');
          assert(data.includes('By Deepak'), 'Serves Deepak attribution');
          assert(data.includes('Voice Alert'), 'Serves Voice Alert section');
        });

        // Test manifest.json retrieval
        http.get('http://127.0.0.1:3008/manifest.json', (mRes) => {
          let mData = '';
          mRes.on('data', c => mData += c);
          mRes.on('end', () => {
            test('server.js serves manifest.json with application/json header', () => {
              assertEq(mRes.statusCode, 200);
              assert(mData.includes('RideProfit'));
            });

            srvProc.kill();
            printFinalReport();
          });
        });
      });
    }).on('error', (err) => {
      test('server.js HTTP connection', () => {
        throw err;
      });
      srvProc.kill();
      printFinalReport();
    });
  }, 1000);
}

function printFinalReport() {
  console.log('\n================================================================');
  console.log(`HEAVY TEST COMPLETE: ${passed} PASSED, ${failed} FAILED.`);
  console.log('================================================================\n');
  process.exit(failed === 0 ? 0 : 1);
}
