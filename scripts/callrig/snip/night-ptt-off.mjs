export default async ({page}) => {
  const before = await page.evaluate(()=>localStorage.getItem('aloqa-call-device-prefs'));
  await page.evaluate(()=>{
    const k='aloqa-call-device-prefs';
    const o=JSON.parse(localStorage.getItem(k));
    o.state.isPushToTalkEnabled=false;
    localStorage.setItem(k, JSON.stringify(o));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(13000);
  const after = await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const mic=tb?[...tb.querySelectorAll('button')].find(b=>/mute|unmute/i.test(b.getAttribute('aria-label')||'')):null;
    return {pref: localStorage.getItem('aloqa-call-device-prefs'),
      micBtn: mic?{label:mic.getAttribute('aria-label'), disabled:mic.disabled, pressed:mic.getAttribute('aria-pressed')}:null,
      inCall: !!document.querySelector('[data-testid="call-toolbar"]')};
  });
  return {beforeHadPtt: /"isPushToTalkEnabled":true/.test(before||''), after: {micBtn: after.micBtn, inCall: after.inCall}};
};
