export default async ({page}) => {
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meeting/'+location.pathname.split('/').pop().split('?')[0]+'/permission-requests',{credentials:'include'});
    return {s:r.status};
  }).catch(()=>null);
  return await page.evaluate(async (M) => {
    const rq = await (await fetch('/api/v1/meeting/'+M+'/permission-requests',{credentials:'include'})).json();
    const bodyTxt = document.body.innerText;
    const toasts = [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast" i]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,160)).filter(Boolean);
    const permEls = [...document.querySelectorAll('[data-testid*="permission" i],[data-testid*="request" i]')].map(e=>({t:e.getAttribute('data-testid'), txt:(e.innerText||'').replace(/\n+/g,' | ').slice(0,120)}));
    const peopleBtn = document.querySelector('[data-testid="call-controls-people-toggle"]');
    return {
      apiRequests: rq,
      toasts,
      permissionEls: permEls,
      peopleBadge: peopleBtn ? peopleBtn.innerText.replace(/\n+/g,'/').slice(0,40) : null,
      bodyMentionsShare: /wants to share|requests? to share|Request to share|share your screen/i.test(bodyTxt),
      bodySnippet: (bodyTxt.match(/.{0,60}(request|share).{0,60}/i)||[])[0]
    };
  }, process.env.QA_MEET);
};
