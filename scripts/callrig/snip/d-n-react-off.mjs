export default async ({page}) => {
  const out={};
  out.toolbar = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-controls-live-reaction"]');
    return b?{l:b.getAttribute('aria-label'),dis:b.disabled,ariaDis:b.getAttribute('aria-disabled'),title:b.title||null}:null;});
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  out.trigs = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="ic-message-react-trigger"]')]
    .map(e=>({dis:e.disabled, ariaDis:e.getAttribute('aria-disabled'), vis:e.getBoundingClientRect().width>1})));
  out.panelNotice = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    return ((p.innerText||'').match(/(Chat|Reaction)[^.\n]*(disabled|off)[^.\n]*/i)||[null])[0];});
  return out;
};
