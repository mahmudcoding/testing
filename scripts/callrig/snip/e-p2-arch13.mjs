import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // find any control whose name mentions search, anywhere in the shell
  const found = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    return [...document.querySelectorAll('button,a,[role=button],input')].filter(vis)
      .map(e=>({l:(e.getAttribute('aria-label')||e.placeholder||e.textContent||'').trim().slice(0,40), t:e.tagName}))
      .filter(o=>/search|поиск/i.test(o.l));
  });
  return {searchTriggers: found};
};
