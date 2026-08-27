import {WS, BASE} from './e-p2-helpers.mjs';
const dump = (who) => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const cands=[...document.querySelectorAll('[role=dialog],[data-state=open]')].filter(vis)
    .filter(e=>new RegExp(who,'i').test(e.innerText||''));
  const d=cands.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
  if(!d) return {found:false};
  const nodes=[...d.querySelectorAll('*')].filter(vis).map(e=>{
    const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
    return [e.tagName, (e.className||'').toString().replace(/\s+/g,' ').slice(0,60),
            Math.round(r.width)+'x'+Math.round(r.height), cs.backgroundColor,
            (e.getAttribute('aria-label')||'').slice(0,26), (e.getAttribute('title')||'').slice(0,20)].join('|');
  });
  return {found:true, n:nodes.length, nodes, text:d.innerText.replace(/\s+/g,' ').slice(0,200)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const out={};
  for (const [who,online] of [['QA Bob','online:true'],['QA Carol','online:false']]) {
    await page.locator(`main button[aria-label="Open ${who}'s profile"]`).first().click();
    await page.waitForTimeout(2500);
    out[who]={expected:online, ...(await page.evaluate(dump, who.split(' ')[1]))};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  const a=out['QA Bob'].nodes||[], b=out['QA Carol'].nodes||[];
  const diff=[]; const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++) if((a[i]||'')!==(b[i]||'')) diff.push({i, online:(a[i]||'MISSING').slice(0,110), offline:(b[i]||'MISSING').slice(0,110)});
  return {counts:{online:a.length, offline:b.length}, diffCount:diff.length, diff:diff.slice(0,8),
    onlineText:out['QA Bob'].text, offlineText:out['QA Carol'].text};
};
