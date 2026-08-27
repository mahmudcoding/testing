export default async ({page}) => {
  const out={};
  // smallest element that contains both the person's name and a Message button
  const info = await page.evaluate((name)=>{
    let best=null;
    for (const el of document.querySelectorAll('main *')){
      const t=el.innerText||'';
      if(!t.includes(name)) continue;
      const btn=[...el.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||b.textContent.trim())==='Message');
      if(!btn) continue;
      const area=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
      if(!best||area<best.area) best={el, area};
    }
    if(!best) return null;
    const names=(best.el.innerText||'').match(/QA [A-Z][a-z]+/g)||[];
    best.el.setAttribute('data-qa-row','1');
    const b=[...best.el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message');
    b.setAttribute('data-qa-msgbtn','1');
    return {area:Math.round(best.area), namesInRow:[...new Set(names)],
      rowText:(best.el.innerText||'').replace(/\s+/g,' ').slice(0,70)};
  }, 'QA Dave');
  out.row=info;
  if(!info) return out;
  if(info.namesInRow.length!==1) { out.abort='row spans more than one person: '+info.namesInRow.join(','); return out; }
  out.sidebarBefore = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,18)));
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,45)+' '+(r.postData()||'').slice(0,50)); };
  page.on('request', onReq);
  await page.locator('[data-qa-msgbtn="1"]').click();
  await page.waitForTimeout(4000);
  page.off('request', onReq);
  out.reqs=reqs;
  out.url=page.url();
  out.sidebarAfter = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,18)));
  out.main = await page.evaluate(()=>{const m=document.querySelector('main');
    return (m?m.innerText:'').replace(/\s+/g,' ').slice(0,180);});
  return out;
};
