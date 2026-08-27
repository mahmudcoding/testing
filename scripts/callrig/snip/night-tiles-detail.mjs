export default async ({page}) => {
  return await page.evaluate(()=>[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
    const n=t.querySelector('[data-testid="participant-name"]');
    const v=t.querySelector('video');
    const ph=t.querySelector('[data-testid="participant-video-placeholder"]');
    return {name:n?n.innerText.trim():'?', hasVideo:!!v,
      videoSize: v?{w:v.videoWidth,h:v.videoHeight,paused:v.paused}:null,
      placeholder: !!ph,
      text: t.innerText.replace(/\n+/g,' | ').slice(0,80)};
  }));
};
