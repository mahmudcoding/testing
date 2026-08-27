// Finding 5, step 1: alice reads #qa-general, moves to #qa-private, arms a sidebar recorder.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', GEN='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${GEN}`, {waitUntil:'load'});
  await page.waitForTimeout(7000);                       // sit in #qa-general so it is read
  const muteState = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button[aria-label]')].find(x=>/^(Mute|Unmute) notifications$/.test(x.getAttribute('aria-label')));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:{noButton:true};
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${PRIV}`, {waitUntil:'load'});
  await page.waitForTimeout(6000);

  const armed = await page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;};
    const rows = () => [...document.querySelectorAll('nav a[aria-label],nav button[aria-label],aside a[aria-label],aside button[aria-label],[data-testid*=sidebar] a[aria-label]')]
        .filter(e=>vis(e) && /qa-/.test(e.getAttribute('aria-label')||''))
        .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)}));
    window.__ur=[]; window.__t0=Date.now();
    window.__urIv=setInterval(()=>{
      window.__ur.push({t:Date.now()-window.__t0, rows:rows(), vis:document.visibilityState,
        openMsgs:document.querySelectorAll('[data-message-id]').length});
    },300);
    return {rows:rows(), vis:document.visibilityState, url:location.pathname};
  });
  return {muteStateOfQaGeneral:muteState, armed};
};
