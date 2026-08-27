// Enumerate EVERY interactive element inside the Sessions content area.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/sessions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const api = await page.evaluate(async()=>{const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>({})); return {s:r.status, n:Array.isArray(j)?j.length:(j.sessions?j.sessions.length:JSON.stringify(j).slice(0,120))};});
  const dom = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    // content area = the region after the breadcrumb, excluding the settings nav
    const m=document.querySelector('main')||document.body;
    const nav=m.querySelector('nav');
    const all=[...m.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=switch],[role=menuitem]')]
      .filter(vis).filter(e=>!nav||!nav.contains(e))
      .filter(e=>!/Filter settings/.test(e.placeholder||''));
    return {count: all.length,
      items: all.map(e=>`${e.tagName.toLowerCase()}${e.disabled?'(dis)':''} href=${e.getAttribute('href')||'-'}: ${((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim().slice(0,40)}`),
      subtitle: (m.innerText||'').replace(/\s+/g,' ').slice((m.innerText||'').indexOf('Active sessions'), (m.innerText||'').indexOf('Active sessions')+380)};
  });
  return {api, ...dom};
};
