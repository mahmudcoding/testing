import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const net=[]; const dls=[];
  page.on('response', async r => { const u=r.url();
    if(/\/files?\/|download|storage|minio/i.test(u) && !/\.(js|css|woff2?)($|\?)/.test(u))
      net.push(r.status()+' '+r.request().method()+' '+u.replace(/^https?:\/\/[^/]+/,'').slice(0,70)
        +' ct='+((r.headers()['content-type']||'').slice(0,28))
        +' cd='+((r.headers()['content-disposition']||'(none)').slice(0,46))); });
  page.on('download', d => dls.push({name:d.suggestedFilename(), url:d.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60)}));
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.rows = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\\s+/g,' ');
    const btns=[...m.querySelectorAll('button,a[href]')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30)).filter(Boolean);
    return { text:t.slice(0,220), controls:[...new Set(btns)].slice(0,18) }; })()`);
  // open the row menu on the first file
  out.menuOpen = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const m=document.querySelector('main');
     const b=[...m.querySelectorAll('button')].filter(vis)
       .filter(x=>/more|option|menu|actions/i.test(x.getAttribute('aria-label')||''));
     if(!b.length) return 'no menu button; labels: '+[...m.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,22)).slice(0,12).join(' | ');
     b[0].click(); return 'opened "'+(b[0].getAttribute('aria-label')||'')+'"'; })()`);
  await page.waitForTimeout(2500);
  out.menuItems = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,14); })()`);
  net.length=0;
  out.dlClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const root=document.querySelector('[role=menu]')||document.body;
     return clickDeepest(root, /Download/i); })()`);
  await page.waitForTimeout(9000);
  out.downloads = dls;
  out.net = net.slice(0,6);
  return out;
};
