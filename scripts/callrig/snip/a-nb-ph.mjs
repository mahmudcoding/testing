export default async ({page}) => await page.evaluate(()=>{
  const p=document.querySelector('[data-testid="call-side-panel-slot"]');
  const ed=[...p.querySelectorAll('[contenteditable="true"]')].pop();
  if(!ed) return {err:'none'};
  const r=ed.getBoundingClientRect();
  const sib=[...(ed.parentElement?ed.parentElement.children:[])].map(c=>({tag:c.tagName.toLowerCase(),
    cls:String(c.className||'').slice(0,50), txt:(c.textContent||'').trim().slice(0,40),
    rect:(()=>{const q=c.getBoundingClientRect();return `${Math.round(q.width)}x${Math.round(q.height)}`;})()}));
  return {ph:ed.getAttribute('data-placeholder'), rect:`${Math.round(r.width)}x${Math.round(r.height)}`,
    before:getComputedStyle(ed,'::before').content, after:getComputedStyle(ed,'::after').content,
    ariaLabel:ed.getAttribute('aria-label'), labelledby:ed.getAttribute('aria-labelledby'), siblings:sib};
});
