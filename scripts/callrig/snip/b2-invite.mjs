export default async ({page}) => {
  const WHO=process.env.QA_WHO||'QA Bob';
  const v = el => true;
  // Open Add to call if not open
  const opened = await page.evaluate(()=>{
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(dlg && /Invite to this call/.test(dlg.innerText||'')) return 'already';
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Add to call');
    if(b){ b.click(); return 'clicked'; } return 'notfound';
  });
  await page.waitForTimeout(3000);
  const picked = await page.evaluate((who)=>{
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {noDialog:true};
    const rows=[...dlg.querySelectorAll('button,[role=option],li,label')].filter(vis).filter(e=>(e.innerText||'').trim().startsWith(who));
    if(!rows.length) return {notFound: [...dlg.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).slice(0,20)};
    rows[0].click();
    return {clickedRow:(rows[0].innerText||'').replace(/\s+/g,' ').trim().slice(0,40)};
  }, WHO);
  await page.waitForTimeout(1500);
  const sent = await page.evaluate(()=>{
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {noDialog:true};
    const inv=[...dlg.querySelectorAll('button')].filter(vis).find(b=>/^Invite\s*\(/.test((b.innerText||'').trim()));
    if(inv && !inv.disabled){ const label=(inv.innerText||'').trim(); inv.click(); return {clicked:label}; }
    return {inviteBtn: inv?{t:(inv.innerText||'').trim(), dis:inv.disabled}:null};
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{
    const vis = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {dlg: dlg?(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,300):null,
      toasts:[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]};
  });
  return {opened, picked, sent, after};
};
