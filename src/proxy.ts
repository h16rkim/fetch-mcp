import { setGlobalDispatcher, ProxyAgent } from 'undici'

// 보수적으로는 HTTPS 기준 프록시 하나만 잡아도 충분
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy))
}
