const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  for (const [k,scope] of [['company','company'],['workspace','workspace']]) {
    await page.goto(`https://airion-cargo.store/w/W4QAF1XTURESO01/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    out[k] = await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      // a role row = a block containing "Custom" or "System" and role-ish text
      const rows=[...m.querySelectorAll('div')].filter(e=>vis(e)&&/\b(Custom|System)\b/.test(e.innerText||'')
        && e.children.length<=8 && (e.innerText||'').length<260);
      const seen=new Set(); const out=[];
      for(const r of rows){
        const t=(r.innerText||'').replace(/\s+/g,' ').trim();
        const kind = /\bSystem\b/.test(t)?'System':'Custom';
        const name = t.split(' ')[0].slice(0,22);
        const key = kind+'|'+name; if(seen.has(key)) continue; seen.add(key);
        const btns=[...r.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,12)).filter(Boolean);
        out.push({name, kind, buttons:[...new Set(btns)], snippet:t.slice(0,70)});
      }
      return out.slice(0,10);},VS);
  }
  return out;
};
