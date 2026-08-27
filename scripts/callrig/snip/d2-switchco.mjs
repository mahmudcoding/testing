import { safeClick } from './lib.mjs';
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={};
  out.click = await safeClick(page, 'main button[aria-label="Switch company"]');
  await page.waitForTimeout(2500);
  out.after = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const pops=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis);
    return {url:location.pathname,
      popups:pops.map(p=>({txt:(p.innerText||'').replace(/\s+/g,' ').slice(0,220),
        items:[...p.querySelectorAll('button,a,[role=menuitem],[role=option]')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,8)})),
      mainTxt:(document.querySelector('main').innerText||'').replace(/\s+/g,' ').slice(0,260)};
  });
  return out;
};
