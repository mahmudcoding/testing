import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/')&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
      calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,42)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const click = async re => { const t=await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(240);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3800); return 'clicked'; };
  await click('/^Shared with me$/');
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/bob-shared/i.test(x.getAttribute('aria-label')||x.textContent||''));
     const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  // details panel: read every control WITH its disabled state
  await page.mouse.click(tile.cx,tile.cy,{button:'right'}); await page.waitForTimeout(2000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(4500);
  out.detailsControls = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return [];
     return [...d.querySelectorAll('button')].filter(vis)
       .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22))
             +'/disabled='+b.disabled+'/aria='+(b.getAttribute('aria-disabled')||'-')).slice(0,10); })()`);
  // ALK-1962: does Favorite work for a recipient?
  calls.length=0;
  out.favClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     return clickDeepest(c.pop()||document.body, /Add to favorites|^Favorite$/i); })()`);
  await page.waitForTimeout(6000);
  out.favCalls = calls.slice(0,3);
  out.favNotices = await page.evaluate(`(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
     return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
       .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,2); })()`);
  // did it land in Favorites?
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  await click('/^Favorites$/');
  out.favoritesTab = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,180))()`);
  return out;
};
