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
