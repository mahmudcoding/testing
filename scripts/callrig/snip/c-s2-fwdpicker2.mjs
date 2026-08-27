export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  const dms = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/dm',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const list=(j&&(j.dms||j.items||j.channels||j.data))||[];
    return {status:r.status, n:Array.isArray(list)?list.length:null,
      names:(Array.isArray(list)?list:[]).map(d=>(d.name||d.title||
        (d.participants||[]).map(p=>p.display_name||p.name).join(',')||d.id||'?')).slice(0,10)};
  });
  const msg = page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(1200);
  let clicked='no';
  try { await page.locator('button[aria-label="Forward"]').last().click({timeout:5000}); clicked='ok'; }
  catch(e){ clicked='FAIL'; }
  await page.waitForTimeout(3500);
  const picker = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return {dialog:false};
    const rows=[...d.querySelectorAll('button,li,[role="option"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40);
    return {dialog:true, rows:[...new Set(rows)].slice(0,20)};
  });
  await page.keyboard.press('Escape').catch(()=>{});
  return {apiDMs:dms, forwardClick:clicked, picker};
};
