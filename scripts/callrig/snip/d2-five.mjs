const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const SW = `(lbl) => { const vis=(VISFN); const main=document.querySelector('main')||document.body;
  const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
  return l.filter(e=>{ let n=e,b=''; for(let i=0;i<5&&n;i++){n=n.parentElement; if(!n)break;
    const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>4&&t.length<120){b=t;break;} }
    return b.startsWith(lbl); }); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const sw = SW.replace('VISFN', VIS);
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'}); await page.waitForTimeout(2800); };
  const blob=()=>page.evaluate(`(() => { try{return JSON.parse(localStorage.getItem('aloqa.appearance'));}catch{return null;} })()`);
  const targets=[['Show member roles','showRoles'],['Link previews','linkPreviews'],
                 ['Markdown preview panel','markdownPreviewPanel'],['Animations','animations']];
  const out=[];
  for (const [label,key] of targets) {
    await load();
    const b0=await blob();
    const before=await page.evaluate(`(() => { const g=(${sw})(${JSON.stringify(label)});
      return g.length===1 ? g[0].getAttribute('aria-checked') : 'AMBIG:'+g.length; })()`);
    if (String(before).startsWith('AMBIG')) { out.push({label,key,err:before}); continue; }
    await page.evaluate(`(() => { const g=(${sw})(${JSON.stringify(label)}); if(g.length===1) g[0].click(); })()`);
    await page.waitForTimeout(1100);
    const afterClick=await page.evaluate(`(() => { const g=(${sw})(${JSON.stringify(label)});
      return g.length===1 ? g[0].getAttribute('aria-checked') : null; })()`);
    const bar=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
    if (bar.some(t=>/^Save/.test(t))) {
      await page.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
      await page.waitForTimeout(2200);
    }
    const b1=await blob();
    await load();
    const afterReload=await page.evaluate(`(() => { const g=(${sw})(${JSON.stringify(label)});
      return g.length===1 ? g[0].getAttribute('aria-checked') : null; })()`);
    const b2=await blob();
    out.push({ label, key, before, afterClick, afterReload, saveBar:bar,
               stored_before:b0&&b0[key], stored_afterSave:b1&&b1[key], stored_afterReload:b2&&b2[key],
               survived: afterClick===afterReload });
  }
  return out;
};
