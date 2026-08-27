const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(4000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/bob-sees-share.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const clipped=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&e.scrollWidth>e.clientWidth+1)
      .map(e=>({tag:e.tagName,txt:(e.innerText||'').trim().slice(0,30),sw:e.scrollWidth,cw:e.clientWidth}));
    const offscreen=[...document.querySelectorAll('button')].filter(e=>vis(e))
      .filter(e=>e.getBoundingClientRect().left>=innerWidth).map(e=>(e.getAttribute('aria-label')||'').slice(0,24));
    return { videos:[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,rw:Math.round(v.getBoundingClientRect().width),rh:Math.round(v.getBoundingClientRect().height)})),
      shareText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/shar/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,44)).slice(0,5),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>({txt:(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
        sw:t.scrollWidth,cw:t.clientWidth,rw:Math.round(t.getBoundingClientRect().width)})).filter(t=>t.txt),
      clippedLeaves:clipped.slice(0,6), offscreenButtons:offscreen,
      docScrollW:document.documentElement.scrollWidth, innerW:innerWidth,
      mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,180) };},VS);
};
