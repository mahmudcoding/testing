export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)+' '+(r.postData()||'').slice(0,50)); };
  out.dmRows = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0)
    .map(a=>({href:a.getAttribute('href'), txt:(a.innerText||'').replace(/\s+/g,' ').slice(0,30)})));
  if(!out.dmRows.length) return out;
  const lsKeys=()=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage)
    .filter(k=>/pin|sidebar|order|favou|favor/i.test(k)).map(k=>[k,String(localStorage.getItem(k)).slice(0,90)])));
  out.lsBefore=await lsKeys();
  const row=page.locator(`a[href="${out.dmRows[0].href}"]`).first();
  page.on('request', onReq);
  await row.click({button:'right'}); await page.waitForTimeout(1000);
  out.menu=await page.evaluate(()=>{
    const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT); const r=[];
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      const b=n.getBoundingClientRect(); if(b.width<12||b.height<8) continue;
      const t=(n.textContent||'').trim(); if(t&&t.length<30) r.push({t, y:Math.round(b.y), x:Math.round(b.x)}); }
    return r.filter(e=>/Pin|Mute|Preview|Clear|Block|Unpin/i.test(e.t));
  });
  const pin=out.menu.find(m=>/^Pin$|^Unpin$/.test(m.t));
  out.pin=pin||null;
  if(pin){ await page.mouse.click(pin.x+20, pin.y+6); await page.waitForTimeout(2000); }
  else await page.keyboard.press('Escape');
  page.off('request', onReq);
  out.lsAfter=await lsKeys();
  out.sidebarAfter = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"],a[href*="/c/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,24)));
  return out;
};
