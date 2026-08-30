export default async ({page}) => {
  const out={};
  const n=+(process.env.QA_N||100);
  const tag=process.env.QA_TAG||'X';
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const ta = page.locator('[data-testid="in-call-chat-panel"] textarea').first();
  out.attrs = await ta.evaluate(e=>({maxlength:e.maxLength, ph:e.placeholder}));
  const body = tag + 'x'.repeat(Math.max(0,n-tag.length));
  await ta.click();
  await ta.fill(body);
  await page.waitForTimeout(600);
  const v = await ta.inputValue();
  out.requested=n; out.accepted=v.length;
  out.counter = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    return [...new Set([...p.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/\d{2,}|limit|long|max/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,60)))];});
  const send = page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^Send$/}).first();
  out.sendDisabled = await send.isDisabled();
  if(!out.sendDisabled){ await page.keyboard.press('Enter'); await page.waitForTimeout(4000); }
  out.after = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    const last=rows[rows.length-1];
    return {rows:rows.length, lastLen:last?(last.innerText||'').length:0, lastTail:last?(last.innerText||'').replace(/\s+/g,' ').slice(-60):null};});
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,140)));
  out.inline = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/error|too long|failed|try again|limit/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,100)))];});
  out.composerAfter = await ta.inputValue().catch(()=>null);
  return out;
};
