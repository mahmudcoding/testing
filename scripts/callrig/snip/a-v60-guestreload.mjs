const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.before = await page.evaluate((vs)=>{const vis=eval(vs);
    return { tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,3) };},VS);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-after-reload.png'});
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,46),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,3),
      leaveBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22)).filter(t=>/leave|close|ask to join/i.test(t)),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240) };},VS);
  return out;
};
