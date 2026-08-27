const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG='QA-S2-OFFFILE-'+Math.random().toString(36).slice(2,6);
  const out={tag:TAG};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  const snap=()=>page.evaluate((TAG)=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const mine=els.filter(e=>(e.innerText||'').includes(TAG));
    return {inFeed:mine.length,
      chip:(()=>{const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
        const form=c?c.closest('form')||c.parentElement.parentElement.parentElement:null;
        return form? (form.innerText||'').replace(/\s+/g,' ').slice(0,70):null;})(),
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50)))],
      tail: mine[0]? (mine[0].innerText||'').replace(/\s+/g,' ').slice(-50):null};}, TAG);
  // attach while ONLINE (upload happens at send time per earlier measurement)
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m3.txt`);
  await page.waitForTimeout(3500);
  out.attached=await snap();
  // now go offline and send
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  await comp.click(); await comp.type(TAG,{delay:40}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  const s1=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(1000); s1.push(await snap()); }
  const k=(s)=>JSON.stringify([s.inFeed,s.toasts,s.chip]);
  const c1=[]; let p=null; for(const s of s1){ if(k(s)!==p){c1.push(s);p=k(s);} }
  out.whileOffline={changes:c1.slice(0,5), final:s1[s1.length-1]};
  await ctx.setOffline(false);
  const s2=[]; for(let i=0;i<25;i++){ await page.waitForTimeout(1500); s2.push(await snap()); }
  const c2=[]; p=null; for(const s of s2){ if(k(s)!==p){c2.push(s);p=k(s);} }
  out.afterOnline={changes:c2.slice(0,5), final:s2[s2.length-1]};
  // server truth: print the newest bodies rather than searching for a substring
  out.serverNewest=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.messages||[]).map(m=>({seq:m.channel_seq, body:(m.body||'').slice(0,34),
      files:(m.files||m.attachments||[]).length}));}, ch);
  return out;
};
