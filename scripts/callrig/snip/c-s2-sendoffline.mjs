const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  const snap=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const row=[...document.querySelectorAll('main [data-message-id]')]
      .find(e=>/QA-S2-SNDOFF2/.test(e.innerText||''));
    return {online:navigator.onLine,
      present:!!row,
      rowText: row? (row.innerText||'').replace(/\s+/g,' ').slice(-50):null,
      rowBtns: row? [...row.querySelectorAll('button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,14)).slice(0,6):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(e=>e.textContent.trim().slice(0,50)),
      composer:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText};
  });
  await ctx.setOffline(true);
  await page.waitForTimeout(1200);
  await comp.click(); await comp.type('QA-S2-SNDOFF2 while offline', {delay:35});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  const off=[]; for(let i=0;i<14;i++){ await page.waitForTimeout(1200); off.push(await snap()); }
  out.offline={first:off[0], last:off.at(-1),
    everPresent:off.some(x=>x.present),
    notices:[...new Set(off.flatMap(x=>x.notices))],
    btnsSeen:[...new Set(off.flatMap(x=>x.rowBtns||[]))]};
  await ctx.setOffline(false);
  const on=[]; for(let i=0;i<24;i++){ await page.waitForTimeout(1200); on.push(await snap()); }
  out.online={first:on[0], last:on.at(-1),
    everPresent:on.some(x=>x.present),
    notices:[...new Set(on.flatMap(x=>x.notices))],
    btnsSeen:[...new Set(on.flatMap(x=>x.rowBtns||[]))]};
  out.server=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>(m.body||'').slice(0,30)).filter(b=>/SENDOFF/.test(b));}, ch);
  return out;
};
