import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {calculateNutrition,rankRecipes,recipeNutrition,recipeMatch,parsePantryQuantity} from '../web/core.mjs';
const data=JSON.parse(readFileSync(new URL('../web/data/nutrition.json',import.meta.url),'utf8'));
const foods=new Map(data.ingredients.map(f=>[f.id,f]));
const recipes=JSON.parse(readFileSync(new URL('../web/data/recipes.json',import.meta.url),'utf8'));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`);
test('per-100g calculation agrees with USDA rice and egg records',()=>{
 const {total,breakdown}=calculateNutrition([{food:'rice_cooked',grams:200},{food:'egg',grams:50}],foods);
 near(total.kcal,260+foods.get('egg').kcal/2);near(total.protein,5.38+foods.get('egg').protein/2);
 near(total.carbs,56.34+foods.get('egg').carbs/2);near(total.fat,.56+foods.get('egg').fat/2);
 assert.equal(breakdown.length,2);
});
test('hidden oil is counted only when explicitly supplied',()=>{
 const a=calculateNutrition([{food:'rice_cooked',grams:100}],foods).total;
 const b=calculateNutrition([{food:'rice_cooked',grams:100},{food:'olive_oil',grams:10}],foods).total;
 near(b.kcal-a.kcal,foods.get('olive_oil').kcal/10);near(b.fat-a.fat,10);
});
test('unknown foods, empty and invalid quantities are rejected',()=>{
 assert.throws(()=>calculateNutrition([],foods),/at least one/);
 assert.throws(()=>calculateNutrition([{food:'unknown',grams:10}],foods),/No nutrition data/);
 assert.throws(()=>calculateNutrition([{food:'egg',grams:''}],foods),/Confirm/);
 for(const q of [-1,0,Infinity,NaN,100001,'oops'])assert.throws(()=>calculateNutrition([{food:'egg',grams:q}],foods),/quantity/);
});
test('raw and cooked records remain distinct',()=>{
 assert.notEqual(foods.get('rice_dry').kcal,foods.get('rice_cooked').kcal);
 near(calculateNutrition([{food:'rice_dry',grams:100}],foods).total.kcal,365);
});
test('53 source-backed records cover every recipe ingredient',()=>{
 assert.equal(foods.size,53);assert.match(data.source,/USDA/);
 for(const f of foods.values())assert.ok(Number.isInteger(f.fdc_id)&&f.source_description);
 for(const r of recipes){assert.ok(r.ingredients.every(p=>foods.has(p.food)));assert.ok(recipeNutrition(r,foods).kcal>0);assert.ok(existsSync(new URL(`../web/images/${r.image}.jpg`,import.meta.url)));}
});
test('complete stock gives full quantity coverage',()=>{
 const r=recipes.find(r=>r.id==='egg-rice'),results=rankRecipes(recipes,r.ingredients,foods);
 assert.equal(results[0].recipe.id,r.id);near(results[0].coverage,1);assert.deepEqual(results[0].missing,[]);
});
test('insufficient quantities explicitly include present-but-short items',()=>{
 const r=recipes[0],result=recipeMatch(r,[{food:'rice_cooked',grams:100}],foods);assert.equal(result.ready,false);assert.deepEqual(rankRecipes([r],[{food:'rice_cooked',grams:100}],foods),[]);
 near(result.missing.find(p=>p.food==='rice_cooked').grams,250);
 near(result.missing.find(p=>p.food==='egg').grams,100);
 assert.ok(result.coverage>0&&result.coverage<1);assert.deepEqual(rankRecipes(recipes,[],foods),[]);
});
test('duplicate rows are aggregated for matching',()=>{
 const r={...recipes[0],ingredients:[{food:'egg',grams:50},{food:'egg',grams:50}],essentialIngredients:['egg'],optionalIngredients:[]};
 const result=recipeMatch(r,[{food:'egg',grams:30},{food:'egg',grams:20}],foods);assert.equal(result.ready,false);
 near(result.coverage,.5);near(result.missing[0].grams,50);
});
test('diet and calorie preferences filter actual computed macros',()=>{
 const pantry=[...foods.keys()].map(food=>({food,grams:1000}));
 const vegan=rankRecipes(recipes,pantry,foods,{preference:'vegan',limit:20});assert.ok(vegan.length&&vegan.every(r=>r.recipe.tags.includes('vegan')));
 const range=rankRecipes(recipes,pantry,foods,{minKcal:300,maxKcal:600,limit:20});assert.ok(range.every(r=>r.macros.kcal>=300&&r.macros.kcal<=600));
 assert.throws(()=>rankRecipes(recipes,pantry,foods,{minKcal:700,maxKcal:200}),/minimum/);
 assert.throws(()=>rankRecipes(recipes,pantry,foods,{maxKcal:NaN}),/minimum/);
});
test('ranking is deterministic and recipe macros are per serving',()=>{
 const pantry=[{food:'egg',grams:200},{food:'olive_oil',grams:40}];assert.deepEqual(rankRecipes(recipes,pantry,foods),rankRecipes(recipes,pantry,foods));
 const r=recipes[0],full=calculateNutrition(r.ingredients,foods).total,serving=recipeNutrition(r,foods);
 for(const n of ['kcal','protein','carbs','fat'])near(serving[n],full[n]/r.servings);
});
test('egg piece conversion is an explicit approximation',()=>{
 assert.equal(parsePantryQuantity('egg','4','pieces'),200);assert.equal(parsePantryQuantity('tomato','150','g'),150);
 for(const value of ['',0,-1,'oops'])assert.throws(()=>parsePantryQuantity('egg',value,'g'));
 assert.throws(()=>parsePantryQuantity('rice_cooked',2,'pieces'),/only/);
 assert.throws(()=>parsePantryQuantity('egg',1.5,'pieces'),/whole numbers/);
});
test('offline cache points to real assets',()=>{
 const sw=readFileSync(new URL('../web/sw.js',import.meta.url),'utf8');
 const files=sw.match(/const FILES=\[([^\]]+)\]/)[1].split(',').map(s=>s.trim().slice(1,-1));
 for(const f of files)assert.ok(existsSync(new URL('../web/'+f,import.meta.url)),f);
});
