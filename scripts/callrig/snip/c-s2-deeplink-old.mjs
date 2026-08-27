const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  // find the very oldest message id by walking pages via the API
  out.oldest = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json(); const l=j.messages||[];
    return {oldestOnPage1:(l[l.length-1].body||'').slice(0,20), id:l[l.length-1].id, has_more:j.has_more};
  }, CH);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}?m=${out.oldest.id}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  out.after = await page.evaluate((wantId)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const statuses=[...document.querySelectorAll('[role="status"]')].filter(vis)
      .map(e=>({t:(e.textContent||'').trim().slice(0,90), sticky:getComputedStyle(e).position}));
    const t=document.querySelector(`[data-message-id="${wantId}"]`);
    return {n:document.querySelectorAll('[data-message-id]').length,
      targetPresent: !!t, targetY: t? Math.round(t.getBoundingClientRect().y):null,
      statuses, bodyHasOlder:/older than|loaded history|Dismiss/i.test(document.body.innerText)};
  }, out.oldest.id);
  return out;
};
