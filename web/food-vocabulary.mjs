// Candidate descriptions are inputs to CLIP, not fabricated classifier outputs.
export const FOOD_LABELS=[
 ['hamburger','Burger','a hamburger or cheeseburger in a bread bun'],
 ['pizza','Pizza','pizza with cheese and tomato sauce'],
 ['plain_rice','Plain rice','a bowl of plain cooked white rice'],
 ['fried_rice','Fried rice','fried rice with eggs and vegetables'],
 ['biryani','Chicken biryani','Bangladeshi chicken biryani with spiced rice and chicken'],
 ['khichuri','Khichuri','Bangladeshi khichuri, soft yellow rice cooked with lentils'],
 ['dal','Dal','a bowl of yellow lentil dal soup'],
 ['chicken_curry','Rice with chicken curry','chicken curry served with rice'],
 ['chicken_curry_only','Chicken curry','a bowl of chicken curry without rice'],
 ['vegetable_curry','Vegetable curry','a bowl of vegetable curry with potatoes and vegetables'],
 ['beef_curry','Beef curry','a bowl of Bangladeshi beef curry'],
 ['fish_curry','Fish curry','Bengali fish curry with tomato gravy'],
 ['egg_curry','Egg curry','boiled eggs in curry sauce'],
 ['mixed_meal','Mixed rice plate','a mixed meal plate with rice, curry, lentils and vegetables'],
 ['club_sandwich','Chicken sandwich','a chicken sandwich with bread and lettuce'],
 ['grilled_cheese_sandwich','Cheese sandwich','a toasted grilled cheese sandwich'],
 ['pasta','Tomato pasta','pasta with red tomato sauce'],
 ['spaghetti_bolognese','Meat sauce pasta','spaghetti with ground beef and tomato sauce'],
 ['spaghetti_carbonara','Creamy egg pasta','spaghetti carbonara with creamy egg sauce'],
 ['macaroni_and_cheese','Macaroni and cheese','macaroni pasta with cheese sauce'],
 ['lasagna','Lasagna','a slice of layered lasagna pasta'],
 ['omelette','Omelette','a cooked egg omelette'],
 ['scrambled_eggs','Scrambled eggs','scrambled eggs on a plate'],
 ['boiled_eggs','Boiled eggs','peeled hard boiled eggs'],
 ['fried_egg','Fried eggs','fried eggs sunny side up'],
 ['paratha','Paratha','Bengali flatbread paratha or roti'],
 ['aloo_bhorta','Aloo bhorta','Bangladeshi mashed potato bhorta with onion'],
 ['chickpea_curry','Chickpea curry','a bowl of chickpea curry chana masala'],
 ['samosa','Samosa','fried triangular samosa pastry with potato filling'],
 ['vegetable_salad','Vegetable salad','fresh cucumber and tomato vegetable salad'],
 ['caesar_salad','Caesar salad','a caesar salad with lettuce and croutons'],
 ['caprese_salad','Caprese salad','tomato and mozzarella caprese salad'],
 ['greek_salad','Greek-style salad','Greek salad with cucumber tomatoes and cheese'],
 ['grilled_salmon','Grilled fish','a cooked salmon fish fillet'],
 ['steak','Beef steak','a grilled beef steak'],
 ['french_fries','French fries','fried potato french fries'],
 ['pancakes','Pancakes','a stack of pancakes'],
 ['french_toast','French toast','fried egg-coated bread French toast'],
 ['oatmeal','Oatmeal','a bowl of oatmeal porridge with banana'],
 ['fruit_salad','Fruit salad','a bowl of mixed fresh fruit'],
 ['hummus','Hummus','a bowl of chickpea hummus dip'],
 ['guacamole','Guacamole','a bowl of mashed avocado guacamole'],
 ['risotto','Risotto','creamy rice risotto with mushrooms'],
 ['bibimbap','Rice and egg bowl','a mixed vegetable rice bowl topped with an egg'],
 ['garlic_bread','Garlic bread','slices of toasted garlic bread'],
 ['cheese_plate','Cheese plate','a plate of sliced cheese']
].map(([label,name,description])=>({label,name,description,kind:'food'}));
export const NONFOOD_LABELS=[
 ['nonfood_person','Person','a person or a portrait photograph'],
 ['nonfood_animal','Animal','an animal such as a cat, dog or tiger'],
 ['nonfood_landscape','Landscape','a landscape with trees mountains or a beach'],
 ['nonfood_computer','Computer','a computer laptop keyboard or electronics'],
 ['nonfood_document','Document','a printed document book or screenshot of text'],
 ['nonfood_vehicle','Vehicle','a car bicycle or other vehicle'],
 ['nonfood_building','Building','a building or a room interior'],
 ['nonfood_object','Household object','a household object such as a shoe bag or bottle']
].map(([label,name,description])=>({label,name,description,kind:'nonfood'}));
export const IMAGE_LABELS=[...FOOD_LABELS,...NONFOOD_LABELS];
// Heuristic policy, not calibrated probabilities or an accuracy guarantee.
export function assessPredictions(predictions){
 if(!Array.isArray(predictions)||!predictions.length||predictions.some(p=>!p.label||!Number.isFinite(p.score)||p.score<0||p.score>1))throw new Error('The image model returned invalid predictions. Try again or search for a dish.');
 const sorted=[...predictions].sort((a,b)=>b.score-a.score),first=sorted[0];
 const nonfood=sorted.filter(p=>p.kind==='nonfood').reduce((sum,p)=>sum+p.score,0);
 if(first.kind==='nonfood'||nonfood>.5)return {status:'nonfood',predictions:sorted.slice(0,3),message:'This looks like a non-food image. No nutrition was calculated. Choose a food photo, or search for a dish manually.'};
 const margin=first.score-(sorted[1]?.score||0);
 if(first.score<.08||margin<.012)return {status:'uncertain',predictions:sorted.filter(p=>p.kind==='food').slice(0,3),message:'Unknown Food: the leading guesses are too close or weak. Choose a plausible prediction below or search for a dish. No automatic nutrition has been calculated.'};
 return {status:'selected',best:first,predictions:sorted.filter(p=>p.kind==='food').slice(0,3)};
}
