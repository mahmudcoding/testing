export default async ({page}) => {
  const NAME=process.env.QA_GNAME||'QA Visitor';
  const inp = await page.$('input[type=text]');
  if(!inp) return {noInput:true, txt: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,300))};
  await inp.fill(NAME);
  await page.waitForTimeout(600);
  const clicked = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=[...document.querySelectorAll('button')].filter(v).find(x=>/join call/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return {dis: b?b.disabled:null};
  });
  await page.waitForTimeout(9000);
  return {clicked, after: await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    return {url:location.href, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400),
            btns:[...document.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,20)};
  })};
};
