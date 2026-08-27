const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(4500);
  return await page.evaluate(async ()=>{
    const pid = new URL(location.href).searchParams.get('thread');
    const r = await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=50`,{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const replies=(j&&j.replies)||[];
    const rows=[...document.querySelectorAll('[data-message-id]')].map(e=>({
      id:e.getAttribute('data-message-id').slice(-6), text:e.innerText.replace(/\n+/g,' | ').slice(0,150)}));
    return {threadParent: pid, apiReplies: replies.map(m=>({id:m.id.slice(-6), body:(m.body||'').slice(0,50),
        deleted: !!(m.deleted_at||m.is_deleted), quoted: m.quoted_message_id? m.quoted_message_id.slice(-6):null,
        snapshot: m.quoted_snapshot? JSON.stringify(m.quoted_snapshot).slice(0,120):null})),
      domRows: rows,
      hasDeletedNotice: /Original message deleted|was deleted/i.test(document.body.innerText)};
  });
};
