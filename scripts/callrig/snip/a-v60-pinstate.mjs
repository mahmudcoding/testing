const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  const s = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      pinTextAnywhere:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/pinned|unpin|pin/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,36)).slice(0,8),
      pinAria:[...document.querySelectorAll('[aria-label],[title]')].filter(vis).map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).filter(a=>/pin/i.test(a||'')).slice(0,8),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/V60/.test(t)).slice(0,4),
      stageLabel:(()=>{const vs2=[...document.querySelectorAll('video')].map(v=>({w:Math.round(v.getBoundingClientRect().width)}));return vs2;})(),
      participantsHeader:(document.querySelector('[data-testid="participants-list"]')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,50) };},VS);
  return { who, ...s };
};
