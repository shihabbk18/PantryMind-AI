# Third-party notices

## USDA nutrition

50 records derive from FoodData Central SR Legacy, April 2018. Source descriptions, FDC IDs, and digest are preserved in assets/data/nutrition.json and web/data/nutrition.json.

- [USDA documentation](https://fdc.nal.usda.gov/data-documentation/)
- [Source archive](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip)
- SHA-256: `b80817294b8850530aaedf2e515c02593b1824f763a0ff356e5c2081643e6fd0`

No USDA endorsement is claimed. User-confirmed ingredient identity and weights determine the meaning of the estimate.

## Serving photographs

Four Unsplash photographs are bundled under the [Unsplash License](https://unsplash.com/license), permitting free download, copying, modification, distribution, and commercial use. It prohibits selling unmodified images or creating a competing image service. These photographs retain their own license and are not AI-generated.

| Asset | Source |
|---|---|
| salad.jpg | [photo-1512621776951-a57141f2eefd](https://images.unsplash.com/photo-1512621776951-a57141f2eefd) |
| pasta.jpg | [photo-1473093295043-cdd812d0e601](https://images.unsplash.com/photo-1473093295043-cdd812d0e601) |
| rice.jpg | [photo-1547592180-85f173990554](https://images.unsplash.com/photo-1547592180-85f173990554) |
| breakfast.jpg | [photo-1490645935967-10de6ba17061](https://images.unsplash.com/photo-1490645935967-10de6ba17061) |

Download URLs are recorded in web/data/photo-credits.json. These are serving suggestions, not evidence of ingredients or calculated nutrition.

Application code, icons, and original recipe templates use the root MIT LICENSE.

## Local image-recognition runtime

- [Transformers.js 3.8.1](https://github.com/huggingface/transformers.js/tree/3.8.1): Apache-2.0, full license in web/vendor/TRANSFORMERS-LICENSE.
- ONNX Runtime Web 1.22.0-dev.20250409-89f8206ba4: MIT, full license in web/vendor/ONNX-LICENSE. The matching JS/WASM binaries are bundled.
- [Swin Food-101 ONNX model](https://huggingface.co/onnx-community/swin-finetuned-food101-ONNX): Apache-2.0, derived from aspis/swin-finetuned-food101. Model revision pinned to e5e50bfc6425aa546f3b4421ca8bd79d0dd610b8; q8 weights are downloaded directly by the browser and cached, not committed to this repository. No hosted inference is used. Model publisher benchmarks are not validation of this application or its serving assumptions.

Ingredient/portion heuristics and recipe assumptions are original project code/data and are not measurements produced by the classifier.

The burger photograph visible in the documentation screenshot is [Unsplash photo-1568901346375-23c9450c58cd](https://images.unsplash.com/photo-1568901346375-23c9450c58cd), also under the Unsplash License. It was used as an actual recognition test image.
