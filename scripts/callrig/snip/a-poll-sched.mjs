export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const frames=[];
  for (let i=0;i<130;i++) {
    const f = await page.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
      const m = document.querySelector('main')||document.body;
      const sched = m.querySelector('[data-testid="calls-scheduled-today"]');
      const live = [...m.querySelectorAll('*')].find(e=>/Live now/.test(e.textContent||'') && e.children.length<8);
      const ov = [...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e); return s.position==='fixed'&&vis(e)&&Number(s.zIndex||0)>5&&(e.innerText||'').trim().length>0;})
        .map(e=>(e.getAttribute('data-testid')||e.tagName)+':'+(e.innerText||'').replace(/\n+/g,' ').slice(0,50));
      return {s: sched? sched.innerText.replace(/\n+/g,' | ').slice(0,260):null,
              l: live? live.innerText.replace(/\n+/g,' | ').slice(0,150):null,
              o: ov.join(' ~~ ').slice(0,160)};
    });
    frames.push({t:new Date().toISOString().slice(11,19), ...f});
    await page.waitForTimeout(300);
  }
  const trail=[]; let last=null;
  for (const x of frames) { const k=x.s+'|'+x.l+'|'+x.o; if(k!==last){trail.push(x); last=k;} }
  return {frames: frames.length, trail: trail.slice(0,16)};
};
