import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const out={};
    for(const scope of ['own','accessible']){
      const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope='+scope+'&limit=100',{credentials:'include'});
      const d=await r.json(); const a=d.files||[];
      out[scope]=a.map(f=>({name:(f.filename||'').slice(0,22), owner:(f.owner&&f.owner.name)||'(me)',
        shared:(f.shared_with||[]).map(s=>s.type+':'+(s.target_name||'')).join(',')||'(none)'}));
    }
    out.hasNormalTxt = JSON.stringify(out).includes('normal.txt');
    return out; })()`);
};
