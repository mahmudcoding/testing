export default async ({page}) => {
  const names=(process.env.QA_NAMES||'Grinning face,Grinning face with big eyes,Beaming face with smiling eyes,Grinning squinting face,Grinning face with sweat,Rolling on the floor laughing,Face with tears of joy,Slightly smiling face,Upside-down face,Winking face').split(',');
  const net=[]; const results=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('reaction')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.status()} :: ${b.slice(0,120)}`);}});
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  for (const nm of names){
    // open picker on the last message
    const trig=page.locator('[data-testid="ic-message-react-trigger"]').last();
    if(!await trig.count()){ results.push({name:nm, err:'no trigger'}); break; }
    await trig.click(); await page.waitForTimeout(1200);
    const ok=await page.evaluate((nm)=>{
      const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
      const m=ms[ms.length-1]; if(!m) return 'no picker';
      const b=[...m.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')===nm);
      if(!b) return 'not found';
      b.click(); return 'clicked';
    }, nm);
    await page.waitForTimeout(1800);
    const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean));
    const chips=await page.evaluate(()=>{const r=[...document.querySelectorAll('[data-testid="ic-user-message"]')].pop(); return r?(r.innerText.match(/[\p{Emoji_Presentation}‍️]+\s*\|?\s*\d+/gu)||[]).length:0;});
    results.push({name:nm, click:ok, chips, toasts:toasts.filter(x=>/reaction|limit|up to/i.test(x))});
    if (results.some(r=>r.toasts&&r.toasts.length)) break;
  }
  return {results, net: net.slice(-4)};
};
