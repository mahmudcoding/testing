export default async ({page}) => {
  const rd=()=>page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/will be right back|i'm back|back/i.test(x.getAttribute('aria-label')||''));
    return {label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null};});
  const before=await rd();
  const c=await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Will be right back$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no wbrb btn'}; b.click(); return {ok:true};});
  if(c.err) return {before, ...c};
  await page.waitForTimeout(4000);
  return {before, after: await rd()};
};
