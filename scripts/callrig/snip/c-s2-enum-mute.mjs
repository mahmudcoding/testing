export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const list=async(where)=>await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('button,[role="menuitem"],[role="menuitemcheckbox"],a')]
      .filter(v).map(e=>((e.getAttribute('aria-label')||e.textContent||'').trim()).slice(0,34))
      .filter(Boolean);});
  const out={};
  const all=await list();
  out.headerish=all.filter(t=>/mute|notif|bell|detail|more/i.test(t)).slice(0,10);
  // try the channel header title button
  const hdr=page.locator('main header button, main [role="banner"] button');
  out.headerBtns=await hdr.evaluateAll(es=>es.map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30)).slice(0,14));
  for(const lbl of out.headerBtns){
    if(!lbl) continue;
    const b=page.locator('main header button, main [role="banner"] button').filter({hasText:new RegExp('^'+lbl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first();
  }
  // open each header button and look for Mute
  for(let i=0;i<out.headerBtns.length;i++){
    const b=hdr.nth(i);
    await b.click({timeout:4000}).catch(()=>{});
    await page.waitForTimeout(1200);
    const items=await list();
    const m=items.filter(t=>/mute/i.test(t));
    if(m.length){ out.muteUnder={button:out.headerBtns[i], items:m}; break; }
    await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  }
  return out;
};
