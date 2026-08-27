import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const p of ['account','profile']) {
    await page.goto(BASE+'/w/'+WS+'/settings/'+p, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    out[p] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main'); const nav=m.querySelector('nav');
       const t=(m.innerText||'').replace(/\\s+/g,' ');
       const tzIdx=t.search(/time ?zone/i);
       const ctl=[...m.querySelectorAll('button,select,input,[role=combobox]')].filter(n=>vis(n)&&(!nav||!nav.contains(n)))
         .map(n=>n.tagName.toLowerCase()+' "'+((n.getAttribute('aria-label')||n.getAttribute('placeholder')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,32))+'"')
         .filter(x=>/zone|GMT|UTC|\\+0|Tashkent|Asia/i.test(x));
       return { mentionsTimezone: tzIdx>=0, near: tzIdx>=0? t.slice(Math.max(0,tzIdx-40), tzIdx+120):null,
                controls: ctl.slice(0,6) }; })()`);
  }
  out.apiTz = await page.evaluate(`(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
     const t=await r.text(); const m=t.match(/"time_?[Zz]one"\\s*:\\s*"[^"]*"/g);
     return m? m.slice(0,3):'(no timezone field)'; })()`);
  return out;
};
