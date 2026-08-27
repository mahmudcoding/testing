export default async ({page}) => {
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const join=[...document.querySelectorAll('button')].filter(v).find(b=>(b.innerText||'').trim()==='Join');
    if(!join) return {noJoin:true};
    let card=join; for(let i=0;i<6 && card.parentElement;i++){ card=card.parentElement; if(/QA takeover test/.test(card.innerText||'')) break; }
    return {
      cardText: (card.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      cardTid: card.getAttribute('data-testid'),
      controls: [...card.querySelectorAll('button,a[href]')].filter(v).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,36), tid:b.getAttribute('data-testid')||undefined})),
      pipPresent: !!document.querySelector('[data-testid="pip-mini-call"]')
    };
  });
};
