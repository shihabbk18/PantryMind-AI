export const nutrients = ['kcal','protein','carbs','fat'];
export const zero = () => Object.fromEntries(nutrients.map(n => [n,0]));
export function calculateNutrition(portions, foods) {
  if (!Array.isArray(portions) || !portions.length) throw new Error('Add at least one ingredient before calculating.');
  const total=zero(), breakdown=[];
  for (const p of portions) {
    const food=foods.get(p.food);
    if (!food) throw new Error(`No nutrition data for ${p.name || p.food || 'this ingredient'}. Choose an ingredient from the list.`);
    if (p.grams === '' || p.grams == null) throw new Error(`Confirm the quantity for ${food.name}.`);
    const grams=Number(p.grams);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 100000) throw new Error(`${food.name}: enter a quantity greater than 0 and no more than 100,000 g.`);
    const macros=zero();
    for (const key of nutrients) {
      if (!Number.isFinite(food[key]) || food[key] < 0) throw new Error(`The nutrition record for ${food.name} is incomplete.`);
      macros[key]=food[key]*grams/100; total[key]+=macros[key];
    }
    breakdown.push({food:p.food,name:food.name,grams,...macros});
  }
  return {total,breakdown};
}
export function recipeNutrition(recipe, foods) {
  if (!Number.isInteger(recipe.servings) || recipe.servings < 1) throw new Error('Invalid recipe serving count.');
  const {total}=calculateNutrition(recipe.ingredients,foods);
  return Object.fromEntries(nutrients.map(n => [n,total[n]/recipe.servings]));
}
export function rankRecipes(recipes, pantry, foods, {preference='any',minKcal=null,maxKcal=null,limit=3}={}) {
  const validBound=v => v==null || Number.isFinite(v) && v>=0;
  if (!validBound(minKcal) || !validBound(maxKcal) || minKcal!=null && maxKcal!=null && minKcal>maxKcal) throw new Error('Use a valid calorie range: minimum must be no greater than maximum.');
  if (!['any','vegetarian','vegan'].includes(preference)) throw new Error('Unknown dietary preference.');
  const inventory=pantryInventory(pantry,foods);
  if (!inventory.size) return [];
  const results=[];
  for (const recipe of recipes) {
    if (preference!=='any' && !recipe.tags.includes(preference)) continue;
    const macros=recipeNutrition(recipe,foods);
    if (minKcal!=null && macros.kcal<minKcal || maxKcal!=null && macros.kcal>maxKcal) continue;
    const required=new Map();
    for(const p of recipe.ingredients) required.set(p.food,(required.get(p.food)||0)+p.grams);
    const missing=[]; let coverage=0;
    for(const [food,grams] of required) {
      const available=inventory.get(food)||0;
      coverage+=Math.min(1,available/grams);
      if(available<grams) missing.push({food,grams:grams-available,available,required:grams});
    }
    coverage/=required.size;
    if(coverage>0) results.push({recipe,macros,coverage,missing,namesOnly:pantry.some(p=>p.grams==null)});
  }
  return results.sort((a,b)=>b.coverage-a.coverage || a.missing.length-b.missing.length || a.recipe.minutes-b.recipe.minutes || a.recipe.id.localeCompare(b.recipe.id)).slice(0,limit);
}
export function pantryInventory(pantry,foods) {
  const inventory=new Map();
  for (const item of pantry) {
    if (!foods.has(item.food) || item.grams!=null && (!Number.isFinite(item.grams) || item.grams<=0)) throw new Error('A saved pantry quantity is invalid. Please edit it.');
    // Names-only stock means presence is known, but amount is not measured.
    inventory.set(item.food,item.grams==null?Infinity:(inventory.get(item.food)||0)+item.grams);
    // Names-only raw ingredients can be cooked for a recipe; no mass conversion is asserted.
    if(item.grams==null){const cooked={chicken_raw:'chicken_cooked',rice_dry:'rice_cooked',pasta_dry:'pasta_cooked'}[item.food];if(cooked)inventory.set(cooked,Infinity);}
  }
  return inventory;
}
const foodAliases={potato:'potato',potatoes:'potato',egg:'egg',eggs:'egg',onions:'onion',onion:'onion',oil:'olive_oil',olive_oil:'olive_oil',chicken:'chicken_raw',chicken_breast:'chicken_raw',rice:'rice_cooked',cooked_rice:'rice_cooked',dry_rice:'rice_dry',pasta:'pasta_cooked',tomatoes:'tomato',cheese:'cheddar',beef:'beef',beans:'kidney_beans',lentils:'lentils',chickpeas:'chickpeas',peas:'peas',spinach:'spinach',bread:'bread',milk:'milk',garlic:'garlic',pepper:'pepper',bell_pepper:'pepper',mushrooms:'mushroom',oats:'oats',yoghurt:'yogurt'};
export function resolveIngredient(name,foods) {
 const text=String(name).toLowerCase().trim(),key=text.replace(/[ -]+/g,'_');
 return foods.get(foodAliases[key]||key)||[...foods.values()].find(f=>f.name.toLowerCase()===text);
}
export function parseIngredientNames(text,foods) {
 const names=String(text).split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);
 if(!names.length)throw new Error('Enter at least one ingredient name.');
 const resolved=names.map(name=>({name,food:resolveIngredient(name,foods)})),unknown=resolved.filter(p=>!p.food);
 if(unknown.length)throw new Error(`No nutrition data for: ${unknown.map(p=>p.name).join(', ')}. Choose a supported ingredient; other names have not been saved.`);
 return [...new Map(resolved.map(p=>[p.food.id,{id:p.food.id,food:p.food.id,grams:null}])).values()];
}
export function parsePantryQuantity(food, quantity, unit='g') {
  const q=Number(quantity);
  if(quantity==='' || !Number.isFinite(q) || q<=0 || q>100000) throw new Error('Enter a positive quantity of at most 100,000.');
  if(unit==='pieces') {
    if(food!=='egg' || !Number.isInteger(q)) throw new Error('Pieces are supported only for whole eggs, in whole numbers.');
    if(q*50>100000) throw new Error('The total quantity exceeds 100,000 g.');
    return q*50;
  }
  if(unit!=='g') throw new Error('Unsupported unit. Use grams.');
  return q;
}
