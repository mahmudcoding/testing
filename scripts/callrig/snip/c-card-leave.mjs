export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWBEYLQ71W43O';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const card = await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    return [...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({tag:e.tagName, t:e.textContent.trim().slice(0,45), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}));}, V);
  // find leave: channel name dropdown in header, or Channel details
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(2500);
  const details = await page.evaluate(v=>{const vv=eval(v);
    const panels=[...document.querySelectorAll('[role=dialog],aside,[data-panel],section')].filter(vv)
      .filter(p=>/Members|About|Leave|Archive|Topic/i.test(p.innerText||''));
    const p=panels.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!p) return {none:true, allBtns:[...document.querySelectorAll('button')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,28)).slice(-25)};
    return {text:p.innerText.replace(/\s+/g,' ').slice(0,400),
      btns:[...p.querySelectorAll('button,a')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean).slice(0,25)};}, V);
  return {linkCardLeaves: card, channelDetails: details};
};
