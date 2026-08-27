import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MEET='S4OX2EYG6IHFZ1Q';
export default async ({page}) => {
  const out={};
  // ---- Finding 2: invitee opening the meeting by URL cannot RSVP ----
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MEET, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.F2 = await page.evaluate(`(async () => {
     const vis=el=>{const cs=getComputedStyle(el);const r=el.getBoundingClientRect();
       if(cs.display==='none'||cs.visibility==='hidden'||r.width<1||r.height<1)return false;
       let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
       return op>0.01;};
     const d=[...document.querySelectorAll('[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect();return r.width>200&&r.height>120;}).pop();
     const rsvp=d?[...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Yes|No|Maybe)$/.test((b.textContent||'').trim()))
       .map(b=>({tx:(b.textContent||'').trim(), dis:b.disabled, ad:b.getAttribute('aria-disabled')})):[];
     const r=await fetch('/api/v1/calendar/meetings/'+${JSON.stringify(MEET)},{credentials:'include'});
     let j=null; try{j=await r.json();}catch(e){}
     return {dialogOpen:!!d, rsvpButtons:rsvp,
             allDisabled: rsvp.length>0 && rsvp.every(b=>b.dis===true||b.ad==='true'),
             apiStatus:r.status,
             my_status: j&&(j.my_status===undefined?'ABSENT':JSON.stringify(j.my_status)),
             attendeesField: j&&(j.attendees===undefined?'absent':(Array.isArray(j.attendees)?j.attendees.length:typeof j.attendees))}; })()`);
  // ---- Finding 3: People directory shows neither presence nor status ----
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.F3 = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const dots=[...m.querySelectorAll('[class*=status],[class*=presence],[data-status],[data-presence]')].filter(vis).length;
     const words=['Online','Offline','Away','Active','Do not disturb'].filter(w=>new RegExp('\\\\b'+w+'\\\\b').test(t));
     return {presenceWords:words, presenceNodes:dots, sample:t.slice(0,120)}; })()`);
  return out;
};
