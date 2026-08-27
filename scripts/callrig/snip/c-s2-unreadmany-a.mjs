export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001', priv='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);          // read it
  const before=await page.evaluate(async({ws,gen})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=Array.isArray(j)?j:(j.channels||j.items||[]);
    return arr.find(c=>(c.channel_id||c.id)===gen)||{note:'not listed', sample:JSON.stringify(j).slice(0,120)};
  },{ws,gen});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${priv}`);   // navigate away
  await page.waitForTimeout(5000);
  return {readState:before, nowAt:page.url().slice(-16)};
};
