export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(13000);
  const api=()=>page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
    return {total:j&&j.total, unread:j&&j.unread_count, listed:Array.isArray(a)?a.length:null,
      bodies:(Array.isArray(a)?a:[]).slice(0,2).map(n=>String(n.body||'').slice(0,22))};});
  const out={afterMention:await api()};
  // open the bell and click the entry
  await page.locator('button[aria-label*="Notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(4000);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button[aria-label]')].filter(v)
      .find(b=>/QA-NOTIF1/.test(b.getAttribute('aria-label')||''))||null;});
  const el=h.asElement(); out.entryFound=!!el;
  if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  out.afterClickingEntry=await api();
  out.url=await page.evaluate(()=>location.pathname+location.search.slice(0,26));
  return out;
};
