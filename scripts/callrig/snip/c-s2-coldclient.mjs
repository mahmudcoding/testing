export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  const TXTS=['QA-S2-OFFLINE-dkvw','QA-S2-OFFL2-0vz8','QA-S2-OFFL3-tewc'];
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(8000);
  out.before=await page.evaluate((TXTS)=>{
    const j=[...document.querySelectorAll('main [data-message-id]')].map(e=>e.innerText||'').join(' ');
    return TXTS.map(t=>({t, inDom:j.includes(t)}));}, TXTS);
  // drop the client-side sync store, keep cookies (session) intact
  out.deleted=await page.evaluate(async ()=>{
    const names=(await indexedDB.databases()).map(d=>d.name);
    for(const n of names){ await new Promise(res=>{const r=indexedDB.deleteDatabase(n);
      r.onsuccess=r.onerror=r.onblocked=()=>res();}); }
    return names;});
  await page.goto('about:blank'); await page.waitForTimeout(1500);
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(13000);
  out.afterCold=await page.evaluate((TXTS)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const j=els.map(e=>e.innerText||'').join(' ');
    return {loaded:els.length, hits:TXTS.map(t=>({t, inDom:j.includes(t)})),
      lastThree:els.slice(-3).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(-30))};}, TXTS);
  out.idbNow=await page.evaluate(async()=>(await indexedDB.databases()).map(d=>d.name));
  return out;
};
