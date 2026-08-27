export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  const click=async(name)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
    await page.waitForTimeout(4500);
    const ok=await page.evaluate((name)=>{
      let best=null;
      for (const el of document.querySelectorAll('main *')){
        const t=el.innerText||''; if(!t.includes(name)) continue;
        const b=[...el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message');
        if(!b) continue;
        const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
        if(!best||a<best.a) best={el,a};
      }
      if(!best) return false;
      const names=[...new Set((best.el.innerText||'').match(/QA [A-Z][a-z]+/g)||[])];
      if(names.length!==1) return false;
      [...best.el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message')
        .setAttribute('data-qa-msgbtn','1');
      return true;
    }, name);
    if(!ok) return {err:'row not isolated'};
    const reqs=[];
    const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
      reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,30)); };
    page.on('request', onReq);
    await page.locator('[data-qa-msgbtn="1"]').click();
    await page.waitForTimeout(4000);
    page.off('request', onReq);
    return {url:page.url().split('/d/')[1], reqs};
  };
  out.first  = await click('QA Dave');
  out.second = await click('QA Dave');
  out.same = out.first.url && out.first.url===out.second.url;
  out.sidebar = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,16)));
  return out;
};
