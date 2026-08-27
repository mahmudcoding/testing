import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const net=[]; const dls=[];
  page.on('response', async r => { const u=r.url();
    if(/file|download|storage|minio|s3/i.test(u) && !/\.(js|css|woff2?)($|\?)/.test(u))
      net.push(r.status()+' '+r.request().method()+' '+u.replace(/^https?:\/\/[^/]+/,'').slice(0,66)
        +' ct='+((r.headers()['content-type']||'').slice(0,26))
        +' cd='+((r.headers()['content-disposition']||'(none)').slice(0,44))); });
  page.on('download', d => dls.push({name:d.suggestedFilename(), url:d.url().replace(/^https?:\/\/[^/]+/,'').slice(0,56)}));
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const tile = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const t=[...m.querySelectorAll('button,[role=button],a')].filter(vis)
      .find(b=>/\\.(png|jpg|jpeg|pdf|txt|md|webp)/i.test(b.getAttribute('aria-label')||b.textContent||''));
    if(!t) return null; const r=t.getBoundingClientRect();
    return {label:(t.getAttribute('aria-label')||t.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40),
            cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile = tile;
  if(!tile) return out;
  await page.mouse.move(tile.cx, tile.cy); await page.waitForTimeout(1600);
  out.onHover = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return [...new Set([...m.querySelectorAll('button,[role=button],a[href]')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,28)).filter(Boolean))]
      .filter(x=>!/^(Grid view|List view|Upload|My files|Shared with me|All files|Images|Documents|Videos|Audio|Archives|All chats|Favorites|Date|Name|Size)/.test(x)).slice(0,14); })()`);
  // right-click for a context menu
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2000);
  out.onRightClick = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-state=open] button')].filter(vis)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,14); })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // open the viewer and look there
  await page.mouse.click(tile.cx, tile.cy); await page.waitForTimeout(5000);
  out.viewer = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>200).pop();
     const root=d||document.body;
     return {isDialog:!!d, controls:[...new Set([...root.querySelectorAll('button,a[href]')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26)).filter(Boolean))].slice(0,16)}; })()`);
  net.length=0;
  out.dlClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>200).pop();
     return clickDeepest(d||document.body, /Download|Save/i); })()`);
  await page.waitForTimeout(9000);
  out.downloads = dls; out.net = net.slice(0,6);
  return out;
};
