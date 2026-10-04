import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseIngredientNames,rankRecipes,recipeMatch,recipeRequirements,searchPantry,calculateNutrition} from '../web/core.mjs';
import {variedRecommendations,recipeShortages} from '../web/kitchen.mjs';
import {assessPredictions,IMAGE_LABELS} from '../web/food-vocabulary.mjs';
import {estimateDish} from '../web/estimation.mjs';
const foods=new Map(JSON.parse(readFileSync(new URL('../web/data/nutrition.json',import.meta.url))).ingredients.map(f=>[f.id,f]));
const recipes=JSON.parse(readFileSync(new URL('../web/data/recipes.json',import.meta.url)));
const ready=text=>variedRecommendations(rankRecipes(recipes,parseIngredientNames(text,foods),foods,{limit:99}));
const ids=results=>results.map(m=>m.recipe.id);
test('A potato egg onion oil produces achievable potato/egg dishes and separates missing curry essentials',()=>{
 const stock=parseIngredientNames('potato,egg,onion,olive oil',foods),matches=rankRecipes(recipes,stock,foods,{includeAlmost:true,limit:99});
 assert.ok(ids(ready('potato,egg,onion,olive oil')).includes('spanish-omelette'));
 assert.ok(ids(ready('potato,egg,onion,olive oil')).includes('potato-egg'));
 assert.ok(matches.filter(m=>m.ready).every(m=>m.missing.length===0));
 assert.ok(!matches.some(m=>m.ready&&['chicken-biryani','pizza','tomato-pasta','potato-egg-curry'].includes(m.recipe.id)));
 const curry=matches.find(m=>m.recipe.id==='potato-egg-curry');assert.ok(curry&&!curry.ready&&curry.missing.some(p=>p.food==='tomato'));
});
test('B chicken rice garlic onion gives achievable chicken rice without silently assuming oil',()=>{
 const matches=ready('chicken,rice,garlic,onion'),chicken=matches.find(m=>m.recipe.id==='simple-chicken-rice');assert.ok(chicken&&chicken.ready);assert.ok(chicken.missingOptional.some(p=>p.food==='olive_oil'));assert.ok(!chicken.ingredients.some(p=>p.food==='olive_oil'));
 assert.ok(matches.every(m=>!m.recipe.id.includes('omelette')));
});
test('C flour banana milk egg gives the four-ingredient banana pancakes',()=>{
 const matches=ready('flour,banana,milk,egg');assert.deepEqual(ids(matches),['banana-pancakes']);assert.equal(matches[0].missing.length,0);
});
test('D rice only gives rice only; E empty gives no default recommendations',()=>{
 assert.deepEqual(ids(ready('rice')),['plain-rice']);
 assert.deepEqual(rankRecipes(recipes,[],foods,{includeAlmost:true}),[]);
 assert.equal(rankRecipes(recipes,parseIngredientNames('rice',foods),foods,{includeAlmost:true,limit:99}).length,1);
});
test('F a changed typed query replaces matching stock without modifying saved pantry',()=>{
 const saved=parseIngredientNames('potato,egg,onion,olive oil',foods),before=structuredClone(saved);
 const initial=ids(rankRecipes(recipes,searchPantry('potato,egg,onion',saved,foods),foods,{limit:99}));
 const changed=searchPantry('chicken,rice,garlic',saved,foods),after=ids(rankRecipes(recipes,changed,foods,{limit:99}));
 assert.notDeepEqual(initial,after);assert.ok(after.includes('simple-chicken-rice'));assert.ok(!after.includes('spanish-omelette'));assert.equal(changed.length,3);assert.deepEqual(saved,before);assert.deepEqual(searchPantry('',saved,foods),saved);
});
test('regional synonyms resolve to the same source-backed ingredient records',()=>{
 assert.deepEqual(parseIngredientNames('Potato,Aloo,egg,dim,coriander,cilantro,eggplant,brinjal,chilli,chili',foods).map(p=>p.food),['potato','egg','cilantro','eggplant','chili']);
});
test('all ready recipes satisfy essential amounts, and optional omissions affect nutrition and groceries',()=>{
 for(const r of recipes){recipeRequirements(r);const stock=r.ingredients.filter(p=>r.essentialIngredients.includes(p.food)),m=recipeMatch(r,stock,foods);assert.ok(m.ready);assert.deepEqual(recipeShortages(r,stock,foods),[]);assert.ok(m.ingredients.every(p=>r.essentialIngredients.includes(p.food)));assert.deepEqual(m.macros, Object.fromEntries(Object.entries(calculateNutrition(stock,foods).total).map(([k,v])=>[k,v/r.servings])));}
});
test('same-family ambiguity is explicitly provisional; cross-family and non-food remain fallback',()=>{
 const p=(label,score)=>({...IMAGE_LABELS.find(p=>p.label===label),score});
 const close=assessPredictions([p('biryani',.4),p('fried_rice',.395),p('plain_rice',.2)]);assert.equal(close.status,'selected');assert.equal(close.provisional,true);
 assert.equal(assessPredictions([p('hamburger',.49),p('pizza',.48)]).status,'uncertain');
 assert.equal(assessPredictions([p('nonfood_animal',.9),p('hamburger',.05)]).status,'nonfood');
});
test('photo ingredient quantities retain template provenance and Small/Medium/Large scale exactly',()=>{
 for(const label of ['hamburger','pizza','plain_rice','biryani','khichuri','chicken_curry','fish_curry']){
 const base=estimateDish(label);assert.match(base.visualEvidence,/individual ingredients have not/);assert.ok(base.ingredients.every(p=>p.source==='template'));
 const medium=calculateNutrition(base.ingredients,foods).total;for(const scale of [.5,1.5]){const m=calculateNutrition(estimateDish(label,scale).ingredients,foods).total;for(const key of Object.keys(medium))assert.ok(Math.abs(m[key]-medium[key]*scale)<1e-8);}
 }
});
