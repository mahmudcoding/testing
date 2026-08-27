const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.saved = await page.evaluate(()=>({
    n:document.querySelectorAll('[data-message-id]').length,
    hasTarget:/QA-S2-V7-ALL/.test(document.body.innerText),
    text:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,200)}));
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.channel = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=25`,{credentials:'include'});
    const j=await r.json();
    const m=(j.messages||[]).find(x=>/V7\\?-ALL|V7-ALL/.test(x.body||''));
    const el=[...document.querySelectorAll('[data-message-id]')].filter(e=>/QA-S2-V7-ALL/.test(e.innerText||'')).pop();
    return {apiBody: m? (m.body||'').slice(0,40):null, apiDeleted: m? !!(m.deleted_at):null,
      domPresent: !!el, domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,70):null};
  }, GEN);
  return out;
};
