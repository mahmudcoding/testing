export default async ({page}) => {
  const state = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    const ta=p?p.querySelector('textarea'):null;
    const send=p?[...p.querySelectorAll('button')].find(b=>/^Send$/i.test((b.textContent||'').trim())):null;
    return {
      banner: p? (p.innerText.match(/Chat is disabled[^|]*/)||[''])[0] : null,
      textarea: ta? {disabled:ta.disabled, readOnly:ta.readOnly, ariaDisabled:ta.getAttribute('aria-disabled'), placeholder:ta.placeholder, op:getComputedStyle(ta).opacity, pe:getComputedStyle(ta).pointerEvents}:null,
      send: send? {disabled:send.disabled, ariaDisabled:send.getAttribute('aria-disabled'), op:getComputedStyle(send).opacity, pe:getComputedStyle(send).pointerEvents}:null
    };
  });
  // try typing + sending through the UI
  const netlog=[]; 
  page.on('response', async r=>{const u=r.url(); if(u.includes('/messages')){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  let typed=null, sent=null;
  const ta = await page.$('[data-testid="in-call-chat-panel"] textarea');
  if (ta) { try { await ta.fill('QA-UI-BYPASS-2'); typed = await page.evaluate(()=>document.querySelector('[data-testid="in-call-chat-panel"] textarea').value); } catch(e){ typed='fill-failed: '+String(e).slice(0,60);} }
  const send = await page.$('[data-testid="in-call-chat-panel"] button:has-text("Send")');
  if (send) { try { await send.click({timeout:5000}); sent='clicked'; } catch(e){ sent='click-failed: '+String(e).slice(0,70);} }
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="in-call-chat-panel"]');return {toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,5), panel: p?p.innerText.replace(/\n+/g,' | ').slice(0,320):''};});
  return {state, typed, sent, net: netlog, after};
};
