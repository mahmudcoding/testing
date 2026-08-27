import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('response', r => { if (/participants\/.*\/permissions/.test(r.url())) out.reqs.push({m:r.request().method(), s:r.status(), post:r.request().postData()}); });
  await page.evaluate(DOM);
  const d = () => page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!dlg) return null;
    return { text: dlg.innerText.replace(/\s+/g,' ').slice(0,400),
      btns: [...dlg.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:(b.innerText||window.__qa.nameOf(b)).replace(/\s+/g,' ').trim().slice(0,24), pressed:b.getAttribute('aria-pressed'), sel:b.getAttribute('data-selected'), state:b.getAttribute('data-state'), tid:b.getAttribute('data-testid')})) };
  });
  out.before = await d();
  if (!out.before) { out.err='no dialog'; return out; }
  // click the Allow under "Screen sharing"
  const hit = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    // the Screen sharing block: smallest element containing the label and three buttons
    const cands=[...dlg.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter(n=>/Screen sharing/.test(n.innerText||'') && [...n.querySelectorAll('button')].filter(b=>/^(Inherit|Allow|Block)$/.test((b.innerText||'').trim())).length===3);
    cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const blk=cands[0]; if(!blk) return null;
    const b=[...blk.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='Allow');
    b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2), block:(blk.innerText||'').replace(/\s+/g,' ').slice(0,60)};
  });
  out.hit = hit;
  if (hit) { await page.mouse.click(hit.x,hit.y); await page.waitForTimeout(3000); }
  await page.evaluate(DOM);
  out.after = await d();
  // save if there is a save button
  const save = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return window.__qa.clickDeepest(/^(Save|Apply|Done)$/, dlg);
  });
  out.save = save;
  await page.waitForTimeout(3000);
  return out;
};
