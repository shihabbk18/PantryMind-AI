# PantryMind AI

**Your intelligent kitchen companion.** An offline-first kitchen website with private meal photos, deterministic nutrition calculations, and pantry-based recipe recommendations.

**[Open the live website](https://shihabbk18.github.io/PantryMind-AI/)** · [Validation record](VALIDATION.md) · [Data and image licenses](THIRD_PARTY_NOTICES.md)

![Verified live PantryMind website](docs/website.png)

## Features

- Select a meal photograph or use a supported mobile browser's camera picker. Photos stay on your device.
- Confirm ingredients and quantities manually, add/remove rows, and calculate calories, protein, carbohydrates, and fat.
- Optional recipe templates suggest ingredients, leaving quantities blank until you confirm them.
- Add, edit, and delete pantry ingredients using grams or explicitly approximate egg piece quantities.
- Get up to three quantity-aware recipe matches with dietary/calorie preferences, cooking instructions, and explicit shortages.
- Save favorites, pantry items, and meal nutrition summaries in My Kitchen using IndexedDB.
- Use core features offline after the first successful visit: the service worker caches application files, recipes, catalog, and photographs.

**Recognition limitation:** this release uses manual photo confirmation. It does not classify images, identify food automatically, infer portions, or generate AI images. Recommendations use a transparent matching algorithm. Bundled photographs are licensed serving suggestions and may not depict the exact recipe.

## Try it

1. Open the live website and wait for **Offline ready** before using it without connectivity.
2. Optionally choose a meal photo. Select **Rice, cooked**, enter **200 g**, and calculate: **260 kcal, 5.38 g protein, 56.34 g carbohydrates, 0.56 g fat** before display rounding.
3. Give the meal a name and save it.
4. Add pantry ingredients, select **What can I cook?**, and open a recipe to see exact shortages.
5. Save a recipe and revisit My Kitchen. Records survive reloads in the same browser and origin.

Supporting browsers can install the site as a PWA or add it to the home screen. This release is a website, not a native Android APK. Camera selection depends on browser/device support; gallery selection remains available.

## Local development

Requires Node.js 20+ for tests and Python 3 for the example static server. The website has no package dependencies, backend, API keys, or hosted inference.

```sh
node scripts/build-web.mjs
node --test tests/core.test.mjs
python -m http.server 8010 --bind 127.0.0.1 --directory web
```

Open `http://127.0.0.1:8010/`. Serve files over HTTP rather than opening index.html directly. Service workers require HTTPS or localhost.

## Nutrition and provenance

The catalog contains **50 common ingredients** extracted from USDA FoodData Central **SR Legacy April 2018** CSVs. Each record preserves its FDC ID, exact source description, and energy/macronutrients per 100 g. Raw and cooked forms are distinct.

For each nutrient, sum `ingredient grams / 100 × value per 100 g`. Recipe totals are divided by declared servings. Energy uses USDA values directly; the chart uses approximate 4/4/9 macro energy factors, which can differ from reported calories.

Unknown foods, missing weights, invalid quantities, and incomplete catalog records block calculation. Hidden oils/sauces count only when you add them. Egg pieces approximate 50 g edible mass each; weighing improves accuracy. Brands and preparations vary, so meal results remain estimates.

[USDA documentation](https://fdc.nal.usda.gov/data-documentation/) · [Source archive](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip)

Reproduce the catalog by downloading the archive and running:

```sh
python scripts/import_nutrition.py /path/to/FoodData_Central_sr_legacy_food_csv_2018-04.zip assets/data/nutrition.json
node scripts/build-web.mjs
```

The importer matches exact source descriptions and rejects missing nutrient values. The catalog records the archive SHA-256.

## Recommendation method

The 12 authored recipe templates have explicit weights, servings, times, and instructions. Ingredient coverage is `min(available grams / required grams, 1)`. The score is the mean coverage across distinct ingredients; duplicate amounts are aggregated. Recipes with zero overlap are excluded.

Sort by coverage descending, shortage count ascending, preparation time ascending, then stable ID. Calorie preferences filter calculated per-serving energy. Each suggestion independently uses the pantry; suggestions do not jointly reserve inventory. Partial matches include a shopping list and do not imply everything is available. Dietary tags are recipe metadata, not allergy guarantees.

## Privacy and storage

IndexedDB stores pantry, favorites, and meals; photos are resized locally before saving. Personal records and photos are not sent to a backend. GitHub Pages receives ordinary requests for public files on the initial visit. There are no accounts, cloud backup, synchronization, or analytics integrations. Clearing site data, storage eviction, private browsing expiration, or changing browsers can remove/separate records. Unsaved meal edits are session-only.

## Structure and deployment

```text
web/                 Static website, calculation/ranking engine, IndexedDB, PWA
web/data/            Catalog, recipes, photograph credits
web/images/          Bundled licensed serving photographs
assets/data/         Source catalog with USDA provenance
scripts/             Catalog importer, photograph downloader, web preparation
tests/               Node test suite
.github/workflows/   Tests followed by GitHub Pages deployment
```

The proposed Android/backend architecture was replaced by a static website at the user's request. Nutrition runs deterministically in JavaScript, requiring no Python hosting or internet connection for core use.

GitHub Actions tests and publishes web/ on pushes to main. Set Pages build source to **GitHub Actions**. Relative paths support repository-path hosting. Bump the cache version in web/sw.js when changing cached files.

See [VALIDATION.md](VALIDATION.md) for executed tests and remaining checks. No classifier accuracy, AI performance improvement, native APK, or physical-device camera verification is claimed.

Code and original recipes: MIT. Photographs retain the Unsplash license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
