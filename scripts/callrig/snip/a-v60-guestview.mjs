const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(3000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-incall.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,46),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
      videos:document.querySelectorAll('video').length };},VS);
};
