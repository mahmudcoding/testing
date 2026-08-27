export default async ({page}) => {
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(1800);
  return await page.evaluate(()=>{
    const roots=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper],[role="dialog"]')].filter(e=>e.getClientRects().length);
    const dump = (e)=>({tag:e.tagName, role:e.getAttribute('role'), cls:String(e.className||'').slice(0,50),
      txt:(e.innerText||'').replace(/\n+/g,' | ').slice(0,400)});
    const btns=[...document.querySelectorAll('button,[role="menuitem"],[role="menuitemradio"],[role="option"],[role="menuitemcheckbox"]')]
      .filter(e=>e.getClientRects().length && /fake|micro|speaker|default/i.test(e.textContent||''))
      .map(e=>({tag:e.tagName, role:e.getAttribute('role'), txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,45),
        pressed:e.getAttribute('aria-pressed'), checked:e.getAttribute('aria-checked'), sel:e.getAttribute('data-selected'),
        bg:getComputedStyle(e).backgroundColor, svgs:e.querySelectorAll('svg').length, testid:e.getAttribute('data-testid')}));
    return {roots: roots.map(dump), candidates: btns};
  });
};
