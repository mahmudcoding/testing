export default async ({page}) => {
  return await page.evaluate(async () => {
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const mic=tb?[...tb.querySelectorAll('button')].find(b=>/mute|unmute/i.test(b.getAttribute('aria-label')||'')):null;
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const perms = await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/participants/'+me.id+'/permissions',{credentials:'include'})).json().catch(()=>null);
    return {who: me.email,
      micBtn: mic?{label:mic.getAttribute('aria-label'), disabled:mic.disabled, pressed:mic.getAttribute('aria-pressed'), title:mic.getAttribute('title')}:null,
      perms};
  });
};
