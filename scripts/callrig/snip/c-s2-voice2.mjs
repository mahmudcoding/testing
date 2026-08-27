const CH='C4QCGENERAL0001';
export default async ({page}) => {
  const vis=`(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;}`;
  const snap = (tag) => page.evaluate(([t,visSrc]) => {
    const vis = eval(visSrc);
    const comp=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=comp; for(let i=0;i<4&&box;i++) box=box.parentElement;
    const btns = box? [...box.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)):[];
    const last=[...document.querySelectorAll('[data-message-id]')].pop();
    return {tag:t, composerButtons:btns, composerText: box? box.innerText.replace(/\n+/g,' | ').slice(0,160):null,
      n: document.querySelectorAll('[data-message-id]').length,
      lastMsg: last? last.innerText.replace(/\n+/g,' | ').slice(0,120):null,
      audios: [...document.querySelectorAll('audio')].map(a=>({src:(a.currentSrc||a.src||'').slice(0,60), dur:a.duration}))};
  }, [tag, vis]);
  const out={};
  out.beforeStop = await snap('before-stop');
  await page.locator('button[aria-label="Stop recording"]').last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.afterStop = await snap('after-stop');
  return out;
};
