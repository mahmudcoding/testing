import {WS, BASE} from './e-p2-helpers.mjs';
const read = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {noDialog:true};
  const t=d.innerText.replace(/\s+/g,' ');
  return {tabs:(t.match(/All ?\d* Messages ?\d* Channels ?\d* People ?\d* Files ?\d*/)||[''])[0],
    noResults:/No results/.test(t),
    rows:[...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||'').trim()).filter(x=>/^Message:/.test(x))};
};
async function trial(page, chanId, label, term, n){
  const out=[];
  for(let i=0;i<n;i++){
    await page.goto(`${BASE}/w/${WS}/c/${chanId}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    const onScreen = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(m=>m.innerText.replace(/\s+/g,' ').slice(0,50)));
    const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return; let b=null; try{b=await r.json()}catch{}
      net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||''), tm:b?.total_messages,
        arch:(b?.messages||[]).filter(m=>m.channel_archived===true).length});};
    page.on('response',h);
    await page.locator('button[aria-label="Search in channel"]').click();
    await page.waitForTimeout(2500);
    const inp=page.locator('[role=dialog] input').first();
    await inp.waitFor({timeout:15000}); await inp.click(); await inp.type(term,{delay:60});
    await page.waitForTimeout(6000);
    page.off('response',h);
    out.push({attempt:i+1, messagesOnScreen:onScreen, requests:net, dialog: await page.evaluate(read)});
  }
  return {label, term, out};
}
export default async ({page}) => ({
  archived: await trial(page,'C4OX3463S8ECN8X','archived channel, word from its visible message','archive',2),
  control:  await trial(page,'C4QEGENERAL0001','live channel, control','unread',1),
});
