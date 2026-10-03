import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {estimateDish,choosePrediction} from '../web/estimation.mjs';
import {parseIngredientNames,rankRecipes,calculateNutrition} from '../web/core.mjs';
const foods=new Map(JSON.parse(readFileSync(new URL('../web/data/nutrition.json',import.meta.url))).ingredients.map(f=>[f.id,f]));
const recipes=JSON.parse(readFileSync(new URL('../web/data/recipes.json',import.meta.url)));
test('burger and pizza estimates compute from explicit catalog ingredients',()=>{
 for(const label of ['hamburger','pizza','fried_rice','chicken_curry','club_sandwich','spaghetti_bolognese','omelette']){
  const estimate=estimateDish(label),result=calculateNutrition(estimate.ingredients,foods);
  assert.ok(result.total.kcal>0);assert.ok(estimate.ingredients.every(p=>foods.has(p.food)&&p.grams>0));
  assert.notDeepEqual(estimateDish('hamburger').ingredients,estimateDish('pizza').ingredients);
 }
});
test('portion scaling scales calculated macros and does not claim measured mass',()=>{
 const a=calculateNutrition(estimateDish('pizza').ingredients,foods).total;
 const b=calculateNutrition(estimateDish('pizza',2).ingredients,foods).total;
 for(const key of Object.keys(a))assert.equal(b[key],a[key]*2);
 assert.throws(()=>estimateDish('pizza',NaN),/serving/);
 assert.throws(()=>estimateDish('unrecognized dish'),/no reliable/);
});
test('bad or low-scoring model outputs do not produce invented estimates',()=>{
 assert.throws(()=>choosePrediction([]),/no prediction/);
 assert.throws(()=>choosePrediction([{label:'pizza',score:.1}]),/too uncertain/);
 assert.throws(()=>choosePrediction([{label:'pizza',score:NaN}]),/invalid/);
 assert.equal(choosePrediction([{label:'hamburger',score:.9}]).label,'hamburger');
});
test('names-only pantry needs no gram quantities and offers three meal ideas',()=>{
 const pantry=parseIngredientNames('potato, egg, onion, olive oil',foods);
 assert.equal(pantry.length,4);assert.ok(pantry.every(p=>p.grams===null));
 const ideas=rankRecipes(recipes,pantry,foods);
 assert.equal(ideas.length,3);assert.equal(ideas[0].recipe.id,'spanish-omelette');
 assert.equal(ideas[0].coverage,1);assert.deepEqual(ideas[0].missing,[]);
 assert.ok(ideas.every(p=>p.namesOnly&&p.macros.kcal>0&&p.recipe.steps.length));
});
test('pantry aliases, duplicates, mixed quantities and unsupported names handled honestly',()=>{
 assert.equal(parseIngredientNames('potatoes; eggs\nonion, egg',foods).length,3);
 assert.throws(()=>parseIngredientNames('egg, mystery-food',foods),/mystery-food/);
 assert.throws(()=>parseIngredientNames('',foods),/at least one/);
 const r=recipes.find(r=>r.id==='spanish-omelette');
 const [idea]=rankRecipes([r],[{food:'egg',grams:null},{food:'potato',grams:10}],foods);
 assert.ok(idea.missing.some(p=>p.food==='potato'&&p.grams===290));
 assert.ok(!idea.missing.some(p=>p.food==='egg'));
});
test('recipe pictures and all nutrition values remain source-based',()=>{
 for(const r of recipes)assert.ok(r.ingredients.every(p=>foods.has(p.food)));
 const source=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 assert.ok(source.includes('id="template"')&&source.includes('class="template-row" hidden'));
 assert.ok(!source.includes('placeholder="Leave blank for names only" required'));
});
test('raw names-only stock can be cooked; measured raw amounts are not converted silently',()=>{
 const recipe={...recipes[0],ingredients:[{food:'chicken_cooked',grams:100}]};
 const [idea]=rankRecipes([recipe],parseIngredientNames('chicken',foods),foods);
 assert.equal(idea.coverage,1);assert.deepEqual(idea.missing,[]);
 assert.deepEqual(rankRecipes([recipe],[{food:'chicken_raw',grams:200}],foods),[]);
 const eggRecipe={...recipes[0],ingredients:[{food:'egg',grams:100}]};
 assert.deepEqual(rankRecipes([eggRecipe],[{food:'egg_boiled',grams:null}],foods),[]);
});
