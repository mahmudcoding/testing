export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    const txt=m.innerText;
    const rows=(txt.match(/(Incoming|Outgoing|Outbound|Inbound|Missed)[^\n]{0,60}/g)||[]).slice(0,8);
    const filters=[...m.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(t=>/^(All|Group meetings|1-to-1)/.test(t));
    return {directionLines: rows, filters};
  });
};
