export default async ({page}) => page.evaluate(()=>{
  const stage=[...document.querySelectorAll('[role="dialog"]')].find(d=>/call-top-bar/.test(d.innerHTML))||document;
  const tb=document.querySelector('[data-testid="call-top-bar"]');
  const marks=[...document.querySelectorAll('[data-testid*="record"],[aria-label*="ecord"],[title*="ecord"]')]
    .map(e=>({tid:e.getAttribute('data-testid'), al:e.getAttribute('aria-label'), t:e.getAttribute('title'),
              txt:(e.innerText||'').trim().slice(0,24),
              vis:(()=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})()}));
  return {topBar: tb?tb.innerText.replace(/\n+/g,' | ').slice(0,90):null,
    recMarks: marks.slice(0,6),
    stageHasREC: /\bREC\b|Recording/.test(tb?tb.innerText:'')};
});
