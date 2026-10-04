# Third-party notices

## USDA nutrition

50 records derive from FoodData Central SR Legacy, April 2018. Source descriptions, FDC IDs, and digest are preserved in assets/data/nutrition.json and web/data/nutrition.json.

- [USDA documentation](https://fdc.nal.usda.gov/data-documentation/)
- [Source archive](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip)
- SHA-256: `b80817294b8850530aaedf2e515c02593b1824f763a0ff356e5c2081643e6fd0`

No USDA endorsement is claimed. User-confirmed ingredient identity and weights determine the meaning of the estimate.

## Serving photographs

Fourteen Unsplash photographs are bundled under the [Unsplash License](https://unsplash.com/license), permitting free download, copying, modification, distribution, and commercial use. It prohibits selling unmodified images or creating a competing image service. These photographs retain their own license and are not AI-generated.

| Asset | Source |
|---|---|
| salad.jpg | [Original image](https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=82) |
| pasta.jpg | [Original image](https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=82) |
| rice.jpg | [Original image](https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1000&q=82) |
| breakfast.jpg | [Original image](https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=82) |
| burger.jpg | [Original image](https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=82) |
| pizza.jpg | [Original image](https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=82) |
| biryani.jpg | [Original image](https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1000&q=82) |
| curry.jpg | [Original image](https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=82) |
| eggs.jpg | [Original image](https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=82) |
| soup.jpg | [Original image](https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=82) |
| fish.jpg | [Original image](https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=82) |
| sandwich.jpg | [Original image](https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=82) |
| oats.jpg | [Original image](https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1000&q=82) |
| potato.jpg | [Original image](https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=1000&q=82) |

Download URLs are recorded in web/data/photo-credits.json. These are serving suggestions, not evidence of ingredients or calculated nutrition.

Application code, icons, and original recipe templates use the root MIT LICENSE.

## Local image-recognition runtime

- [Transformers.js 3.8.1](https://github.com/huggingface/transformers.js/tree/3.8.1): Apache-2.0, full license in web/vendor/TRANSFORMERS-LICENSE.
- ONNX Runtime Web 1.22.0-dev.20250409-89f8206ba4: MIT, full license in web/vendor/ONNX-LICENSE. The matching JS/WASM binaries are bundled.
- [CLIP ViT-B/32](https://github.com/openai/CLIP), MIT license, full text in web/vendor/CLIP-LICENSE. [Xenova browser-compatible ONNX conversion](https://huggingface.co/Xenova/clip-vit-base-patch32) revision `d15189d7028b43f1d3e65039190477f6af591c2a` is pinned. q8 text and vision weights total 153,621,508 bytes, downloaded by the browser and cached rather than committed. Model publisher examples are not an application accuracy benchmark. No OpenAI API, hosted inference or paid service is used.

Ingredient/portion heuristics and recipe assumptions are original project code/data and are not measurements produced by the classifier.

The burger photograph visible in the documentation screenshot is [Unsplash photo-1568901346375-23c9450c58cd](https://images.unsplash.com/photo-1568901346375-23c9450c58cd), also under the Unsplash License. It was used as an actual recognition test image.
