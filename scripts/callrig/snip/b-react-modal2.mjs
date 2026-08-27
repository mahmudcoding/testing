export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji, c:r.count}));
  }, mid);
  const t0=await api();
  // click the reaction chip to open the Reactions modal
  const chip = await page.evaluate(({mid,emo})=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>(x.innerText||'').includes(emo));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  }, {mid,emo});
  if(!chip) return {err:'no chip', t0};
  await page.mouse.click(chip.x, chip.y);
  await page.waitForTimeout(2200);
  const modal = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      interactive:[...d.querySelectorAll('button,[role=button],[role=tab],li,a')]
        .filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>({tag:b.tagName, label:(b.getAttribute('aria-label')||'').slice(0,40),
                  text:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)}))};
  });
  // try clicking the row that represents me (own name) inside the modal
  let rowClick=null;
  if(modal){
    rowClick = await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
      const row=[...d.querySelectorAll('button,li,div')].find(e=>{
        const r=e.getBoundingClientRect(); return r.width>40&&r.height>20&&/Alice/i.test(e.innerText||'')&&e.children.length<=3;});
      if(!row) return null; const t=(row.innerText||'').replace(/\s+/g,' ').slice(0,40); row.click(); return t;
    });
    await page.waitForTimeout(2500);
  }
  const t1=await api();
  await page.keyboard.press('Escape').catch(()=>{});
  return {t0, chip, modal, rowClick, t1};
};
