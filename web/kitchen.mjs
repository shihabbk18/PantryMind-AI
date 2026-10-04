import {nutrients,zero,calculateNutrition,pantryInventory} from './core.mjs';
export const MEAL_CATEGORIES=['breakfast','lunch','dinner','snacks'];
export function localDate(date=new Date()){
 if(Number.isNaN(date.getTime()))throw new Error('Invalid meal date.');
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validateDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Choose a valid meal date.');
 const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d);
 if(localDate(date)!==value)throw new Error('Choose a valid meal date.');
 return value;
}
export function mealDate(meal){return meal.date||localDate(new Date(meal.createdAt));}
export function dailyNutrition(meals,date){
 validateDate(date);const total=zero(),selected=meals.filter(m=>mealDate(m)===date);
 for(const meal of selected)for(const key of nutrients){const v=meal.total[key];if(!Number.isFinite(v)||v<0)throw new Error('A diary record has invalid nutrition values. Edit or remove it.');total[key]+=v;}
 return {total,meals:selected};
}
export function makeMeal({id,name,date,category,portions,photo=null,createdAt},foods){
 if(!String(name).trim()||String(name).trim().length>100)throw new Error('Give the meal a name of up to 100 characters.');
 if(!MEAL_CATEGORIES.includes(category))throw new Error('Choose breakfast, lunch, dinner or snacks.');
 const {total,breakdown}=calculateNutrition(portions,foods);
 return {id,name:String(name).trim(),date:validateDate(date),category,portions:breakdown.map(p=>({food:p.food,grams:p.grams})),total,photo,createdAt:createdAt||new Date().toISOString()};
}
export function recipeShortages(recipe,pantry,foods){
 const inventory=pantryInventory(pantry,foods),required=new Map();
 for(const p of recipe.ingredients)required.set(p.food,(required.get(p.food)||0)+p.grams);
 return [...required].filter(([food,grams])=>(inventory.get(food)||0)<grams).map(([food,grams])=>({food,grams:grams-(inventory.get(food)||0)}));
}
export function mergeGroceries(existing,recipe,pantry,foods){
 const result=new Map(existing.map(item=>[item.id,{...item,sources:{...(item.sources||{})}}]));
 // One contribution per recipe prevents repeated button clicks inflating quantities.
 for(const item of result.values())if(Object.hasOwn(item.sources,recipe.id)){delete item.sources[recipe.id];item.grams=Object.values(item.sources).reduce((a,b)=>a+b,0);if(!item.grams)result.delete(item.id);}
 for(const shortage of recipeShortages(recipe,pantry,foods)){
  const old=result.get(shortage.food)||{id:shortage.food,food:shortage.food,checked:false,sources:{}};
  old.sources[recipe.id]=shortage.grams;old.grams=Object.values(old.sources).reduce((a,b)=>a+b,0);old.checked=false;result.set(old.id,old);
 }
 return [...result.values()];
}
export function variedRecommendations(matches,limit=3){
 const pool=[...matches],selected=[];
 while(pool.length&&selected.length<limit){
  const score=m=>{let penalty=0;for(const other of selected){const a=new Set(m.recipe.ingredients.map(p=>p.food)),b=new Set(other.recipe.ingredients.map(p=>p.food));const intersection=[...a].filter(f=>b.has(f)).length,union=new Set([...a,...b]).size;penalty=Math.max(penalty,intersection/union*.22+(m.recipe.family&&m.recipe.family===other.recipe.family? .08:0));}return m.coverage-penalty;};
  pool.sort((a,b)=>score(b)-score(a)||a.missing.length-b.missing.length||a.recipe.minutes-b.recipe.minutes||a.recipe.id.localeCompare(b.recipe.id));selected.push(pool.shift());
 }
 return selected;
}
