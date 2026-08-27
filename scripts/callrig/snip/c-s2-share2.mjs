const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page, ctx}) => {
  const out={};
  await ctx.grantPermissions(['clipboard-read','clipboard-write'], {origin:'https://airion-cargo.store'}).catch(e=>{out.permErr=String(e).slice(0,60);});
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Share$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.afterShare = await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"],[role="dialog"]')].filter(vis);
    let clip=null; try{ clip=await navigator.clipboard.readText(); }catch(e){ clip='ERR:'+String(e).slice(0,50); }
    const toasts=[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean);
    return {popups: pops.map(p=>({text:p.innerText.replace(/\n+/g,' | ').slice(0,200),
      items:[...p.querySelectorAll('button,[role="menuitem"],input')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.value||b.textContent||'').trim().slice(0,40)).filter(Boolean)})),
      clipboard: clip, toasts, url: location.href};
  });
  return out;
};
