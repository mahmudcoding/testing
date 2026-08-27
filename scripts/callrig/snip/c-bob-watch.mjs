// Bob opens the channel and polls the target message for ~40s, logging every change.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', id=process.env.MID;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const snaps=[];
  for(let i=0;i<130;i++){
    await page.waitForTimeout(300);
    snaps.push(await page.evaluate(mid=>{
      const m=document.querySelector(`[data-message-id="${mid}"]`);
      return m? m.innerText.replace(/\s+/g,' ').trim().slice(0,110) : 'ABSENT';
    }, id));
  }
  const uniq=[]; let prev=null;
  snaps.forEach((s,i)=>{ if(s!==prev){ uniq.push({atMs:i*300, text:s}); prev=s; } });
  return {watched:id, changes: uniq};
};
