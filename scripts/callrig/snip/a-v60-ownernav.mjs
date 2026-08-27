const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3600);
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>null);return j?.email??j?.data?.email;});
  const nav = await page.evaluate((vs)=>{const vis=eval(vs);
    const navEl=document.querySelector('a[href*="/settings/"]')?.closest('nav');
    if(!navEl) return {noNav:true};
    const inputs=[...navEl.querySelectorAll('input')].map(i=>({ph:i.placeholder,al:i.getAttribute('aria-label')||'',vis:vis(i)}));
    return { linkCount: navEl.querySelectorAll('a').length,
             links: [...navEl.querySelectorAll('a')].map(a=>(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,22)),
             groups: [...navEl.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText?.trim()&&!e.closest('a')).map(e=>e.innerText.trim().slice(0,16)),
             inputs, filterInHTML: /Filter settings/i.test(navEl.innerHTML) };},VS);
  return { who, nav };
};
