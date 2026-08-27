import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const caught=[];
  page.on('response', async r=>{ const u=r.url();
    if(/\/api\/v1\/search/.test(u)){
      let j=null; try{ j=await r.json(); }catch(e){}
      if(j) caught.push({url:decodeURIComponent(u.split('/api/v1/')[1]).slice(0,90),
        total_messages:j.total_messages, messages:(j.messages||[]).length,
        total_files:j.total_files, files:(j.files||[]).length,
        total_users:j.total_users, total_channels:j.total_channels,
        msgIds:(j.messages||[]).map(m=>String(m.id).slice(-5))}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  caught.length=0;
  await page.keyboard.type('probe'); await page.waitForTimeout(6000);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('[role=tab]')].filter(vis).find(x=>/^Messages/.test((x.innerText||'').trim()));
     const r=b.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(4500);
  const ui = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const tabs=[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim());
     const opts=[...d.querySelectorAll('[role=option]')];
     return {tabs, rowsRendered:opts.length,
             firstRow:(opts[0]&&opts[0].innerText||'').replace(/\\s+/g,' ').slice(0,40),
             lastRow:(opts[opts.length-1]&&opts[opts.length-1].innerText||'').replace(/\\s+/g,' ').slice(0,40)}; })()`);
  return {requestsMade:caught.slice(-2), ui};
};
