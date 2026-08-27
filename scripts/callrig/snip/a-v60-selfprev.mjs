const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(7000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/selfprev.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const vids=[...document.querySelectorAll('video')].map(v=>{
      const r=v.getBoundingClientRect();
      // find the nearest label to identify whose tile this is
      let n=v, lab=null;
      for(let i=0;i<4&&n;i++){ n=n.parentElement;
        const l=n&&[...n.querySelectorAll('*')].find(e=>e.children.length===0&&/QA |Visitor/.test(e.innerText||''));
        if(l){ lab=(l.innerText||'').replace(/\s+/g,' ').trim().slice(0,24); break; } }
      return { w:Math.round(r.width), h:Math.round(r.height), vw:v.videoWidth, vh:v.videoHeight,
               paused:v.paused, muted:v.muted, label:lab };});
    return { url:location.pathname.slice(-20), videoCount:vids.length, videos:vids,
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Batch Room/.test(t)) };},VS);
};
