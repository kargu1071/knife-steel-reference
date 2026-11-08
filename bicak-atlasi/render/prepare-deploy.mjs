import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const marker='https://render-origin.bicak-atlasi.invalid';
const value=process.env.RENDER_EXTERNAL_URL;
if(!value)throw new Error('RENDER_EXTERNAL_URL is required for publication');
const origin=new URL(value).origin;
if(!origin.startsWith('https://'))throw new Error('An HTTPS publication URL is required');
const directory=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
let updated=0;
async function walk(dir){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())await walk(full);
  else{
   const text=await fs.readFile(full,'utf8');
   if(text.includes(marker)){await fs.writeFile(full,text.replaceAll(marker,origin));updated++;}
  }
 }
}
await walk(directory);
const home=await fs.readFile(path.join(directory,'index.html'),'utf8');
if(!home.includes(origin)||home.includes(marker))throw new Error('Publication URL replacement failed');
console.log(JSON.stringify({preparedFiles:updated,origin}));
