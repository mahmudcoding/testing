import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis)
       .find(x=>/^(Search|Поиск)/.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2800);
  await page.keyboard.type('probe'); await page.waitForTimeout(4500);
  out.dialog = await page.evaluate(`(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<10) return false; return vis(el);};
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     if(!d) return {none:true};
     const leaves=[...d.querySelectorAll('*')].filter(el=>el.children.length===0 && strict(el));
     const isData=t=>/^[#@]?qa[-_.]/i.test(t)||/^QA /.test(t)||/\\.(png|txt|jpg)$/i.test(t)||/^\\d/.test(t)
        ||/seam|viewer|normal|fake|ws2-only|aaaa|probe|zarplex|verify-unread|caption|mention|dm |unmuted|plain|two-|Files:|File$/i.test(t);
     const latin=[...new Set(leaves.map(el=>(el.textContent||'').replace(/\\s+/g,' ').trim())
        .filter(t=>t.length>1&&t.length<70&&/[A-Za-z]{3}/.test(t)&&!/[А-Яа-яЁё]/.test(t))
        .filter(t=>!isData(t)))];
     const clipped=leaves.filter(el=>el.scrollWidth>el.clientWidth+1 && el.clientWidth>=24)
        .map(el=>((el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,36))+' ['+el.clientWidth+'<'+el.scrollWidth+']');
     return { head:(d.innerText||'').replace(/\\s+/g,' ').slice(0,240),
              latinCopy:latin.slice(0,10), clipped:[...new Set(clipped)].slice(0,6) }; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // notification panel in Russian
  await page.locator('button[aria-label^="Уведомления"], button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3200);
  out.bell = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
     const d=c.pop(); return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,200):'(none)'; })()`);
  return out;
};
