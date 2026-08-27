export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const CALL=process.env.QA_CALL;
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(async ()=>{
    const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
    const m=document.querySelector('main')||document.body;
    const txt=(document.body.innerText||'');
    let pre=null; try{ pre=(await (await fetch(`/api/v1/meeting/${location.pathname.split('/call/')[1]}`,{credentials:'include'})).text()).slice(0,300);}catch(e){}
    return {
      url: location.pathname,
      lobbyText: (m.innerText||'').replace(/\n+/g,' | ').slice(0,600),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(-12),
      checkboxes: [...document.querySelectorAll('input[type=checkbox],[role="checkbox"]')].filter(vis).length,
      recWords: (txt.match(/[^\n]*(record|consent|transcri)[^\n]*/gi)||[]).slice(0,6),
      meetingJson: pre
    };
  });
};
