import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.myFiles = await page.evaluate(`(async()=>{
    const own=await (await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'})).json();
    const acc=await (await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=accessible',{credentials:'include'})).json();
    return {own:(own.files||[]).length, accessible:(acc.files||[]).length}; })()`);
  // search via the API directly for file names owned by the OTHER user
  out.searchApi = await page.evaluate(`(async()=>{
    const q=async(t)=>{const r=await fetch('/api/v1/search?q='+encodeURIComponent(t)+'&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=25',{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      return t+' -> files='+((j.files||[]).length)+' total_files='+(j.total_files??'?')
        +(j.files&&j.files.length? ' :: '+j.files.map(f=>String(f.filename||f.name||f.id||'?').slice(0,28)).join(', ') : '');};
    return [await q('normal'), await q('qa-e-note'), await q('fake'), await q('тест-файл'), await q('aaaaaaaa')]; })()`);
  return out;
};
