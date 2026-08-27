export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(11000);
  return page.evaluate(()=>{
    const vis=(e)=>{let op=1,n=e;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
      return +op.toFixed(2);};
    const hits=[...document.querySelectorAll('button')]
      .filter(b=>/^(Add users|Add teammates)$/i.test((b.innerText||b.getAttribute('aria-label')||'').trim()));
    const main=document.querySelector('main');
    return {found:hits.length,
      details:hits.map(b=>{const r=b.getBoundingClientRect();
        const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
        return {text:(b.innerText||'').trim().slice(0,20),
          rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
          opacityProduct:vis(b),
          hitIsSelfOrChild:!!hit&&(b.contains(hit)||hit.contains(b))};}),
      viewport:{w:innerWidth,h:innerHeight},
      mainTextHead:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,140):'NO-MAIN'};
  });
};
