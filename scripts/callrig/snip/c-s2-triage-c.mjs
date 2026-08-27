export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // ── ALK-2936: open the sender's profile from a saved copy of someone else's message
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  out.alk2936=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const other=els.find(e=>/QA Bob|QA Alice|QA Admin|QA Owner/.test(e.innerText||''));
    if(!other) return {note:'no saved copy of someone else’s message on the page',
      authorsSeen:[...new Set(els.map(e=>((e.innerText||'').match(/QA [A-Z][a-z]+/)||[''])[0]))].slice(0,5)};
    return {found:true, text:(other.innerText||'').replace(/\s+/g,' ').slice(0,50),
      buttons:[...other.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,8)};});
  // ── ALK-3018: archived channel still offers to add a member
  const arch='C4OX4NTD8DNF88E';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${arch}`);
  await page.waitForTimeout(9000);
  out.alk3018=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return {headerControls:[...m.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>b.getAttribute('aria-label')||(b.innerText||'').trim().slice(0,20))
      .filter(Boolean).slice(0,12),
      composerPresent: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')};});
  // open the members dialog in the archived channel and see whether Add is offered
  const mb=page.locator('main button').filter({hasText:/members/i}).first();
  out.membersButton=await mb.count();
  if(out.membersButton){
    await mb.click(); await page.waitForTimeout(2500);
    out.alk3018.dialog=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
        .filter(x=>/Members/.test(x.innerText||''))
        .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
      if(!d) return 'no dialog';
      return {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,90),
        buttons:[...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.innerText||'').trim()||b.getAttribute('aria-label')).filter(Boolean).slice(0,10),
        inputs:[...d.querySelectorAll('input')].filter(v).map(i=>i.placeholder||i.getAttribute('aria-label'))};});
    await page.keyboard.press('Escape');
  }
  return out;
};
