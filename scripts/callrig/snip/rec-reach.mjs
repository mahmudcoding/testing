export default async ({page}) => {
  const inSummary = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    if (!d) return {noDialog:true};
    const nodes = [...d.querySelectorAll('*')].filter(e=>e.children.length===0 && /Available|Unavailable|Recording|Transcript/.test(e.textContent));
    return {rows: nodes.map(e=>{
      const clickable = e.closest('button,a,[role=button],[tabindex]');
      return {txt:e.textContent.trim().slice(0,40), tag:e.tagName,
              clickable: clickable? clickable.tagName+'#'+(clickable.getAttribute('data-testid')||'-'):null,
              cursor: getComputedStyle(e).cursor};
    })};
  });
  return inSummary;
};
