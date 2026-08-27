export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const thApi = () => page.evaluate(async(mid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${mid}/thread?limit=50`,{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const arr=(j?.data?.messages||j?.messages||[]);
    return {s:r.status, n:arr.length, bodies:arr.slice(-3).map(m=>(m.body||'').slice(0,50))};
  }, mid);
  const t0 = await thApi();
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  const clicked = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^reply/i.test(x.getAttribute('aria-label')||''));
    if(!b) return false; b.click(); return true;}, mid);
  await page.waitForTimeout(2500);
  const panel = await page.evaluate(()=>({
    url: location.href.replace(/^https:\/\/[^/]+/,''),
    editors: [...document.querySelectorAll('div[contenteditable="true"]')].map(e=>e.getAttribute('aria-label')),
    hasThreadWord: /thread/i.test(document.body.innerText.slice(0,3000))
  }));
  // type into the thread composer (prefer one that is NOT the main one, else main)
  const sent = await (async()=>{
    const labels = panel.editors;
    const target = labels.find(l=>l && /thread|reply/i.test(l)) || 'Compose message';
    const sel = `div[contenteditable="true"][aria-label="${target}"]`;
    const el = await page.$(sel); if(!el) return {err:'no composer', target};
    await el.click(); await page.keyboard.type('QA-B-T1 thread reply',{delay:15});
    await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    return {target};
  })();
  const t1 = await thApi();
  const parentDom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,140):null;}, mid);
  return {mid, t0, replyClicked:clicked, panel, sent, t1, parentDom};
};
