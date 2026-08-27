// Finding 1+2: open QA Bob card (control), record from BEFORE the Block click, then re-check.
const VIS = `(e)=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
  let n=e,o=1; while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false;
  o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;}`;

export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(4500);

  const card = async () => page.evaluate(`(()=>{const vis=${VIS};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    const inter=[...d.querySelectorAll('button,a[href],[role=button],[role=menuitem],[role=switch],input,select,[tabindex]:not([tabindex="-1"])')]
      .filter(vis).map(e=>({tag:e.tagName, l:(e.getAttribute('aria-label')||e.innerText||e.value||'').replace(/\\s+/g,' ').trim().slice(0,40), dis:!!e.disabled||e.getAttribute('aria-disabled')==='true'}));
    return {text:d.innerText.replace(/\\s+/g,' ').slice(0,400), interactive:inter};
  })()`);

  // control: open Bob's card BEFORE any block
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(2500);
  const before = await card();

  // install recorder BEFORE clicking Block
  await page.evaluate(`(()=>{const vis=${VIS};
    window.__rec=[]; window.__t0=Date.now();
    window.__iv=setInterval(()=>{
      const dl=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis);
      const to=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],li[data-sonner-toast],[class*=toast],[class*=Toast]')].filter(vis)
        .map(t=>t.innerText.replace(/\\s+/g,' ').trim().slice(0,90)).filter(Boolean);
      window.__rec.push({t:Date.now()-window.__t0, d:dl.map(x=>x.innerText.replace(/\\s+/g,' ').slice(0,110)), to});
    },150);
  })()`);
  await page.waitForTimeout(600);

  await page.locator('[role=dialog]').last().locator('button', {hasText:/^Block$/}).first().click();
  await page.waitForTimeout(7000);

  const rec = await page.evaluate(`(()=>{clearInterval(window.__iv);
    const r=window.__rec; const uniq=[]; let prev=null;
    for(const s of r){const k=JSON.stringify([s.d,s.to]); if(k!==prev){uniq.push(s); prev=k;}}
    return {samples:r.length, spanMs:r.length?r[r.length-1].t:0, changes:uniq.slice(0,25)};})()`);

  const api = await page.evaluate(async()=>{const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});return {s:r.status,b:(await r.text()).slice(0,300)};});
  return {before, recordedFromBeforeClick: rec, blockedApi: api};
};
