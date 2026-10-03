"""Extract a compact reproducible ingredient catalog from USDA SR Legacy CSVs."""
import csv
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile

CATALOG = [
('rice_cooked','Rice, cooked','Rice, white, long-grain, regular, enriched, cooked'),
('rice_dry','Rice, dry','Rice, white, long-grain, regular, raw, enriched'),
('chicken_cooked','Chicken breast, cooked','Chicken, broilers or fryers, breast, meat only, cooked, roasted'),
('chicken_raw','Chicken breast, raw','Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw'),
('egg','Egg, raw','Egg, whole, raw, fresh'),
('egg_boiled','Egg, hard-boiled','Egg, whole, cooked, hard-boiled'),
('olive_oil','Olive oil','Oil, olive, salad or cooking'),
('canola_oil','Canola oil','Oil, canola'),
('butter','Butter, salted','Butter, salted'),
('potato','Potato, raw','Potatoes, flesh and skin, raw'),
('onion','Onion, raw','Onions, raw'),
('tomato','Tomato, raw','Tomatoes, red, ripe, raw, year round average'),
('garlic','Garlic, raw','Garlic, raw'),
('carrot','Carrot, raw','Carrots, raw'),
('broccoli','Broccoli, raw','Broccoli, raw'),
('spinach','Spinach, raw','Spinach, raw'),
('pepper','Red pepper, raw','Peppers, sweet, red, raw'),
('mushroom','Mushroom, raw','Mushrooms, white, raw'),
('peas','Green peas, raw','Peas, green, raw'),
('corn','Sweet corn, raw','Corn, sweet, yellow, raw'),
('zucchini','Zucchini, raw','Squash, summer, zucchini, includes skin, raw'),
('cucumber','Cucumber, raw','Cucumber, with peel, raw'),
('lettuce','Romaine lettuce, raw','Lettuce, cos or romaine, raw'),
('avocado','Avocado','Avocados, raw, all commercial varieties'),
('banana','Banana','Bananas, raw'),
('apple','Apple with skin','Apples, raw, with skin (Includes foods for USDA\'s Food Distribution Program)'),
('orange','Orange','Oranges, raw, all commercial varieties'),
('lemon','Lemon juice','Lemon juice, raw'),
('kidney_beans','Kidney beans, cooked','Beans, kidney, red, mature seeds, cooked, boiled, without salt'),
('chickpeas','Chickpeas, cooked','Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt'),
('lentils','Lentils, cooked','Lentils, mature seeds, cooked, boiled, without salt'),
('tofu','Tofu, firm','Tofu, raw, firm, prepared with calcium sulfate'),
('milk','Milk, whole','Milk, whole, 3.25% milkfat, with added vitamin D'),
('yogurt','Yogurt, plain','Yogurt, plain, whole milk'),
('cheddar','Cheddar cheese','Cheese, cheddar (Includes foods for USDA\'s Food Distribution Program)'),
('mozzarella','Mozzarella, whole milk','Cheese, mozzarella, whole milk'),
('oats','Oats, dry','Oats (Includes foods for USDA\'s Food Distribution Program)'),
('pasta_cooked','Pasta, cooked','Pasta, cooked, enriched, without added salt'),
('pasta_dry','Pasta, dry','Pasta, dry, enriched'),
('bread','Whole-wheat bread','Bread, whole-wheat, commercially prepared'),
('flour','Wheat flour','Wheat flour, white, all-purpose, unenriched'),
('sugar','White sugar','Sugars, granulated'),
('honey','Honey','Honey'),
('almonds','Almonds','Nuts, almonds'),
('peanut_butter','Peanut butter, smooth','Peanut butter, smooth style, without salt'),
('salmon','Salmon, raw','Fish, salmon, Atlantic, farmed, raw'),
('tuna','Tuna, canned in water','Fish, tuna, light, canned in water, drained solids (Includes foods for USDA\'s Food Distribution Program)'),
('beef','Ground beef, 90% lean, raw','Beef, ground, 90% lean meat / 10% fat, raw'),
('soy_sauce','Soy sauce','Soy sauce made from soy and wheat (shoyu)'),
('salt','Table salt','Salt, table'),
]


def build(archive, destination):
    with zipfile.ZipFile(archive) as z:
        def rows(name):
            filename = next(n for n in z.namelist() if n.endswith('/' + name))
            return list(csv.DictReader(io.StringIO(z.read(filename).decode('utf-8-sig'))))
        foods = {r['description']:r for r in rows('food.csv')}
        nutrients = rows('food_nutrient.csv')
        by_food = {}
        for row in nutrients:
            if row['nutrient_id'] in {'1008','1003','1004','1005'}:
                by_food.setdefault(row['fdc_id'],{})[row['nutrient_id']] = float(row['amount'])
        result=[]
        for ident, name, description in CATALOG:
            if description not in foods:
                print('MISSING:', ident, description)
                continue
            record=foods[description]; values=by_food[record['fdc_id']]
            if not {'1008','1003','1004','1005'} <= values.keys():
                raise ValueError(f'Missing macros: {description}')
            result.append({'id':ident,'name':name,'fdc_id':int(record['fdc_id']), 'source_description':description,
                           'kcal':values['1008'],'protein':values['1003'],'carbs':values['1005'],'fat':values['1004']})
        if len(result) != len(CATALOG):
            raise SystemExit('Resolve exact source names before exporting.')
        payload={'source':'USDA FoodData Central SR Legacy, April 2018 CSV release',
                 'source_url':'https://fdc.nal.usda.gov/download-datasets/',
                 'archive_sha256':hashlib.sha256(Path(archive).read_bytes()).hexdigest(),
                 'basis':'per 100 grams of the stated raw/cooked food; edible portion', 'ingredients':result}
        Path(destination).parent.mkdir(parents=True,exist_ok=True)
        Path(destination).write_text(json.dumps(payload,indent=2)+'\n',encoding='utf-8')
        print(f'Exported {len(result)} source-backed ingredients')


if __name__=='__main__':
    build(sys.argv[1],sys.argv[2])
