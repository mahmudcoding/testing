import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const kind = process.env.QA_KIND || 'long';
  const msg = kind === 'url'
    ? 'link ' + 'https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001?a=1&b=2&c=3456789012345678901234567890 end'
    : kind === 'nospace'
    ? 'X'.repeat(220)
    : ('lorem ipsum dolor sit amet '.repeat(24)).trim();
  const out={kind, len: msg.length};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2200); }
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('[contenteditable="true"],textarea')].filter(vis)[0];
    e.focus();
    if(e.isContentEditable){document.execCommand('selectAll',false,null);document.execCommand('delete',false,null);}
    else {const d=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value'); d.set.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true}));}
  }, VIS);
  await page.keyboard.type(msg.slice(0,80), {delay:2});
  await page.evaluate((rest)=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('textarea')][0];
    if(e){ const d=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value');
      d.set.call(e, e.value + rest); e.dispatchEvent(new Event('input',{bubbles:true})); } }, msg.slice(80));
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  out.result = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const msgs=[...p.querySelectorAll('[data-testid="ic-user-message"]')].filter(vis);
    const last=msgs[msgs.length-1];
    if(!last) return {err:'no message'};
    const overflow=[...last.querySelectorAll('*')].filter(e=>!e.childElementCount)
      .filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>e.tagName.toLowerCase()+':'+e.scrollWidth+'>'+e.clientWidth);
    const r=last.getBoundingClientRect(), pr=p.getBoundingClientRect();
    return {txtLen:(last.innerText||'').length, box:`${Math.round(r.width)}x${Math.round(r.height)}`,
      panelW:Math.round(pr.width), overflowLeaves:overflow.slice(0,5),
      msgOverflow: last.scrollWidth>last.clientWidth+1 ? last.scrollWidth+'>'+last.clientWidth : 'none',
      tail:(last.innerText||'').replace(/\s+/g,' ').slice(-60)}; }, VIS);
  return out;
};
