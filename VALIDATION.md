# Current intelligence repair validation

4 October 2026. `node --test tests/*.test.mjs`: **37 passed, 0 failed**. Production build validates **53 USDA foods, 43 recipes, 48 serving templates, 40 offline assets**. Syntax check passed for app.mjs.

Pantry regressions cover all six requested cases, strict essential availability, optional omissions, query isolation from saved stock, regional aliases, deterministic nutrition and Small/Medium/Large scaling. Local browser verification changed the typed list to chicken/rice/garlic while four saved potato/egg pantry items remained: ready recommendations were Garlic chicken & rice and Plain rice bowl, with no potato/egg contamination.

Actual local CLIP burger inference returned Burger at rounded 72% with automatic 540 kcal, 39.3 g protein, 34.0 g carbs, 26.9 g fat. Every ingredient row displayed Recipe assumption; oil was not represented as visually measured. Large produced 810 kcal and Small 270 kcal automatically. These are template estimates, not nutrition ground truth or measured portion sizes.

Additional actual local inference: Pizza led at rounded 64%, calculating 444 kcal, 17.2 g protein, 53.0 g carbs and 17.7 g fat. Plain rice led at 37%, calculating 260 kcal, 5.4 g protein, 56.3 g carbs and 0.6 g fat. Scores are vocabulary-relative, not calibrated probabilities; changed prompts are not an accuracy benchmark.

Automated pantry cases: A returns potato omelette, potato/egg skillet and aloo bhorta as ready; egg-potato tomato stew is separately almost possible with tomato missing. B returns garlic chicken/rice and plain rice; absent oil is an omitted optional in the garlic recipe. C returns four-ingredient banana pancakes only. D returns plain rice only. E returns nothing. F replaces matching stock with chicken/rice/garlic while leaving saved pantry untouched. Names alone cannot guarantee enough actual stock: all cooking amounts remain standard serving assumptions.

Photographs: 17 licensed local assets, including actual banana pancakes and a credited potato omelette; photos remain serving illustrations and can differ from a recipe's optional garnishes. No paid image generation was introduced. All 43 recipes have validated essential/optional metadata and usable licensed image references.

A real tiger photograph produced a non-food warning and blank nutrition. Local browser pantry query flour/banana/milk/egg returned only four-ingredient banana pancakes (379 kcal per serving), despite unrelated saved stock. Public deployment verification is recorded after publication.

---

## Historical version 2.0 validation (superseded recommendation behavior)

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

## Verified public deployment

[GitHub Actions run 37207264665](https://github.com/shihabbk18/PantryMind-AI/actions/runs/37207264665) completed successfully for application commit `38cee23097fcf95627117593cc61441626e8e34f`. Public HTTPS responses returned 200 and served the CLIP worker, diary controls and all 40 recipes at [the live site](https://shihabbk18.github.io/PantryMind-AI/).

The deployed browser ran the actual burger model: 72% leading relative score and the same 540 kcal estimate. Large portion changed the estimate to 810 kcal and returning to Medium restored it. A saved Lunch entry survived reload with its photo and all four daily totals. Existing version 1 pantry records remained readable after the IndexedDB upgrade. The full catalog produced the same three names-only recommendations as local testing. Saving a favorite and adding/checking the 180 g tomato shortage both persisted after reload.

At a 390 × 844 viewport, pantry and diary layouts were usable with no horizontal overflow (document width 375 px, excluding the scrollbar). Four diary totals arranged in two columns. Local diary editing changed the existing record's name/category without duplicating it; grocery checkbox state also persisted. [Desktop scanner screenshot](docs/website.png) and [mobile diary screenshot](docs/mobile-diary.png) show actual public results.

The first visit after publication used the older offline cache; reloading after the new cache installed activated version 2. No physical-phone camera or installation success is claimed.
