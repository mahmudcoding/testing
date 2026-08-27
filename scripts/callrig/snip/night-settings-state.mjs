export default async ({page}) => page.evaluate(()=>{
  const g=(t)=>{const e=document.querySelector(`[data-testid="${t}"]`);
    return e?(e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||e.value):null;};
  const save=document.querySelector('[data-testid="meeting-settings-save"]');
  const cancel=[...document.querySelectorAll('[data-testid="meeting-settings-panel"] button')]
    .find(b=>(b.textContent||'').trim()==='Cancel');
  return {muteOnJoin:g('meeting-settings-mute-on-join'), chat:g('meeting-settings-chat'),
    reactions:g('meeting-settings-reactions'),
    micAllowed:g('meeting-settings-mic-mode-allowed_all'),
    micRequest:g('meeting-settings-mic-mode-on_request'),
    guestHost:g('meeting-settings-guest-link-visibility-host_only'),
    guestEveryone:g('meeting-settings-guest-link-visibility-everyone'),
    saveDisabled:save?save.disabled:null, cancelDisabled:cancel?cancel.disabled:null};
});
