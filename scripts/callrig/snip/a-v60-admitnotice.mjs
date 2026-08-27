const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.where = await page.evaluate(()=>location.pathname);
  const probe = () => page.evaluate((vs)=>{const vis=eval(vs);
    const body=document.body;
    return {
      url:location.pathname,
      // any visible element mentioning a waiting/admission request
      admitMentions:[...body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/waiting room|wants to join|asking to join|admit|1 waiting|knock/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,60)),
      // visible toasts
      toasts:[...body.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean),
      // badge-like counters near call controls
      badges:[...body.querySelectorAll('button')].filter(vis).filter(b=>/participant/i.test(b.getAttribute('aria-label')||''))
        .map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,34), txt:(b.innerText||'').trim().slice(0,10)})),
    };},VS);
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*600,...(await probe())}); await page.waitForTimeout(600); }
  out.first=poll[0]; out.last=poll[poll.length-1];
  out.anyAdmitMention = poll.find(p=>p.admitMentions.length)?.admitMentions ?? null;
  out.anyToast = poll.find(p=>p.toasts.length)?.toasts ?? null;
  out.badgeSamples = poll[poll.length-1].badges;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/alice-admit-notice.png'});
  return out;
};
