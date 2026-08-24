export default async ({ctx}) => {
  const p = ctx.pages().find(x=>x.url().includes('guest/meeting/V4OTO9EN2PH58AM'));
  if (!p) return {err:'no live guest page'};
  const net=[];
  p.on('response', async r=>{const u=r.url(); if(u.includes('breakout')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const sr = p.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await sr.count()) { await sr.click(); await p.waitForTimeout(2500); }
  const panel = await p.evaluate(()=>{const s=document.querySelector('[data-testid="breakout-rooms-panel"]'); return s? {text:s.innerText.replace(/\n+/g,' | ').slice(0,300), btns:[...s.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)}#${b.getAttribute('data-testid')||'-'}`)}:'no panel';});
  const nb = p.locator('button', {hasText:'New Side Room'}).first();
  let made=null;
  if (await nb.count()) {
    await nb.click(); await p.waitForTimeout(1500);
    const nf = p.locator('[data-testid="side-room-create-name"]');
    if (await nf.count()) { await nf.fill('Guest Made Room'); await p.waitForTimeout(400); }
    const cb = p.locator('[role="dialog"] button', {hasText:/^Create room$/i}).first();
    if (await cb.count()) { await cb.click(); await p.waitForTimeout(5000); made='clicked'; }
  }
  const after = await p.evaluate(()=>({tabs:(document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,140),
    toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean)}));
  return {panel, made, net, after};
};
