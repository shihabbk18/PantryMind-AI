# Current fix validation

4 October 2026. The existing website and GitHub Pages pipeline were patched, not rebuilt.

## Automated checks

`node --test tests/core.test.mjs tests/flows.test.mjs`: 19 meaningful checks cover USDA arithmetic, raw/cooked forms, invalid inputs, source consistency, pantry shortages, deterministic ranking, serving scaling, unsupported/low-score model outputs, names-only parsing, aliases, duplicate names, optional measured stock, raw ingredients used in cooked recipes, and offline asset existence.

## Actual browser checks

- Uploaded a licensed burger photograph; the real Food-101 classifier predicted hamburger. Initial nutrition appeared automatically: 540 kcal, 39.3 g protein, 34.0 g carbs, 26.9 g fat from the declared ingredient assumptions.
- Uploaded a different pizza photograph; the classifier predicted pizza. Initial nutrition: 444 kcal, 17.2 g protein, 53.0 g carbs, 17.7 g fat using the two-slice assumption. These are template estimates, not measured photo nutrition.
- Tested worker-based recognition with the actual burger photo again; the same result appeared without mandatory edits or a recipe dropdown.
- Entered potato, egg, onion, olive oil without weights. Three pictured ideas appeared: Spanish-style omelette, potato/egg tomato stew, rustic potato/egg skillet. Standard recipe macros and short instructions were shown.
- Existing locally saved pantry, favorite, and meal records remained readable after the patch. No IndexedDB schema change was needed.

## Limitations

Photo tests demonstrate two actual inference calls, not a general accuracy benchmark. The model chooses one dominant Food-101 dish; exact portion mass, hidden ingredients, non-food rejection, and mixed-meal segmentation are unverified or unsupported. 29 ingredient templates cover common dishes; unsupported classes show an explicit failure rather than fake nutrition. The first model download needs internet and about 93 MB, plus the bundled runtime. Browser cache can be evicted. CPU inference can take tens of seconds. Physical-device camera testing remains unverified. Recipe pictures are licensed bundled illustrations, not generated images.

## Earlier verified baseline

# Executed validation

Validated on 4 October 2026 using Node.js and the Codex in-app Chromium browser.

## Automated checks

`node --test tests/core.test.mjs`: **12 passed, 0 failed.** Covers USDA arithmetic, explicitly entered oil, invalid/unknown ingredients, raw/cooked separation, catalog and recipe consistency, exact coverage, insufficient quantities, duplicates, diet/calorie filtering, deterministic ranking, per-serving nutrition, egg conversion, and cache asset existence.

## Browser checks

- 200 g cooked rice displayed 260 kcal, 5.4 g protein, 56.3 g carbs, 0.6 g fat.
- Saved Verified rice lunch and read it in My Kitchen.
- Saved cooked rice 350 g, raw egg 100 g, olive oil 30 g to the pantry.
- Three recommendations appeared with computed per-serving macros and shortage counts.
- Egg fried rice details correctly listed carrot 80 g, peas 80 g, onion 60 g, soy sauce 15 g missing; rice, eggs, and oil available.
- Saved a favorite, reloaded, and verified pantry, favorite, and meal persistence.
- Selected an actual local JPEG through the browser chooser; it decoded and displayed with manual-confirmation guidance.
- Stopped the local HTTP server, reloaded, and opened My Kitchen: application, recipe images, catalog, and saved records remained available.

## Public deployment

GitHub Actions [run 37155276074](https://github.com/shihabbk18/PantryMind-AI/actions/runs/37155276074) completed successfully for commit e276b00. The live HTTPS website loaded its catalog, registered its service worker, and calculated 200 g cooked rice correctly. The deployed interface was inspected at desktop width; local browser checks also covered the narrow mobile layout. A screenshot is included in docs/website.png.

## Remaining checks

No physical Android/iOS camera or device was available. File selection was tested on desktop. Automatic recognition and image generation are absent. Browser storage can be cleared/evicted; no cloud backup exists. Public deployment is verified separately through GitHub Actions and the live page.
