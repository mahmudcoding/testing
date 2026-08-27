import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const idx = Number(process.env.QA_IDX || 0);
  const r = await page.evaluate(([i,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const btns=[...p.querySelectorAll('[data-testid="side-room-close"]')].filter(vis);
    if(!btns[i]) return {err:'no close button at index '+i, n:btns.length};
    // report which card it belongs to
    let card=btns[i].closest('li') || btns[i].parentElement;
    while (card && (card.innerText||'').length < 12) card = card.parentElement;
    btns[i].click();
    return {ok:true, n:btns.length, card:(card?card.innerText:'').replace(/\s+/g,' ').slice(0,60)};
  }, [idx, VIS]);
  await page.waitForTimeout(2200);
  return r;
}
