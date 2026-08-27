import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  await bell.click(); await page.waitForTimeout(3000);
  out.render = await page.evaluate(`(() => { ${VISFN}
    const rows=[...document.querySelectorAll('div,li,article')].filter(n=>vis(n) &&
      (n.innerText||'').includes('Meeting invitation') && (n.innerText||'').length<600);
    const r = rows[rows.length-1];
    if(!r) return {none:true, sample:(document.body.innerText||'').slice(0,400)};
    const anchors=[...r.querySelectorAll('a[href]')].map(a=>a.getAttribute('href').slice(0,80));
    return { text:(r.innerText||'').replace(/\\s+/g,' ').slice(0,420), anchors,
             hasRawUrl:/https?:\\/\\//.test(r.innerText||''),
             buttons:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)) };
  })()`);
  return out;
};
