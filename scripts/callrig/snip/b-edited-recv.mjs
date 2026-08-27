export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return j?.data?.username||j?.username||'?';});
  return {who, msgs: await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')]
    .map(a=>(a.innerText||'').replace(/\s+/g,' '))
    .filter(t=>/edited/i.test(t)).map(t=>t.slice(0,80)).slice(0,3))};
};
