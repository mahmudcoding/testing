const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const target = await page.evaluate((vs)=>{const vis=eval(vs);
    const cands=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^Pin QA Bob for everyone$/.test((e.innerText||'').trim()));
    if(!cands.length) return null; const r=cands[0].getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), txt:cands[0].innerText.trim()};},VS);
  out.target=target;
  if(!target){ out.visibleMenuTexts = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/pin|return to main|co-host/i.test(e.innerText||''))
        .map(e=>e.innerText.trim().slice(0,34)).slice(0,12);},VS); return out; }
  await page.mouse.click(target.x, target.y);
  await page.waitForTimeout(3000);
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean),
      pinMarkers:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/pinned|unpin/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,40)).slice(0,5),
      pinAria:[...document.querySelectorAll('[aria-label]')].filter(vis).map(e=>e.getAttribute('aria-label')).filter(a=>/pin/i.test(a||'')).slice(0,6) };},VS);
  return out;
};
