export default async ({page}) => {
  const mid=process.env.QA_MID;
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return j?.data?.username||j?.username||'?';});
  const seen = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return {inDom:!!a, text:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,70):null,
            total:document.querySelectorAll('[data-message-id]').length};
  }, mid);
  return {who, seen};
};
