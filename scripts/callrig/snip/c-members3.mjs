export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const ok = await page.evaluate(v=>{const vv=eval(v);
    const t=[...document.querySelectorAll('[role=tab]')].filter(vv).find(x=>/^Members/.test((x.innerText||'').trim()));
    if(!t) return 'no Members tab'; t.click(); return 'clicked';}, V);
  await page.waitForTimeout(2500);
  const list = await page.evaluate(v=>{const vv=eval(v);
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({t:e.textContent.trim().slice(0,50), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}))
      .filter(o=>o.x>900 && o.y>70);
    return {selectedTab:[...document.querySelectorAll('[role=tab]')].filter(vv).map(x=>x.innerText.trim()+':'+x.getAttribute('aria-selected')),
      leaves:leaves.slice(0,24),
      straySlash: leaves.filter(o=>/^\s*[\/·]/.test(o.t) || /^\/\s*\S/.test(o.t))};}, V);
  return {clickResult: ok, ...list};
};
