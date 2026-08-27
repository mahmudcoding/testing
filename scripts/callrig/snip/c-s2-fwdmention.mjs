const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  // original in qa-general
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  out.original = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-MENTRENDER/.test(m.innerText||'')).pop();
    if(!el) return null;
    const chips=[...el.querySelectorAll('span,a,button')].filter(x=>/^@/.test((x.textContent||'').trim())).map(x=>(x.textContent||'').trim().slice(0,20));
    return {text:el.innerText.replace(/\n+/g,' | ').slice(0,120), atChips:chips};
  });
  // forwarded copy in qa-private
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  out.forwarded = await page.evaluate(async ()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-MENTRENDER/.test(m.innerText||'')).pop();
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    if(!el) return {api:{body:m.body, fwd:JSON.stringify(m.forwarded_from||null).slice(0,200)}};
    const chips=[...el.querySelectorAll('span,a,button')].filter(x=>/^@/.test((x.textContent||'').trim())).map(x=>(x.textContent||'').trim().slice(0,20));
    return {text:el.innerText.replace(/\n+/g,' | ').slice(0,150), atChips:chips,
      api:{body:m.body, fwdBody:(m.forwarded_from&&m.forwarded_from.body||'').slice(0,60)}};
  });
  return out;
};
