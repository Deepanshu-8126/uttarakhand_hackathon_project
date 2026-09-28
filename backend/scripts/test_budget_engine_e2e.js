/**
 * Discovery Uttarakhand - Budget Engine & Entity Extraction E2E Automated Verification Suite
 * Tests natural language budget extraction, currency normalization, budgetEngine calculations,
 * data provenance (VERIFIED vs ESTIMATED vs UNKNOWN), and limit/over-budget detection.
 */

import { BudgetEngine } from '../services/budgetEngine.js';
import { extractEntitiesFromText } from '../controllers/agentController.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failed++;
  }
}

async function runBudgetEngineE2ETests() {
  console.log('\n================================================================');
  console.log('  RUNNING BUDGET ENGINE & EXTRACTION E2E VERIFICATION SUITE');
  console.log('================================================================\n');

  // ── TEST GROUP 1: Natural Language Budget Extraction & Normalization ──────
  console.log('[TEST GROUP 1] Natural Language Budget & Entity Extraction');

  const testCases = [
    { input: 'Mera budget 15k hai', expectedBudget: 15000, expectedConstraint: 'EXACT' },
    { input: '₹20,000', expectedBudget: 20000 },
    { input: 'Rs 15,000', expectedBudget: 15000 },
    { input: '15 hazar', expectedBudget: 15000 },
    { input: '15k ke andar', expectedBudget: 15000, expectedConstraint: 'MAXIMUM' },
    { input: 'around 20k', expectedBudget: 20000, expectedConstraint: 'APPROXIMATE' },
    { input: '2 log', expectedTravelers: 2 },
    { input: '5 din', expectedDuration: 5 },
    {
      input: 'Mujhe Kedarnath jana hai, 5 din, 2 log, Rs 15,000 budget mein',
      expectedDest: 'Kedarnath',
      expectedDuration: 5,
      expectedTravelers: 2,
      expectedBudget: 15000
    }
  ];

  for (const tc of testCases) {
    const res = extractEntitiesFromText(tc.input);
    if (tc.expectedBudget !== undefined) {
      assert(res.budget === tc.expectedBudget, `Input "${tc.input}" -> budget extracted: ${res.budget} (expected ${tc.expectedBudget})`);
    }
    if (tc.expectedConstraint !== undefined) {
      assert(res.budgetConstraint === tc.expectedConstraint, `Input "${tc.input}" -> constraint: ${res.budgetConstraint} (expected ${tc.expectedConstraint})`);
    }
    if (tc.expectedTravelers !== undefined) {
      assert(res.travelers === tc.expectedTravelers, `Input "${tc.input}" -> travelers extracted: ${res.travelers} (expected ${tc.expectedTravelers})`);
    }
    if (tc.expectedDuration !== undefined) {
      assert(res.duration === tc.expectedDuration || res.numDays === tc.expectedDuration, `Input "${tc.input}" -> duration extracted: ${res.duration || res.numDays} (expected ${tc.expectedDuration})`);
    }
    if (tc.expectedDest !== undefined) {
      assert(res.destination === tc.expectedDest, `Input "${tc.input}" -> destination: ${res.destination} (expected ${tc.expectedDest})`);
    }
  }

  // ── TEST GROUP 2: BudgetEngine Calculation & Provenance ────────────────────
  console.log('\n[TEST GROUP 2] BudgetEngine Deterministic Calculation & Provenance');

  const budgetResult = await BudgetEngine.calculateBudget({
    durationDays: 5,
    travelersCount: 2,
    budgetPreference: 'Balanced',
    targetBudgetAmount: 15000
  });

  assert(budgetResult.success === true, 'BudgetEngine returned success: true');
  assert(budgetResult.data.summary.days === 5, 'Summary days equals 5');
  assert(budgetResult.data.summary.travelers === 2, 'Summary travelers equals 2');
  assert(budgetResult.data.summary.minCost > 0, `minCost is positive: ₹${budgetResult.data.summary.minCost}`);
  assert(budgetResult.data.summary.maxCost >= budgetResult.data.summary.minCost, `maxCost (₹${budgetResult.data.summary.maxCost}) >= minCost (₹${budgetResult.data.summary.minCost})`);

  // Check Breakdown Categories
  const bd = budgetResult.data.breakdown;
  assert(bd.stay !== undefined, 'Breakdown contains stay category');
  assert(bd.transport !== undefined, 'Breakdown contains transport category');
  assert(bd.food !== undefined, 'Breakdown contains food category');
  assert(bd.food.provenance === 'ESTIMATED', 'Food category is strictly classified as ESTIMATED');
  assert(bd.emergencyBuffer !== undefined, 'Breakdown contains safety emergencyBuffer category');

  // ── TEST GROUP 3: Over-Budget Detection ──────────────────────────────────
  console.log('\n[TEST GROUP 3] Over-Budget Detection & Benchmark Caps');

  const lowBudgetResult = await BudgetEngine.calculateBudget({
    durationDays: 7,
    travelersCount: 2,
    budgetPreference: 'Budget',
    targetBudgetAmount: 5000 // Too low for 7 days
  });

  assert(lowBudgetResult.data.summary.budgetStatus === 'OVER_BUDGET', `Low budget cap detected OVER_BUDGET status: ${lowBudgetResult.data.summary.budgetStatus}`);

  const generousBudgetResult = await BudgetEngine.calculateBudget({
    durationDays: 3,
    travelersCount: 1,
    budgetPreference: 'Luxury',
    targetBudgetAmount: 50000
  });

  assert(generousBudgetResult.data.summary.budgetStatus === 'UNDER_BUDGET', `Generous budget cap detected UNDER_BUDGET status: ${generousBudgetResult.data.summary.budgetStatus}`);

  // ── TEST GROUP 4: Sequential Context Modification & Recalculation Flow ──────
  console.log('\n[TEST GROUP 4] Sequential Context Modification & Recalculation');

  let sessionContext = extractEntitiesFromText("Mujhe Kedarnath jana hai, 5 din, 2 log, Rs 15,000 budget");
  assert(sessionContext.destination === 'Kedarnath' && sessionContext.duration === 5 && sessionContext.travelers === 2 && sessionContext.budget === 15000,
    'Initial prompt populates Kedarnath, 5 days, 2 travelers, 15000 budget');

  // Follow-up 1: "budget 12k karo"
  const mod1 = extractEntitiesFromText("budget 12k karo");
  sessionContext = { ...sessionContext, ...mod1 };
  assert(sessionContext.budget === 12000, `Follow-up 1 "budget 12k karo" updates budget to 12000 (retaining Kedarnath, 5 days, 2 travelers)`);

  const calc1 = await BudgetEngine.calculateBudget({
    durationDays: sessionContext.duration || sessionContext.durationDays,
    travelersCount: sessionContext.travelers,
    targetBudgetAmount: sessionContext.budget
  });
  assert(calc1.data.summary.targetBudgetCap === 12000, 'Recalculated target budget cap reflects 12000');

  // Follow-up 2: "4 log kar do"
  const mod2 = extractEntitiesFromText("4 log kar do");
  sessionContext = { ...sessionContext, ...mod2 };
  assert(sessionContext.travelers === 4, `Follow-up 2 "4 log kar do" updates travelers to 4 (retaining Kedarnath, 5 days, 12k budget)`);

  const calc2 = await BudgetEngine.calculateBudget({
    durationDays: sessionContext.duration || sessionContext.durationDays,
    travelersCount: sessionContext.travelers,
    targetBudgetAmount: sessionContext.budget
  });
  assert(calc2.data.summary.travelers === 4, 'Recalculated travelers count reflects 4');

  // Follow-up 3: "7 din kar do"
  const mod3 = extractEntitiesFromText("7 din kar do");
  sessionContext = { ...sessionContext, ...mod3 };
  assert(sessionContext.duration === 7 || sessionContext.durationDays === 7, `Follow-up 3 "7 din kar do" updates duration to 7 days`);

  const calc3 = await BudgetEngine.calculateBudget({
    durationDays: sessionContext.duration || sessionContext.durationDays,
    travelersCount: sessionContext.travelers,
    targetBudgetAmount: sessionContext.budget
  });
  assert(calc3.data.summary.days === 7, 'Recalculated duration reflects 7 days');

  console.log('\n================================================================');
  console.log(`  E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBudgetEngineE2ETests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
