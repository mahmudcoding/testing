export default async ({page}) => await page.evaluate(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>/camera/i.test(x.getAttribute('aria-label')||'') && !/Select/i.test(x.getAttribute('aria-label')||''));
  return b? {label:b.getAttribute('aria-label'), disabled:b.disabled, pressed:b.getAttribute('aria-pressed'), title:b.getAttribute('title')}:'none';
});
