export default async ({page}) => {
  const which=process.env.QA_DIR==='prev'?'filmstrip-previous-page':'filmstrip-next-page';
  const b=page.locator('[data-testid="'+which+'"]');
  if(!await b.count()) return {err:'no '+which};
  const state=async()=>await page.evaluate(()=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(x=>{const n=x.querySelector('[data-testid="participant-name"]');const r=x.getBoundingClientRect();return {name:n?n.innerText.trim():'?',w:Math.round(r.width)};});
    const prev=document.querySelector('[data-testid="filmstrip-previous-page"]'), next=document.querySelector('[data-testid="filmstrip-next-page"]');
    return {stage:t.filter(x=>x.w>400).map(x=>x.name), strip:t.filter(x=>x.w<=400).map(x=>x.name),
      prevDisabled: prev?prev.disabled:null, nextDisabled: next?next.disabled:null,
      prevLabel: prev?prev.getAttribute('aria-label'):null, nextLabel: next?next.getAttribute('aria-label'):null};
  });
  const before=await state();
  await b.click();
  await page.waitForTimeout(2500);
  const after=await state();
  return {clicked:which, before, after};
};
