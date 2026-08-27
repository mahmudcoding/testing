export default async ({ page }) => {
  return await page.evaluate(() => {
    const g = tid => { const b = document.querySelector(`[data-testid="${tid}"]`);
      return b ? { present:true, disabled:b.disabled, al:b.getAttribute('aria-label'),
                   visible: b.getBoundingClientRect().width>0 } : { present:false }; };
    return { chat: g('call-controls-chat-toggle'),
             reaction: g('call-controls-live-reaction'),
             screenShare: g('call-controls-screen-share') };
  });
};
