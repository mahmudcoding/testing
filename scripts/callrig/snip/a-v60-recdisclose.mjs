const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  await page.waitForTimeout(2500);
  await page.screenshot({path:`/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/recdisclose-${who}.png`});
  return await page.evaluate(([vs,who])=>{const vis=eval(vs);
    return { who,
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Rec Room|Share Pass/.test(t)).slice(0,3),
      recMentions:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/record/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,54)).slice(0,6),
      recAria:[...document.querySelectorAll('[aria-label],[title]')].filter(vis).map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).filter(a=>/record/i.test(a||'')).slice(0,4),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},[VS,who]);
};
