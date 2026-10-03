// Assumed edible serving weights, not measurements extracted from a photograph.
// All nutrient values still come exclusively from the USDA catalog.
const serving = (name, ingredients, note='') => ({name, ingredients:ingredients.map(([food,grams])=>({food,grams})),note});
const dishes = {
 hamburger:serving('Burger',[['bread',75],['beef',125],['cheddar',20],['tomato',25],['lettuce',10],['olive_oil',5]],'Assumes one burger, a raw-weight-equivalent lean beef patty, whole-wheat bread as a bun proxy, cheese and oil. Sauce and patty composition may differ.'),
 pizza:serving('Pizza',[['flour',65],['mozzarella',45],['tomato',60],['olive_oil',7]],'Assumes two medium cheese-pizza slices; flour is the dry crust ingredient, not cooked crust mass. Toppings are unknown.'),
 fried_rice:serving('Fried rice',[['rice_cooked',220],['egg',50],['carrot',30],['peas',30],['onion',20],['canola_oil',12],['soy_sauce',10]],'Assumes one bowl of egg-and-vegetable fried rice. Meat and hidden oil may differ.'),
 chicken_curry:serving('Rice with chicken curry',[['rice_cooked',180],['chicken_cooked',100],['onion',40],['tomato',70],['yogurt',35],['canola_oil',10]],'Assumes one rice-and-curry plate. The classifier detects curry, not whether rice is present; coconut milk, cream and spices are not identified.'),
 club_sandwich:serving('Chicken sandwich',[['bread',90],['chicken_cooked',80],['lettuce',15],['tomato',30],['cheddar',20],['olive_oil',5]],'Assumes one chicken sandwich; bread, filling and sauce vary.'),
 grilled_cheese_sandwich:serving('Grilled cheese sandwich',[['bread',70],['cheddar',40],['butter',10]]),
 spaghetti_bolognese:serving('Pasta with meat sauce',[['pasta_cooked',220],['beef',90],['tomato',100],['onion',35],['olive_oil',8]],'Beef uses raw ingredient weight, not a measured cooked portion.'),
 spaghetti_carbonara:serving('Creamy egg pasta',[['pasta_cooked',220],['egg',50],['cheddar',25],['olive_oil',8]],'Cheddar is a cheese proxy. Bacon/pork is not in the catalog and is omitted; this estimate can substantially undercount it.'),
 macaroni_and_cheese:serving('Macaroni and cheese',[['pasta_cooked',200],['cheddar',50],['milk',70],['butter',10]]),
 lasagna:serving('Lasagna',[['pasta_cooked',140],['beef',80],['tomato',100],['mozzarella',45],['olive_oil',7]],'Assumes one serving; raw beef ingredient equivalent and cheese/sauce assumptions.'),
 omelette:serving('Omelette',[['egg',100],['onion',25],['tomato',35],['olive_oil',7]],'Assumes two eggs; cheese and fillings are unknown.'),
 deviled_eggs:serving('Deviled eggs',[['egg_boiled',100],['olive_oil',8]],'Assumes two eggs with oil as a dressing proxy.'),
 eggs_benedict:serving('Eggs on toast',[['bread',60],['egg',100],['butter',15]],'Bread is a muffin proxy; meat and hollandaise are not identified and can change totals.'),
 french_toast:serving('French toast',[['bread',70],['egg',50],['milk',50],['butter',8],['honey',15]]),
 pancakes:serving('Pancakes',[['flour',60],['egg',30],['milk',90],['butter',8],['honey',15]]),
 french_fries:serving('French fries',[['potato',180],['canola_oil',18]],'Assumes one side portion and approximate retained oil.'),
 caesar_salad:serving('Caesar-style salad',[['lettuce',120],['bread',25],['cheddar',20],['olive_oil',15]],'Cheddar and oil are dressing/cheese proxies; chicken is not assumed.'),
 greek_salad:serving('Greek-style salad',[['tomato',100],['cucumber',100],['onion',25],['cheddar',35],['olive_oil',10]],'Cheddar proxies feta; olives are not in the catalog and are omitted.'),
 caprese_salad:serving('Caprese salad',[['tomato',150],['mozzarella',70],['olive_oil',8]]),
 risotto:serving('Risotto',[['rice_cooked',230],['mushroom',50],['onion',30],['butter',10],['cheddar',20]],'Assumes a mushroom risotto; rice and cheese are ingredient proxies.'),
 bibimbap:serving('Rice, vegetables and egg',[['rice_cooked',200],['egg',50],['carrot',50],['spinach',40],['beef',60],['canola_oil',8]],'Assumes one mixed rice bowl; sauces are unknown.'),
 grilled_salmon:serving('Salmon',[['salmon',160],['olive_oil',5]],'Salmon uses raw-weight equivalent. Sides are not included.'),
 steak:serving('Beef serving',[['beef',180],['olive_oil',5]],'Ground lean beef is only a nutrient proxy for steak, in raw-weight equivalent. Sides are not included.'),
 hummus:serving('Hummus',[['chickpeas',100],['olive_oil',12],['lemon',10],['garlic',3]],'Tahini is unavailable in the catalog and omitted; this may undercount fat.'),
 guacamole:serving('Guacamole',[['avocado',100],['tomato',25],['onion',15],['lemon',5]]),
 garlic_bread:serving('Garlic bread',[['bread',80],['butter',15],['garlic',4]]),
 cheese_plate:serving('Cheese plate',[['cheddar',60],['mozzarella',60]],'Assumes 120 g mixed cheese; accompaniments are excluded.'),
 plain_rice:serving('Plain rice',[['rice_cooked',200]],'Assumes one bowl of cooked rice, no oil or sauce.'),
 pasta:serving('Tomato pasta',[['pasta_cooked',220],['tomato',100],['olive_oil',10],['mozzarella',20]])
};
const aliases={burger:'hamburger',cheeseburger:'hamburger',sandwich:'club_sandwich',rice:'plain_rice',rice_with_curry:'chicken_curry',rice_dish:'fried_rice',egg:'omelette',eggs:'omelette',omelet:'omelette',pizza_slice:'pizza'};
export function estimateDish(label, scale=1) {
 const key=String(label).toLowerCase().trim().replace(/[ -]+/g,'_'),template=dishes[aliases[key]||key];
 if(!template)throw new Error(`Recognized ${String(label).replaceAll('_',' ')}, but no reliable ingredient template is available. Add ingredients manually; no nutrition values have been invented.`);
 if(!Number.isFinite(scale)||scale<=0||scale>4)throw new Error('Choose a valid serving size.');
 return {...template,ingredients:template.ingredients.map(p=>({...p,grams:Math.round(p.grams*scale*10)/10})),scale};
}
export function choosePrediction(predictions) {
 if(!Array.isArray(predictions)||!predictions.length)throw new Error('The image model returned no prediction. Try a clearer food photo.');
 const best=predictions[0];
 if(!best.label||!Number.isFinite(best.score)||best.score<0||best.score>1)throw new Error('The image model returned an invalid prediction.');
 if(best.score<.15)throw new Error('The food guess is too uncertain for an automatic nutrition estimate. Try a clearer photo or enter ingredients manually.');
 return best;
}
