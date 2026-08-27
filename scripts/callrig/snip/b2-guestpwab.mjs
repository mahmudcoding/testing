export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const snap = () => page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/join call/i.test((x.innerText||'').trim()));
    const name=[...document.querySelectorAll('input[type=text]')].filter(vis)[0];
    const pw=[...document.querySelectorAll('input[type=password]')].filter(vis)[0];
    let label=null;
    if(pw){ let n=pw; for(let k=0;k<4&&n.parentElement;k++){ n=n.parentElement; const t=(n.innerText||'').trim(); if(t.length>3){ label=t.replace(/\s+/g,' ').slice(0,80); break; } } }
    return {name:name?name.value:null, pw:pw?pw.value:null, pwLabel:label,
            pwRequired:pw?pw.required:null, joinDisabled:b?b.disabled:null}; }, V);
  const s0 = await snap();
  const n = await page.$('input[type=text]'); if(n){ await n.fill('Label Probe'); }
  await page.waitForTimeout(900);
  const s1 = await snap();
  const p = await page.$('input[type=password]'); if(p){ await p.fill('x'); }
  await page.waitForTimeout(900);
  const s2 = await snap();
  return {empty:s0, nameOnly:s1, namePlusPw:s2};
};
