export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  return await page.evaluate(v=>{const vv=eval(v);
    // any visible leaf that looks like a member row or status line
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({t:e.textContent.trim().slice(0,55), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}))
      .filter(o=>o.x>900);
    return {rightPanelLeaves: leaves.slice(0,28),
      straySlash: leaves.filter(o=>/^[\/·]|\s\/\s*$|^\s*\/\s/.test(o.t))};}, V);
};
