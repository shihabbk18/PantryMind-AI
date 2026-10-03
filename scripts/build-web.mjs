import {mkdir, copyFile} from 'node:fs/promises';
await mkdir(new URL('../web/data/', import.meta.url), {recursive:true});
await copyFile(new URL('../assets/data/nutrition.json', import.meta.url),new URL('../web/data/nutrition.json', import.meta.url));
console.log('Prepared web nutrition data from the source-backed catalog.');
