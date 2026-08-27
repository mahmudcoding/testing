import {WS, BASE} from './e-p2-helpers.mjs';
const NAMEFN = `
  const accName = (e) => {
    const al=e.getAttribute('aria-label'); if(al && al.trim()) return al.trim();
    const lb=e.getAttribute('aria-labelledby');
    if(lb){ const t=lb.split(/\\s+/).map(id=>{const n=document.getElementById(id); return n? n.textContent:'';}).join(' ').trim(); if(t) return t; }
    if(e.id){ const l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if(l && l.textContent.trim()) return l.textContent.trim(); }
    const wrap=e.closest('label'); if(wrap && wrap.textContent.trim()) return wrap.textContent.trim();
    const t2=e.getAttribute('title'); if(t2 && t2.trim()) return t2.trim();
    if(e.tagName==='BUTTON' && (e.textContent||'').trim()) return e.textContent.trim();
    const ph=e.getAttribute('placeholder'); if(ph && ph.trim()) return '(placeholder) '+ph.trim();
    return null;
  };`;
export default async ({page}) => {
  const out={};
  // the meeting form is the densest form in the sector
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  out.meetingForm = await page.evaluate(new Function(NAMEFN + `
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const ctrls=[...d.querySelectorAll('input,select,textarea,button')].filter(vis);
    const unnamed=ctrls.filter(e=>!accName(e)).map(e=>({t:e.tagName.toLowerCase()+(e.type?'['+e.type+']':''), v:(e.value||'').slice(0,14)}));
    return {total:ctrls.length, unnamed:unnamed.slice(0,10), unnamedCount:unnamed.length};
  `));
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  for (const r of ['/settings/profile','/settings/appearance','/files']) {
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out[r] = await page.evaluate(new Function(NAMEFN + `
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const m=document.querySelector('main');
      const ctrls=[...m.querySelectorAll('input,select,textarea,button')].filter(vis);
      const unnamed=ctrls.filter(e=>!accName(e)).map(e=>({t:e.tagName.toLowerCase()+(e.type?'['+e.type+']':''), v:(e.value||'').slice(0,14)}));
      return {total:ctrls.length, unnamedCount:unnamed.length, unnamed:unnamed.slice(0,8)};
    `));
  }
  return out;
};
