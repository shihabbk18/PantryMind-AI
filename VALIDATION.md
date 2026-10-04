# PantryMind Web 2.0 validation

4 October 2026. Targeted changes preserve the static JavaScript architecture, USDA catalog, original UI, IndexedDB records, PWA and GitHub Pages workflow. No backend, paid API or Android project was added.

## Executed automated checks

`node --test tests/*.test.mjs`: **28 passed, 0 failed**. Tests cover USDA arithmetic, unknown/invalid inputs, raw/cooked forms, all recipe and image references, all 46 classifier candidates and serving templates, weak/ambiguous/non-food policies, deterministic diverse ranking, dietary/calorie filters, diary date/category validation and edit arithmetic, legacy dates, grocery shortage aggregation and idempotent additions.

`node scripts/build-web.mjs`: passed. Production preparation validates **50 USDA foods, 40 recipes, 48 serving templates and 37 offline assets**. JavaScript syntax checks passed for app, kitchen helpers and worker.

## Actual Chromium browser workflows

| Workflow | Observed result |
|---|---|
| A: real burger photograph | CLIP Burger led at rounded 72% relative score; automatic 540 kcal, 39.3 g protein, 34.0 g carbs, 26.9 g fat. |
| B: real pizza photograph | Pizza led at 67%; automatic 444 kcal, 17.2 g protein, 53.0 g carbs, 17.7 g fat. |
| C: real rice photograph | Plain rice led at 49%; automatic 260 kcal, 5.4 g protein, 56.3 g carbs, 0.6 g fat. |
| D: tiger photograph | Animal led at rounded 100%; non-food message and blank nutrition, no invented meal estimate. |
| E: names-only pantry | Potato, egg, onion, olive oil produced dim bhaji, aloo bhorta and Spanish-style potato omelette from the full 40-recipe release. Pictures, steps and computed per-serving macros appeared. A 300 kcal minimum instead returned omelette, potato/egg tomato stew and potato/egg skillet. |
| F: diary save/reload | Saved the scanned Pizza as Dinner. After reload, its category and 444 kcal daily total persisted. |
| G: groceries | Adding the tomato shortage twice kept it at 180 g for one recipe rather than duplicating it. |

These are real inference calls and arithmetic estimates, not a nutrition ground-truth or general classifier accuracy benchmark. Fixtures: bundled licensed burger/pizza/rice photographs; tiger from the CLIP model card's Transformers.js example (test-only, not distributed). No filename-based classification was used.

## Limits

CLIP compares only bundled descriptions; it cannot measure portions, verify hidden ingredients or segment a mixed plate. Non-food and uncertainty thresholds are heuristic. Bangladeshi labels are supported candidates, without a claim of validated accuracy for every dish. First recognition needs internet and roughly 154 MB of weights plus the bundled runtime; later operation depends on browser cache retention and device memory. Manual search and deterministic nutrition remain available if inference fails. Recipe images illustrate dish families and may differ from the exact recipe. Camera capture and PWA installation on a physical phone remain unverified; no physical device is available. Local browser storage is not cloud backup.

Public deployment verification and final responsive/persistence checks are recorded after publication below.
