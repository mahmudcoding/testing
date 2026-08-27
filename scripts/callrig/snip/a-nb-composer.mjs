import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const ed=[...p.querySelectorAll('[contenteditable],textarea,input[type=text]')].filter(vis)
      .map(e=>({tag:e.tagName.toLowerCase(), ce:e.getAttribute('contenteditable'),
                disabled:e.disabled??null, ro:e.readOnly??null,
                al:e.getAttribute('aria-label'), ad:e.getAttribute('aria-disabled')}));
    const send=[...p.querySelectorAll('button')].filter(vis)
      .filter(b=>/^Send$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim()))
      .map(b=>({disabled:b.disabled, ad:b.getAttribute('aria-disabled')}));
    return {editors:ed, send}; }, VIS);
}
