export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,55)+' '+(r.postData()||'').slice(0,50)); };
  const rows=()=>page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0)
    .map(a=>({t:(a.innerText||'').replace(/\s+/g,' ').slice(0,18), y:Math.round(a.getBoundingClientRect().y), href:a.getAttribute('href')})));
  const menuOf=async(href,pick)=>{
    await page.locator(`a[href="${href}"]`).first().click({button:'right'});
    await page.waitForTimeout(1000);
    const txt=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');return m?(m.innerText||'').replace(/\s+/g,' ').slice(0,120):'none';});
    if(pick){ const it=page.locator('[role="menu"]').getByText(pick,{exact:true}).first();
      if(await it.count()){ await it.click(); await page.waitForTimeout(2000); } else await page.keyboard.press('Escape'); }
    else await page.keyboard.press('Escape');
    return txt;
  };
  page.on('request', onReq);
  const r0=await rows(); out.before=r0;
  // restore: unpin the first one if pinned
  out.menu0=await menuOf(r0[0].href, 'Unpin');
  await page.waitForTimeout(800);
  // now pin the SECOND row
  const r1=await rows();
  out.menu1=await menuOf(r1[1].href, 'Pin');
  await page.waitForTimeout(1500);
  page.off('request', onReq);
  out.afterPinSecond=await rows();
  out.sectionHeaders = await page.evaluate(()=>[...document.querySelectorAll('nav *, aside *')]
    .filter(e=>e.children.length===0)
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>6&&r.x<330;})
    .map(e=>e.textContent.trim()).filter(t=>t&&t.length<24).slice(0,20));
  await page.reload(); await page.waitForTimeout(5000);
  out.afterReload=await rows();
  return out;
};
