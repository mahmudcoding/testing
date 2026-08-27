export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const look = () => page.evaluate(v=>{const vv=eval(v);
    const c=[...document.querySelectorAll('[role=listbox],[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv)
      .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
    return c?c.innerText.replace(/\s+/g,' ').slice(0,160):'none';}, V);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.keyboard.type('@', {delay:120});
  await page.waitForTimeout(1500);
  const afterAt = await look();
  await page.keyboard.type('Bob', {delay:180});
  await page.waitForTimeout(1500);
  const afterName = await look();
  let picked='not attempted';
  if(afterName!=='none'){ await page.keyboard.press('Enter'); await page.waitForTimeout(900); picked='Enter pressed'; }
  const composerNow = await page.evaluate(()=>(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText);
  await page.keyboard.type(' PING2', {delay:60});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const m = page.locator('[data-message-id]').last();
  const id = await m.getAttribute('data-message-id');
  const api = await page.evaluate(async (args)=>{const [ch,mid]=args;
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const x=(Array.isArray(arr)?arr:[]).find(m=>m.id===mid)||{};
    return {body:x.body, mentions:x.mentions||null};}, [ch,id]);
  return {afterAt, afterName, picked, composerBeforeSend:composerNow, rendered:(await m.innerText()).replace(/\s+/g,' ').slice(0,110), api};
};
