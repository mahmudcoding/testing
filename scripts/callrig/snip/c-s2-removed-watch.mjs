const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  return await page.evaluate(()=>{
    if (window.__rm) clearInterval(window.__rm.id);
    const rec={events:[], t0:performance.now()};
    const push=()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      const st={url:location.href,
        msgs:document.querySelectorAll('[data-message-id]').length,
        composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2),
        main:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,90),
        vis:document.visibilityState};
      const key=JSON.stringify(st);
      const last=rec.events[rec.events.length-1];
      if(!last||last.key!==key) rec.events.push({key, ms:Math.round(performance.now()-rec.t0), ...st});
    };
    new MutationObserver(push).observe(document.body,{subtree:true,childList:true,characterData:true});
    rec.id=setInterval(push,400); window.__rm=rec; push();
    return {started:true, url:location.href, vis:document.visibilityState};
  });
};
