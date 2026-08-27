export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(8000);
  return page.evaluate(async(gen)=>{
    const r=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=100`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const bodies=(j.messages||[]).map(m=>m.body||'');
    const inDom=[...document.querySelectorAll('main [data-message-id]')]
      .map(e=>(e.innerText||'')).join(' ');
    return {scanned:bodies.length,
      apiHasOffline: bodies.filter(b=>/QA-S2-OFFL/.test(b)),
      domHasOffline: (inDom.match(/QA-S2-OFFL\w*-\w+/g)||[])};
  }, gen);
};
