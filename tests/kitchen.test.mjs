import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {FOOD_LABELS,IMAGE_LABELS,assessPredictions} from '../web/food-vocabulary.mjs';
import {dishCatalog,estimateDish} from '../web/estimation.mjs';
import {calculateNutrition,parseIngredientNames,rankRecipes,recipeNutrition} from '../web/core.mjs';
import {localDate,validateDate,mealDate,makeMeal,dailyNutrition,recipeShortages,mergeGroceries,variedRecommendations} from '../web/kitchen.mjs';
const foods=new Map(JSON.parse(readFileSync(new URL('../web/data/nutrition.json',import.meta.url))).ingredients.map(f=>[f.id,f]));
const recipes=JSON.parse(readFileSync(new URL('../web/data/recipes.json',import.meta.url)));
const r=id=>recipes.find(r=>r.id===id),pantry=parseIngredientNames('potato, egg, onion, olive oil',foods);
const prediction=(label,score)=>({...IMAGE_LABELS.find(p=>p.label===label),score});
test('every international and Bangladeshi model candidate has a documented calculable template',()=>{
 assert.equal(FOOD_LABELS.length,46);assert.equal(new Set(IMAGE_LABELS.map(p=>p.description)).size,IMAGE_LABELS.length);
 for(const p of FOOD_LABELS){const e=estimateDish(p.label);assert.ok(e.note.length>20);assert.ok(calculateNutrition(e.ingredients,foods).total.kcal>0);assert.deepEqual(estimateDish(e.name).ingredients,e.ingredients);}
 assert.ok(dishCatalog().length>=46);
});
test('non-food winners and aggregate non-food evidence never auto-calculate food',()=>{
 assert.equal(assessPredictions([prediction('nonfood_animal',.8),prediction('hamburger',.1)]).status,'nonfood');
 assert.equal(assessPredictions([prediction('pizza',.35),prediction('nonfood_person',.3),prediction('nonfood_document',.25)]).status,'nonfood');
});
test('ambiguous scores return Unknown Food, clear leaders return their actual label',()=>{
 assert.equal(assessPredictions([prediction('fried_rice',.3),prediction('biryani',.295)]).status,'uncertain');
 assert.equal(assessPredictions([prediction('pizza',.07),prediction('hamburger',.02)]).status,'uncertain');
 const result=assessPredictions([prediction('hamburger',.1),prediction('pizza',.8)]);assert.equal(result.best.label,'pizza');assert.equal(result.predictions[0].label,'pizza');
 for(const bad of [[],null,[prediction('pizza',NaN)],[prediction('pizza',-1)]])assert.throws(()=>assessPredictions(bad),/invalid predictions/);
});
test('40 authored recipes use licensed local photographs and valid structured nutrition',()=>{
 assert.equal(recipes.length,40);assert.equal(new Set(recipes.map(r=>r.id)).size,40);
 const credits=JSON.parse(readFileSync(new URL('../web/data/photo-credits.json',import.meta.url)));
 for(const recipe of recipes){assert.ok(recipe.minutes>0&&recipe.steps.length>=3&&recipe.description&&recipe.family&&recipe.notes);assert.ok(existsSync(new URL(`../web/images/${recipe.image}.jpg`,import.meta.url)));assert.ok(credits.some(c=>c.file===`images/${recipe.image}.jpg`&&c.license==='Unsplash License'));const m=recipeNutrition(recipe,foods);assert.ok(Object.values(m).every(v=>Number.isFinite(v)&&v>=0));}
});
test('diverse names-only ideas are reproducible and keep dietary/calorie filters',()=>{
 const matches=rankRecipes(recipes,pantry,foods,{limit:40});const a=variedRecommendations(matches);assert.deepEqual(a,variedRecommendations(matches));assert.equal(a.length,3);assert.equal(new Set(a.map(m=>m.recipe.family)).size,3);assert.ok(a.every(m=>m.coverage>0));
 const vegan=variedRecommendations(rankRecipes(recipes,pantry,foods,{limit:40,preference:'vegan',maxKcal:500}));assert.ok(vegan.every(m=>m.recipe.tags.includes('vegan')&&m.macros.kcal<=500));
});
test('diary calculations preserve exact totals across dates, edits and categories',()=>{
 const a=makeMeal({id:'a',name:'Rice',date:'2026-10-04',category:'lunch',portions:[{food:'rice_cooked',grams:200}]},foods);
 const b=makeMeal({id:'b',name:'Egg',date:'2026-10-04',category:'breakfast',portions:[{food:'egg',grams:50}]},foods);
 const c=makeMeal({...b,id:'c',date:'2026-10-03'},foods);
 assert.equal(dailyNutrition([a,b,c],'2026-10-04').total.kcal,a.total.kcal+b.total.kcal);
 const edited=makeMeal({...a,category:'dinner',portions:[{food:'rice_cooked',grams:100}]},foods);assert.equal(edited.id,a.id);assert.equal(edited.createdAt,a.createdAt);assert.equal(edited.total.kcal,130);
 assert.equal(dailyNutrition([edited,b,c],'2026-10-04').meals.length,2);assert.equal(dailyNutrition([],'2026-10-04').total.kcal,0);
});
test('date validation rejects impossible dates and supports legacy meal history',()=>{
 for(const date of ['2026-02-30','2026-13-01','oops','2026-2-01'])assert.throws(()=>validateDate(date),/date/);
 assert.equal(validateDate('2024-02-29'),'2024-02-29');const date=new Date(2026,9,4,23,59);assert.equal(localDate(date),'2026-10-04');assert.equal(mealDate({createdAt:date.toISOString()}),'2026-10-04');
 assert.throws(()=>makeMeal({name:'x',date:'2026-10-04',category:'other',portions:[{food:'egg',grams:50}]},foods),/category|breakfast/);
 assert.throws(()=>makeMeal({name:' ',date:'2026-10-04',category:'lunch',portions:[{food:'egg',grams:50}]},foods),/name/);
});
test('grocery additions aggregate shortages and repeated clicks do not inflate them',()=>{
 const recipe=r('potato-egg-curry');assert.deepEqual(recipeShortages(recipe,pantry,foods),[{food:'tomato',grams:180}]);
 const once=mergeGroceries([],recipe,pantry,foods),twice=mergeGroceries(once,recipe,pantry,foods);assert.deepEqual(once,twice);assert.equal(twice[0].grams,180);
 const more=mergeGroceries(twice,r('tomato-egg-skillet'),pantry,foods);assert.equal(more.find(g=>g.food==='tomato').grams,530);
 const fulfilled=mergeGroceries(once,recipe,[...pantry,{food:'tomato',grams:null}],foods);assert.deepEqual(fulfilled,[]);
});
test('measured pantry shortages and grocery checkbox state survive unrelated additions',()=>{
 const short=recipeShortages(r('spanish-omelette'),[{food:'egg',grams:150}],foods);assert.equal(short.find(p=>p.food==='egg').grams,50);
 const list=mergeGroceries([],r('potato-egg-curry'),pantry,foods);list[0].checked=true;const more=mergeGroceries(list,r('aloo-bhorta'),[],foods);assert.equal(more.find(g=>g.food==='tomato').checked,true);
});
