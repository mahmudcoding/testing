export default async ({page}) => {
  return await page.evaluate(()=>({
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,200)).filter(Boolean),
    bodyMentionsMute: (document.body.innerText.match(/.{0,60}(muted|mute).{0,60}/gi)||[]).slice(0,5)
  }));
};
