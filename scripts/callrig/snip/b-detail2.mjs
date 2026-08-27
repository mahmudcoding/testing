export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWBHJW4AMD20S';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  out.header = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return (t.match(/Back to Calls.{0,220}/)||[])[0]||t.slice(0,220);
  });
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('[role=tab]')].map(t=>t.innerText.replace(/\s+/g,' ').trim()));
  // Logs tab
  await page.evaluate(()=>{ const t=[...document.querySelectorAll('[role=tab]')].find(x=>/^Logs/.test(x.innerText.trim())); if(t) t.click(); });
  await page.waitForTimeout(2500);
  // Meeting filter
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Meeting\s/.test((x.innerText||'').replace(/\s+/g,' ').trim())); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.meetingLog = await page.evaluate(()=>{
    const p=[...document.querySelectorAll('[role=tabpanel]')].filter(x=>x.getBoundingClientRect().width>0)[0]||document.body;
    return p.innerText.replace(/\n{2,}/g,'\n').slice(0,1000);
  });
  out.mentionsSettings = await page.evaluate(()=>{
    const t=document.body.innerText;
    return {password:/password/i.test(t), approval:/approval|admission|lobby/i.test(t), settings:/setting/i.test(t)};
  });
  return out;
};
