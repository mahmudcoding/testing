import { VIS } from './a-nb-lib.mjs';
const MIC = `async () => { const pcs=window.__pcs||[]; const o=[];
  for (const pc of pcs) for (const s of pc.getSenders()) { if(!s.track||s.track.kind!=='audio') continue; o.push(s.track.enabled);} return o; }`;
export default async ({page}) => {
  const msg = process.env.QA_MSG || 'ptt space test one two';
  const out={msg};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2200); }
  out.micBefore = await page.evaluate('('+MIC+')()');
  const focused = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    const e=[...p.querySelectorAll('[contenteditable="true"],textarea,input[type=text]')].filter(vis)[0];
    if(!e) return {err:'no composer'};
    e.focus();
    if (e.isContentEditable){ document.execCommand('selectAll',false,null); document.execCommand('delete',false,null); }
    else { const d=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value')
            ||Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');
           d.set.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true})); }
    return {ok:true, tag:e.tagName.toLowerCase(), active:document.activeElement===e}; }, VIS);
  out.focused = focused;
  if (focused.err) return out;
  const samples=[];
  for (const ch of msg) { await page.keyboard.type(ch, {delay:35});
    if (ch===' ') samples.push(await page.evaluate('('+MIC+')()')); }
  out.micWhileTyping = samples;
  await page.waitForTimeout(600);
  out.typed = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('[contenteditable="true"],textarea,input[type=text]')].filter(vis)[0];
    return (e.isContentEditable? (e.innerText||'') : (e.value||'')).slice(0,60); }, VIS);
  out.micAfter = await page.evaluate('('+MIC+')()');
  return out;
};
