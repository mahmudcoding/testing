export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const t=document.body.innerText.replace(/\s+/g,' ');
    // find the scheduled card and enumerate its buttons
    const cards=[...document.querySelectorAll('*')].filter(el=>el.children.length && (el.innerText||'').includes('QA scheduled start') && (el.innerText||'').length<300);
    const card=cards[cards.length-1];
    return {
      url: location.href,
      sched: (t.match(/Scheduled today.{0,170}/)||[])[0]||null,
      cardButtons: card? [...card.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean) : 'no-card',
      cardText: card? card.innerText.replace(/\s+/g,' ').slice(0,200) : null
    };
  });
};
