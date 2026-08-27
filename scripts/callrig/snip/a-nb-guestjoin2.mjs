import { VIS } from './a-nb-lib.mjs';
export default async ({page, ctx}) => {
  const link = process.env.QA_LINK;
  const name = process.env.QA_GUESTNAME || 'Night Guest';
  const out={};
  const p = await ctx.newPage();
  await p.goto(link, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(6000);
  out.first = await p.evaluate((v)=>{ const vis=eval(v);
    return {path:location.pathname.slice(0,50),
      txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,200),
      inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('placeholder')||i.getAttribute('aria-label')||i.type),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.textContent||'').trim().slice(0,24)).filter(Boolean).slice(0,10)}; }, VIS);
  const inp = p.locator('input[type="text"], input:not([type])').first();
  if (await inp.count()) { await inp.fill(name); await p.waitForTimeout(600); }
  const go = p.locator('button', {hasText:/Join|Continue|Enter/i}).first();
  if (await go.count()) { await go.click(); await p.waitForTimeout(9000); }
  out.after = await p.evaluate((v)=>{ const vis=eval(v);
    return {path:location.pathname.slice(0,60),
      txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,220)}; }, VIS);
  return out;
};
