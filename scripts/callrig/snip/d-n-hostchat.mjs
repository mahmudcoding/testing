export default async ({page}) => {
  const out={};
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.count() && await s.getAttribute('aria-pressed')==='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1500); }
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(3000); }
  out.state = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    const ta=p.querySelector('textarea');
    const send=[...p.querySelectorAll('button')].find(b=>/^Send$/.test((b.innerText||'').trim()));
    return {ph:ta.placeholder, taDis:ta.disabled, sendDis:send?send.disabled:null,
      notice:((p.innerText||'').match(/Chat is [^.\n]*/)||[null])[0],
      react:p.querySelectorAll('[data-testid="ic-message-react-trigger"]').length};});
  // try to send anyway
  if(!out.state.taDis){
    const ta = page.locator('[data-testid="in-call-chat-panel"] textarea').first();
    await ta.click(); await ta.fill(''); await ta.type('DN-HOST-WHILE-CHAT-OFF',{delay:15}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
    out.afterSend = await page.evaluate(()=>{
      const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
      return {n:rows.length, last:(rows[rows.length-1].innerText||'').replace(/\s+/g,' ').slice(-60)};});
    out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,140)));
  }
  return out;
};
