export default async ({page}) => {
  return await page.evaluate(async () => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop() || document.body;
    const inputs=[...dlg.querySelectorAll('input,textarea')].map(i=>({type:i.type, val:(i.value||'').slice(0,160), ro:i.readOnly}));
    const txt = (dlg.innerText||'');
    const urls = (txt.match(/https?:\/\/[^\s|]+/g)||[]).slice(0,5);
    // try clipboard by clicking Copy
    let clip=null;
    const cp=[...dlg.querySelectorAll('button')].filter(v).find(b=>/^copy$/i.test((b.innerText||'').trim()));
    if(cp){ cp.click(); await new Promise(r=>setTimeout(r,900));
      try { clip = await navigator.clipboard.readText(); } catch(e){ clip='ERR:'+String(e).slice(0,50); } }
    return {inputs, urls, clip: clip?clip.slice(0,200):null, dlgText: txt.replace(/\n+/g,' | ').slice(0,400)};
  });
};
