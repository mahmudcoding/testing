export default async ({page}) => {
  const r = await page.evaluate((src)=>{
    const RE=new RegExp(src,'i');
    const cands=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')]
      .filter(e=>e.getClientRects().length && e.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=cands[cands.length-1]; if(!pick) return {err:'no open menu/dialog'};
    const it=[...pick.querySelectorAll('[role="menuitem"],[role="menuitemcheckbox"],button')]
      .filter(e=>e.getClientRects().length).find(e=>RE.test((e.textContent||'').trim()));
    if(!it) return {err:'no item', had:[...pick.querySelectorAll('button')].map(e=>(e.textContent||'').trim()).slice(0,20)};
    it.click(); return {clicked:(it.textContent||'').trim()};
  }, process.env.QA_ITEM);
  await page.waitForTimeout(2500);
  const after = await page.evaluate(()=>{
    const dlg=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
      .filter(e=>e.getClientRects().length&&e.getAttribute('data-testid')!=='call-overlay-expanded');
    return {dialogs: dlg.map(d=>({tid:d.getAttribute('data-testid'), text:(d.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.textContent||'').trim().slice(0,25))}))};
  });
  return {r, after};
};
