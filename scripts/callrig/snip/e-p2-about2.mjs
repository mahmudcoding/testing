import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const sec of ['about','account','security']) {
    await page.goto(`${BASE}/w/${WS}/settings/${sec}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out[sec] = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const m=document.querySelector('main');
      // the content column: skip the settings nav by taking text after the "›" breadcrumb
      const t=m.innerText.replace(/\s+/g,' ');
      const i=t.indexOf('›');
      const body=i>=0? t.slice(i+1) : t;
      const cls=(e)=>(e.className||'').toString();
      return {body: body.slice(0,600),
        links:[...m.querySelectorAll('a[href]')].filter(vis)
          .map(e=>({t:(e.textContent||'').trim().slice(0,26), href:(e.getAttribute('href')||'').slice(0,60)}))
          .filter(o=>!/\/settings\//.test(o.href)).slice(0,10),
        disabled:[...m.querySelectorAll('button,input')].filter(vis)
          .filter(e=>e.disabled===true||e.getAttribute('aria-disabled')==='true'
                     ||/(^|\s)cursor-not-allowed(\s|$)/.test(cls(e)))
          .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,28))};
    });
  }
  return out;
};
