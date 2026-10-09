// Apps like LinkedIn, Instagram and Facebook open links in their own mini browser. Those ignore
// "download this file" links (so Save would silently do nothing), while Safari and Chrome handle them.
// They announce themselves in the browser's identity string; Android web views include "; wv)".
const IN_APP = /LinkedInApp|FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|musical_ly|BytedanceWebview|Twitter|Pinterest|MicroMessenger|Line\/|KAKAOTALK|; wv\)/i

export function isInAppBrowser(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent) {
  return IN_APP.test(userAgent)
}
