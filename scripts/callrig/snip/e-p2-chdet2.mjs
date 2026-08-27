import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(3000);
  // locate the panel: the smallest visible container holding BOTH "About" and "Pinned"
  const info = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const cands=[...document.querySelectorAll('div,aside,section')].filter(e=>vis(e)
      && /About/.test(e.innerText||'') && /Pinned/.test(e.innerText||''));
    const p=cands.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!p) return {found:false};
    p.setAttribute('data-qa-panel','1');
    const r=p.getBoundingClientRect();
    return {found:true, tag:p.tagName, rect:{x:Math.round(r.x),w:Math.round(r.width)},
      text:p.innerText.replace(/\s+/g,' ').slice(0,220)};
  });
  if(!info.found) return {info};
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const p=document.querySelector('[data-qa-panel="1"]');
    const b=[...p.querySelectorAll('button,[role=tab]')].filter(vis)
      .find(e=>/^Files/i.test((e.textContent||'').trim())); b&&b.click();
  });
  await page.waitForTimeout(2500);
  const files = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const p=document.querySelector('[data-qa-panel="1"]');
    const names=[...p.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /\.(png|txt|zip|wav|mp4)$/i.test((e.textContent||'').trim())).map(e=>e.textContent.trim());
    return {inPanel:[...new Set(names)], panelText:p.innerText.replace(/\s+/g,' ').slice(0,240)};
  });
  return {info, files};
};
