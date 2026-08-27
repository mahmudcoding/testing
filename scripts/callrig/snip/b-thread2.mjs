export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}?thread=${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const thApi = () => page.evaluate(async(mid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${mid}/thread?limit=50`,{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const arr=(j?.data?.messages||j?.messages||[]);
    return {s:r.status, n:arr.length, bodies:arr.slice(-3).map(m=>(m.body||'').slice(0,40))};
  }, mid);
  const chApi = () => page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=30',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {n:arr.length, last:arr.slice(0,2).map(m=>(m.body||'').slice(0,40))};
  });
  const t0=await thApi(), c0=await chApi();
  const eds = await page.evaluate(()=>[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')]
    .map((e,i)=>({i, x:Math.round(e.getBoundingClientRect().x), w:Math.round(e.getBoundingClientRect().width)})));
  if(eds.length<2) return {err:'thread composer missing', eds, t0};
  const target = eds.reduce((a,b)=>b.x>a.x?b:a);
  const handle = await page.evaluateHandle((i)=>document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')[i], target.i);
  const el = handle.asElement();
  await el.click();
  await page.keyboard.type('QA-B-T2 thread reply',{delay:15});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  const t1=await thApi(), c1=await chApi();
  const parentDom = await page.evaluate((mid)=>{
    const a=[...document.querySelectorAll(`[data-message-id="${mid}"]`)][0];
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,160):null;}, mid);
  return {mid, eds, target, t0, t1, c0, c1, parentDom};
};
