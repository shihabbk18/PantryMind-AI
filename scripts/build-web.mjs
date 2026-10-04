import {mkdir, copyFile,readFile,access,readdir} from 'node:fs/promises';
import {calculateNutrition,recipeNutrition,recipeRequirements} from '../web/core.mjs';
import {dishCatalog} from '../web/estimation.mjs';
await mkdir(new URL('../web/data/', import.meta.url), {recursive:true});
await copyFile(new URL('../assets/data/nutrition.json', import.meta.url),new URL('../web/data/nutrition.json', import.meta.url));
const nutrition=JSON.parse(await readFile(new URL('../web/data/nutrition.json',import.meta.url),'utf8'));
const foods=new Map(nutrition.ingredients.map(f=>[f.id,f]));
const recipes=JSON.parse(await readFile(new URL('../web/data/recipes.json',import.meta.url),'utf8'));
for(const recipe of recipes){recipeRequirements(recipe);recipeNutrition(recipe,foods);await access(new URL(`../web/images/${recipe.image}.jpg`,import.meta.url));}
for(const dish of dishCatalog())calculateNutrition(dish.ingredients,foods);
const sw=await readFile(new URL('../web/sw.js',import.meta.url),'utf8');
const files=sw.match(/const FILES=\[([^\]]+)\]/)[1].split(',').map(s=>s.trim().slice(1,-1));
for(const file of files)await access(new URL('../web/'+file,import.meta.url));
for(const photo of await readdir(new URL('../web/images/',import.meta.url)))if(!files.includes('images/'+photo))throw new Error(`Photograph not in offline cache: ${photo}`);
console.log(`Production files verified: ${foods.size} USDA foods, ${recipes.length} recipes, ${dishCatalog().length} serving templates, ${files.length} offline assets. No bundling step is needed for the static site.`);
