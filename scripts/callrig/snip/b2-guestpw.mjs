export default async ({page}) => {
  const NAME=process.env.QA_GNAME||'PW Visitor', PW=process.env.QA_GPW;
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const nameInp = await page.$('input[type=text]');
  if(nameInp){ await nameInp.fill(''); await nameInp.fill(NAME); }
  await page.waitForTimeout(700);
  const afterName = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/join call/i.test((x.innerText||'').trim()));
    const pw=[...document.querySelectorAll('input[type=password]')].filter(vis)[0];
    let label=null;
    if(pw){ let n=pw; for(let k=0;k<4&&n.parentElement;k++){ n=n.parentElement; const t=(n.innerText||'').trim(); if(t.length>3){ label=t.replace(/\s+/g,' ').slice(0,80); break; } } }
    return {joinDisabled:b?b.disabled:null, pwLabel:label, pwRequired:pw?pw.required:null}; }, V);
  if(PW!==undefined){
    const pw = await page.$('input[type=password]');
    if(pw){ await pw.fill(PW); await page.waitForTimeout(500); }
  }
  const afterPw = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/join call/i.test((x.innerText||'').trim()));
    return {joinDisabled:b?b.disabled:null}; }, V);
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/join call/i.test((x.innerText||'').trim()));
    if(b && !b.disabled) b.click(); }, V);
  await page.waitForTimeout(9000);
  const result = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href, body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {afterName, afterPw, result};
};
