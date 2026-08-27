import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // finding 15 guard: the OWNER's card still lists every place the file was sent
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const own=await g('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100');
     const files=(own.j&&own.j.files)||[];
     const shared=files.filter(f=>Array.isArray(f.shared_with)&&f.shared_with.length>0);
     const unshared=files.filter(f=>Array.isArray(f.shared_with)&&f.shared_with.length===0);
     return {total:files.length,
             ownerSeesSharedTargets:shared.length,
             sharedSample:shared.slice(0,2).map(f=>({n:f.filename, targets:f.shared_with.length})),
             unsharedCount:unshared.length}; })()`);
};
