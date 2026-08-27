import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const ch = process.env.QA_CHAN || 'C4QAGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${ch}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  // open the members list
  const opened = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^(Members|\\d+ members|Channel details)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if(!b) return {err:'no members button', have:[...document.querySelectorAll('button')].filter(vis)
      .map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,28)).slice(0,25)};
    b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(3000);
  const state = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {err:'no dialog'};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...d.querySelectorAll('button')].filter(vis)
        .map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,50)).slice(0,25)};}, VIS);
  return {opened, state};
};
