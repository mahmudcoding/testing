import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const ui = await page.evaluate('('+UI_STATE+')()');
  const tiles = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[aria-label^="Participant actions for"]').forEach(b => {
      const tile = b.closest('div');
      out.push({who: b.getAttribute('aria-label').replace('Participant actions for ',''),
                icons: [...(tile?.parentElement||document).querySelectorAll('img,svg')].map(i=>i.getAttribute('aria-label')||i.getAttribute('alt')||'').filter(Boolean).slice(0,8)});
    });
    // participant tile status text
    const stage = document.querySelector('[data-testid="call-overlay-expanded"]') || document;
    return {out, stageText: stage.innerText.replace(/\n+/g,' | ').slice(0,500)};
  });
  return {text: ui.text, tiles, buttons: ui.buttons.map(b=>b.l+(b.p!==null?'['+b.p+']':'')).join(', ')};
};
