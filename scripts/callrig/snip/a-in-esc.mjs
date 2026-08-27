export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  return await page.evaluate(()=>({
    backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].length,
    dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(d=>{const q=d.getBoundingClientRect();return q.width>2;})
      .map(d=>d.getAttribute('data-testid')||(d.innerText||'').replace(/\s+/g,' ').slice(0,50)),
    panel:(document.querySelector('[data-testid="call-side-panel-slot"]')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,120)}));
};
