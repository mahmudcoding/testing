export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const ids=await page.evaluate(async(ch)=>{
    const mk=async(body)=>{
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body, idempotency_key:'qds-'+Math.random().toString(36).slice(2)})});
      return (await r.json()).id;};
    return {a:await mk('QA-DS-A https://example.com/one'), b:await mk('QA-DS-B https://example.com/two')};}, ch);
  out.ids=ids;
  await page.reload(); await page.waitForTimeout(12000);
  const cards=()=>page.evaluate(({a,b})=>{
    const has=(id)=>{const e=document.querySelector(`main [data-message-id="${id}"]`);
      if(!e) return null;
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {links:[...e.querySelectorAll('a')].filter(v).length,
        card:/External link/.test(e.innerText||'')};};
    return {A:has(a), B:has(b)};}, ids);
  out.before=await cards();
  const el=page.locator(`main [data-message-id="${ids.a}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  const dis=el.locator('button[aria-label="Dismiss preview"]').first();
  out.dismissFound=await dis.count();
  if(out.dismissFound){ await dis.click(); await page.waitForTimeout(3000); }
  out.afterDismissA=await cards();
  out.PASS = out.before.A && out.before.B && out.before.A.card && out.before.B.card
             && out.afterDismissA.A && !out.afterDismissA.A.card && out.afterDismissA.B.card;
  return out;
};
