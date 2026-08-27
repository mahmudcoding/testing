const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)).filter(Boolean),
      inviteMentions:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/invited|invite|join .*room|Room A/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,50)).slice(0,8),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,90)) };},VS);
  const poll=[]; for(let i=0;i<12;i++){ poll.push({t:i*600,...(await read())}); await page.waitForTimeout(600); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/carol-invited.png'});
  return { anyToast:poll.find(p=>p.toasts.length)?.toasts??null,
           anyInvite:poll.find(p=>p.inviteMentions.length)?.inviteMentions??null,
           anyDialog:poll.find(p=>p.dialogs.length)?.dialogs??null, last:poll[poll.length-1] };
};
