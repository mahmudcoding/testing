export default async ({page, ctx}) => {
  const WS='W4QBF1XTURESO01'; const mid=process.env.QA_MID;
  const p2 = await ctx.newPage();
  await p2.goto(`https://staging.airion-cargo.store/w/${WS}/calls/${mid}`,{waitUntil:'domcontentloaded'});
  await p2.waitForTimeout(8000);
  const out = {url: p2.url(), head: await p2.evaluate(()=>{const m=document.querySelector('main')||document.body; return m.innerText.replace(/\s+/g,' ').slice(0,220);})};
  out.viewAll = await p2.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^View all$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false;});
  await p2.waitForTimeout(3500);
  out.rows = await p2.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog],aside')].filter(x=>x.getBoundingClientRect().width>0).pop(); const src=d||document.querySelector('main')||document.body; return src.innerText.replace(/\n{2,}/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,20);});
  out.hostStillInCall = await page.evaluate(()=>/\/call\//.test(location.href));
  await p2.close();
  return out;
};
