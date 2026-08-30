import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const shot = process.env.QA_SHOT;
  const r = await page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const sel='[role=dialog],[role=alertdialog],[data-radix-popper-content-wrapper],[role=menu],aside';
    return [...document.querySelectorAll(sel)].filter(vis).map(d=>{
      const rc=d.getBoundingClientRect();
      return {tag:d.tagName, testid:d.getAttribute('data-testid'), role:d.getAttribute('role'),
        rect:[Math.round(rc.x),Math.round(rc.y),Math.round(rc.width),Math.round(rc.height)],
        text:T(d).slice(0,900),
        controls:[...d.querySelectorAll('button,[role=radio],[role=switch],[role=menuitemradio],input,select,[role=tab]')].filter(vis)
          .map(b=>({tag:b.tagName, r:b.getAttribute('role'), l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),
            t:b.getAttribute('data-testid'), st:b.getAttribute('data-state')||b.getAttribute('aria-checked')||b.getAttribute('aria-selected'),
            d:b.disabled||b.getAttribute('aria-disabled')==='true'}))};
    });
  });
  if (shot) await page.screenshot({path: shot});
  return r;
};
