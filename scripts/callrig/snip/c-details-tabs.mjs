export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  return await page.evaluate(v=>{const vv=eval(v);
    return [...document.querySelectorAll('button,[role=tab]')].filter(vv)
      .filter(b=>b.getBoundingClientRect().left>900)
      .map(b=>({tag:b.tagName, role:b.getAttribute('role'), aria:b.getAttribute('aria-label'),
                sel:b.getAttribute('aria-selected'), txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22),
                x:Math.round(b.getBoundingClientRect().left), y:Math.round(b.getBoundingClientRect().top)}));}, V);
};
