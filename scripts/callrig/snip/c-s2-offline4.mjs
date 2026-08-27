export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  const probe=()=>page.evaluate(()=>{
    const rows=[...document.querySelectorAll('main [data-message-id]')];
    const inRows=rows.filter(e=>/QA-S2-DROP-/.test(e.innerText||''))
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(-30));
    const anywhere=/QA-S2-DROP-/.test(document.body.innerText);
    const where=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
      .filter(e=>/QA-S2-DROP-/.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect();
        return {t:(e.textContent||'').trim().slice(0,24), x:Math.round(r.x), y:Math.round(r.y),
          inMain: !!e.closest('main'), inMsg: !!e.closest('[data-message-id]')};}).slice(0,6);
    return {rowCount:rows.length, inRows, anywhere, where};
  });
  out.nowNoReload=await probe();
  out.server=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>(m.body||'').slice(0,24));}, ch);
  await page.reload(); await page.waitForTimeout(8000);
  out.afterReload=await probe();
  return out;
};
