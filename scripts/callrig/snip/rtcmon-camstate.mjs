export default async ({page}) => await page.evaluate(() => ({
  camBtn: [...document.querySelectorAll('button')].filter(b=>b.offsetParent)
    .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/camera/i.test(l)),
  videos: [...document.querySelectorAll('video')].map(v=>({
    inLocalTile: !!v.closest('[data-local="true"]'), hasSrc:!!v.srcObject,
    tracks: v.srcObject?v.srcObject.getTracks().map(t=>t.kind):[] })),
}));
