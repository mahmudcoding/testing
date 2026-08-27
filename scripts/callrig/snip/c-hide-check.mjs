export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', id=process.env.MID;
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const dom = await page.evaluate(mid=>({present:!!document.querySelector(`[data-message-id="${mid}"]`),
    count:document.querySelectorAll('[data-message-id]').length,
    bodyHasText:/QA-C-HIDEME-TARGET/.test(document.body.innerText)}), id);
  const api = await page.evaluate(async (args)=>{
    const [ch,mid]=args;
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=15`,{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const list=Array.isArray(arr)?arr:[];
    return {status:r.status, total:list.length, hasTarget:list.some(m=>m.id===mid),
      targetBody:(list.find(m=>m.id===mid)||{}).body||null};
  }, [ch,id]);
  return {domAfterReload: dom, apiForThisUser: api};
};
