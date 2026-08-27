export default async ({page, ctx}) => {
  await ctx.clearCookies();
  const LINK=process.env.QA_LINK;
  await page.goto('about:blank');
  await page.goto(LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const v=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  return await page.evaluate((vs)=>{ const vis=eval(vs);
    return {url:location.href,
      text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,450),
      inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>({type:i.type, ph:i.placeholder})),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,36), dis:b.disabled||undefined}))};
  }, v);
};
