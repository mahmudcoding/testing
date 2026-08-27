const PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={};
  const snap = (t) => page.evaluate(async (tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=10',{credentials:'include'});
    const j=await r.json(); const list=j.messages||[];
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const mine=msgs.filter(m=>/QA-S2-RETRY/.test(m.innerText||''));
    return {tag, domN:msgs.length, apiRetry:list.filter(m=>/RETRY/.test(m.body||'')).map(m=>({id:m.id.slice(-6), body:m.body})),
      domRetry: mine.map(m=>({id:m.getAttribute('data-message-id').slice(-6),
        controls:[...m.querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean)}))};
  }, t);
  out.before = await snap('before-retry');
  await page.locator('button[aria-label="Message could not be sent"]').last().click({timeout:8000});
  await page.waitForTimeout(4000);
  out.afterRetry = await snap('after-retry');
  await page.waitForTimeout(3000);
  out.settled = await snap('settled');
  return out;
};
