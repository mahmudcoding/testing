import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const t = await page.$('button[data-testid="call-controls-chat-toggle"]');
  const out = {toggle: !!t};
  if (t) { const p = await t.getAttribute('aria-pressed'); out.pressed = p;
    if (p !== 'true') { const bb = await t.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2500); } }
  out.res = await page.evaluate(()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    if(!p) return {noPanel:true};
    return {text:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,600),
      fields:[...p.querySelectorAll('input,textarea,[contenteditable]')].map(i=>({tag:i.tagName, type:i.type,
        ph:i.placeholder, al:i.getAttribute('aria-label'), ce:i.getAttribute('contenteditable'), tid:i.getAttribute('data-testid'),
        vis: vis(i)})),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), t:b.getAttribute('data-testid')}))};
  });
  return out;
};
