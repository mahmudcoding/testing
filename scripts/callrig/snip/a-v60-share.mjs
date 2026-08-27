const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV2MX4P25ZSKK',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const b = page.locator('button[aria-label="Share screen"]').first();
  out.found = await b.count()>0;
  if(!out.found) return out;
  await b.click();
  await page.waitForTimeout(9000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/alice-sharing.png'});
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { gdm:(window.__gdmCalls||[]).length,
      shareBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/shar/i.test(a)),
      videos:[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,rw:Math.round(v.getBoundingClientRect().width)})),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  return out;
};
