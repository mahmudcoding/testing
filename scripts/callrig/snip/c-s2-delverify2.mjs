export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXEUB0JGTQ2JI';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded().catch(()=>{});
  await page.waitForTimeout(1500);
  return page.evaluate(async ({ch,id})=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return {otherAccountSees: e?(e.innerText||'').replace(/\s+/g,' ').trim().slice(-46):'NODE-ABSENT',
      showsDeletedTombstone: e?/deleted/i.test(e.innerText||''):null,
      serverBodyForThisAccount: hit?(hit.body||'').slice(0,26):'absent'};},{ch,id});
};
