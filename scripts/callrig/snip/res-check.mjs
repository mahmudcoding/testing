export default async ({page}) => {
  const m = await page.evaluate(()=>{
    const v=document.querySelector('video');
    const labels=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0 && /×|x 1080|1920/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,40));
    return {videoW:v.videoWidth, videoH:v.videoHeight, dur:v.duration, labels};
  });
  return m;
};
