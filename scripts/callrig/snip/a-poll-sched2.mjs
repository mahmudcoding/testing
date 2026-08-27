export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const N = Number(process.env.QA_FRAMES || 320);
  const frames=[];
  for (let i=0;i<N;i++) {
    const f = await page.evaluate(() => {
      const m = document.querySelector('main')||document.body;
      const sched = m.querySelector('[data-testid="calls-scheduled-today"]');
      let btns = [];
      if (sched) btns = [...sched.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)+(b.disabled?'[dis]':'')));
      return {s: sched? sched.innerText.replace(/\n+/g,' | ').slice(0,300):null, b: btns.join(',')};
    });
    frames.push({t:new Date().toISOString().slice(11,19), ...f});
    await page.waitForTimeout(300);
  }
  const trail=[]; let last=null;
  for (const x of frames) { const k=x.s+'|'+x.b; if(k!==last){trail.push(x); last=k;} }
  return {frames: frames.length, first: frames[0].t, last: frames[frames.length-1].t, trail: trail.slice(0,14)};
};
