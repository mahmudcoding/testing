export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={}; const tag='QA-DELDROP2 '+Math.floor(Date.now()/1000%100000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await comp.click(); await page.keyboard.type(tag); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.tag=tag;
  let dels=0;
  await page.route(u=>/\/messaging\/channels\/[^/]+\/messages$/.test(new URL(u).pathname),
    (r)=>{ if(r.request().method()==='DELETE'){ dels++; return r.abort('failed'); } return r.continue(); });
  const msg=page.locator('[data-message-id]').filter({hasText:tag}).last();
  await msg.hover(); await page.waitForTimeout(1200);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(1500);
  const del=page.locator('[role="menuitem"],[role="menu"] button').filter({hasText:/^Delete/}).first();
  out.menuDelete=await del.count();
  if(!out.menuDelete) return out;
  await del.click(); await page.waitForTimeout(1500);
  const confirm=page.locator('[role="dialog"] button').filter({hasText:/^Delete$/}).last();
  out.confirmBtn=await confirm.count();
  if(out.confirmBtn) await confirm.click();
  const snaps=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(600);
    snaps.push(await page.evaluate((tag)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      const all=[...document.querySelectorAll('main [data-message-id]')];
      const mine=all.filter(e=>(e.innerText||'').includes(tag));
      const tomb=all.filter(e=>/This message was deleted/i.test(e.innerText||'')).length;
      return {stillText:mine.length, tombstones:tomb,
        toasts:[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,44))};}, tag)); }
  await page.unroute(u=>/\/messaging\/channels\/[^/]+\/messages$/.test(new URL(u).pathname)).catch(()=>{});
  out.author={deleteAttempts:dels, finalStillText:snaps[snaps.length-1].stillText,
    tombstonesSeen:Math.max(...snaps.map(s=>s.tombstones)),
    toastsEver:[...new Set(snaps.flatMap(s=>s.toasts))]};
  out.server=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const hit=a.find(m=>(m.body||'').includes(tag.split(' ')[1]));
    return hit?{present:true, body:(hit.body||'').slice(0,30), deleted:hit.deleted_at??hit.is_deleted??null}
              :{present:false};}, {ch,tag});
  return out;
};
