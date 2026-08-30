export default async ({page}) => await page.evaluate(()=>{
  const b=document.querySelector('[data-testid="call-controls-screen-share"]');
  return b?{l:b.getAttribute('aria-label'),txt:(b.innerText||'').trim(),dis:b.disabled,pressed:b.getAttribute('aria-pressed'),data:b.getAttribute('data-active')}:null;});
