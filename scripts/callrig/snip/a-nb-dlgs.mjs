import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"],form')].filter(vis).map(d=>({
      role: d.getAttribute('role')||d.tagName.toLowerCase(),
      tid: d.getAttribute('data-testid'),
      txt: (d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      inputs: [...d.querySelectorAll('input,textarea,select')].filter(vis).map(i=>({t:i.type, ph:i.placeholder, al:i.getAttribute('aria-label'), tid:i.getAttribute('data-testid')})),
      btns: [...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30), tid:b.getAttribute('data-testid')}))
    })); }, VIS);
}
