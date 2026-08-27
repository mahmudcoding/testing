export default async ({page}) => {
  const parts = await page.evaluate(async ()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    if(!j.meeting) return {none:true};
    const p=await (await fetch('/api/v1/meeting/'+j.meeting.id+'/participants',{credentials:'include'})).json();
    return {id:j.meeting.id, participants:(p.participants||[]).map(x=>x.name)};
  });
  await page.locator('[data-testid="call-controls-leave"]').click();
  await page.waitForTimeout(2500);
  const dlg=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?m.innerText.replace(/\n+/g,' | '):null;
  });
  return {meeting: parts, leaveDialog: dlg};
};
