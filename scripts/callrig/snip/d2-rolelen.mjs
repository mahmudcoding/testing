// Bisect the role-name length limit: for each length, click Create and record
// whether a request goes out and what the user is told. Deletes anything created.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const lens = JSON.parse(process.env.QA_LENS||'[60,100,128,129,160,200]');
  const out=[];
  for (const L of lens) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5500);
    await page.evaluate(()=>{const b=document.querySelectorAll('input[type=checkbox]')[5]; if(b&&!b.checked) b.click();});
    await page.waitForTimeout(400);
    const nm = 'QAD2L'+String(L).padStart(3,'0')+'-'+'Z'.repeat(Math.max(0,L-9));
    await page.locator('main input[placeholder="e.g. Moderators"]').first().fill(nm);
    await page.waitForTimeout(600);
    await page.evaluate(()=>{ window.__n=[];
      window.__id=setInterval(()=>{
        for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')){
          const t=(e.textContent||'').replace(/\s+/g,' ').trim(); if(!t||t.length>160) continue;
          const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) continue;
          let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
          const k=t+'|'+Math.round(r.width)+'x'+Math.round(r.height);
          const p=window.__n.find(x=>x.k===k); if(p){p.maxOp=Math.max(p.maxOp,o);} else window.__n.push({k,txt:t.slice(0,70),maxOp:o});
        }},150);
    });
    await page.waitForTimeout(350);
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    const btn=page.locator('main button').filter({hasText:/^Create role$/}).first();
    const dis=await btn.isDisabled();
    if(!dis) await btn.click();
    await page.waitForTimeout(5000); page.off('response', on);
    const notices=await page.evaluate(()=>{clearInterval(window.__id); return window.__n.filter(x=>x.maxOp>0.05);});
    const inline=await page.evaluate(()=>{
      const m=document.querySelector('main');
      return [...m.querySelectorAll('p,span,div')].filter(e=>e.children.length===0)
        .map(e=>({t:(e.textContent||'').trim(), cls:(typeof e.className==='string'?e.className:'')}))
        .filter(x=>x.t && x.t.length<140 && (/red|error|danger/i.test(x.cls) || /(charact|too long|invalid|must|least|most|exceed)/i.test(x.t)))
        .map(x=>x.t).slice(0,3);
    });
    const created=await page.evaluate(n=>{
      const m=document.querySelector('main');
      return [...m.querySelectorAll('tr')].some(tr=>(tr.innerText||'').includes(n.slice(0,8)));
    }, nm);
    out.push({len:L, submitDisabled:dis, reqs:reqs.filter(r=>/role/i.test(r)), notices:notices.map(x=>x.txt), inline, created});
    if (created) { // clean up immediately
      await page.evaluate(n=>{ for(const tr of document.querySelectorAll('tr')) if((tr.innerText||'').includes(n.slice(0,8))){
        const b=[...tr.querySelectorAll('button')].find(x=>/^Delete/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.click();return;} } }, nm);
      await page.waitForTimeout(1500);
      await page.locator('[role=dialog] button,[role=alertdialog] button').filter({hasText:/^(Delete|Delete role)$/i}).first().click().catch(()=>{});
      await page.waitForTimeout(2500);
    }
  }
  return out;
};
