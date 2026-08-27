import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // finding 15 guard: a file shared nowhere still honestly shows an empty SHARED WITH
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.f15 = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json();
     const never=(j.files||[]).filter(f=>Array.isArray(f.shared_with)&&f.shared_with.length===0&&f.context_id===undefined);
     return {filesSharedNowhere:never.length,
             sample:never.slice(0,2).map(f=>({n:f.filename, sw:f.shared_with.length, ctx:'absent'}))}; })()`);
  // finding 13 guard: end-before-start is still refused
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-10');
  await page.waitForTimeout(900);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-09');
  await page.waitForTimeout(2200);
  out.f13 = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const sub=[...d.querySelectorAll('button')].find(b=>/^Schedule meeting$/.test((b.innerText||'').trim()));
     return {errorShown:/must be after|End time|позже|раньше/i.test(t),
             errorText:(t.match(/[A-ZА-Я][^.!]{0,60}(must be after|after start)[^.!]{0,20}/i)||[''])[0],
             submitDisabled: sub?sub.disabled:null}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
