export default async ({page}) => {
  const WS='W4QBF1XTURESO01', WHO=process.env.QA_WHO||'QA Bob';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const clicked = await page.evaluate((who)=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    // find the row containing the name, then its Call button
    const rows=[...document.querySelectorAll('li,tr,div')].filter(e=>v(e) && (e.innerText||'').includes(who) && (e.innerText||'').length<200 && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.innerText||'').trim())));
    const row=rows[rows.length-1];
    if(!row) return {noRow:true};
    const cb=[...row.querySelectorAll('button')].filter(v).find(b=>/^Call$/.test((b.innerText||'').trim()));
    if(!cb) return {noCallBtn:true, row:(row.innerText||'').slice(0,80)};
    cb.click();
    return {clicked:true, row:(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)};
  }, WHO);
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    return {url:location.href, txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,320),
            btns:[...document.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(-14)};
  });
  return {clicked, after};
};
