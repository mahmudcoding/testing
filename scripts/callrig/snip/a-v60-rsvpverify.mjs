const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // FRESH load, then reopen the meeting
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(2800);
  out.freshDetails = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]; if(!d)return{noDialog:true};
    const btns=[...d.querySelectorAll('button')].filter(vis).map(b=>({
      t:(b.innerText||'').trim().slice(0,14), pressed:b.getAttribute('aria-pressed'), state:b.getAttribute('data-state'),
      bg:getComputedStyle(b).backgroundColor, cls:(b.className||'').slice(0,60)}));
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,320), btns,
             participantUnavailable:/Participant list unavailable/i.test(d.innerText||''),
             // enumerate every element in the dialog that names a person
             peopleNamed:[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/QA (Alice|Bob|Carol|Owner)/.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,26)) };},VS);
  // what does the API say Bob's status is?
  out.apiTruth = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01',{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const arr=j?.meetings||j?.data||(Array.isArray(j)?j:[]);
    const m=(arr||[]).find(x=>/Participant Check/.test(x.title||''));
    return { status:r.status, found:!!m, keys:m?Object.keys(m).slice(0,18):null,
             attendees: m? JSON.stringify(m.attendees??m.participants??m.attendee_user_ids??null).slice(0,220) : null };});
  return out;
};
