import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/')){ let b=''; try{b=(await r.text()).slice(0,220);}catch(e){}
      api.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,58)+' :: '+b.replace(/\s+/g,' ')); }});
  // arrive by clicking the nav link, the way a user does
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  api.length=0;
  await page.locator('a:has-text("Sessions")').first().click();
  await page.waitForTimeout(9000);
  out.url = page.url();
  out.api = api.filter(a=>/session|device|token/i.test(a)).slice(0,6);
  out.apiAll = api.length;
  out.body = await page.evaluate(`(() => { ${VISFN}
    const m = document.querySelector('main') || document.body;
    // the whole visible text of the settings pane, and every interactive node anywhere
    const all=[...document.querySelectorAll('button,a[href],input,select,[role=switch],[role=listitem]')].filter(vis);
    const nav=document.querySelector('nav');
    const outside=all.filter(n=>!nav||!nav.contains(n));
    return { mainText:(m.innerText||'').replace(/\\s+/g,' ').slice(0,700),
             mainChildren:m.children.length,
             interactiveOutsideNav: outside.map(n=>n.tagName.toLowerCase()+' "'+((n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40))+'"').slice(0,25) };
  })()`);
  return out;
};
