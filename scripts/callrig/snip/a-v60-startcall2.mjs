const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const name='V60 Live '+Math.floor(Date.now()/1000%100000);
  const ti = await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type(name,{delay:20}); }
  await page.waitForTimeout(600);
  await page.locator('[role="dialog"] button', { hasText: /^Start call$/ }).first().click();
  await page.waitForTimeout(7000);
  out.name=name;
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      videos:[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,hasSrc:!!v.srcObject})),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,24),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,220) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/incall-alice.png'});
  return out;
};
