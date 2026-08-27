const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,130);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,40)} <- ${(r.request().postData()||'').slice(0,70)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const page1 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return { text:(i>=0?t.slice(i+1):t).trim().slice(0,420),
      controls:[...main.querySelectorAll('button,select,input,[role=switch],[role=combobox],[role=radio]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map((e,ix)=>({ ix, tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                   t:((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,34),
                   st:e.getAttribute('aria-checked')||'',
                   label:(()=>{let n=e,b='';for(let k=0;k<5&&n;k++){n=n.parentElement;if(!n)break;
                     const x=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(x.length>4&&x.length<110){b=x;break;}}return b;})().slice(0,64) })),
      storage:(()=>{ try{return JSON.parse(localStorage.getItem('aloqa-call-device-prefs'));}catch{return null;} })() }; })()`);
  return { page1, net };
};
