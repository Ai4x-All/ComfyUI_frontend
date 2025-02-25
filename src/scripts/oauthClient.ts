// @ts-strict-ignore
import CONFIG from '@/config'

const oidcConfig = {
  authority: CONFIG.AuthURLWeb, // 配置的 Auth 服务器 URL
  client_id: CONFIG.OAuth2ClientId, // 客户端 ID
  redirect_uri: CONFIG.WebURL, // 回调 URI
  response_type: 'code', // 使用 Authorization Code Flow
  scope: CONFIG.OAuth2ClientScope, // 所需的 scope
  automaticSilentRenew: true, // 自动刷新 token
  loadUserInfo: false, // 加载用户信息
  onSigninCallback: () => {
    console.log('Sign-in callback triggered')
  }, // 登录成功后的回调
  silent_redirect_uri: CONFIG.WebURL,
  validateSubOnSilentRenew: true,
  post_logout_redirect_uri: CONFIG.WebURL,
  // userStore: new WebStorageStateStore({ store: window.localStorage }),  // 存储在 localStorage 中
  metadata: {
    authorization_endpoint: `${CONFIG.AuthURLWeb}/connect/authorize`, // 授权端点
    token_endpoint: `${CONFIG.AuthURLWeb}/connect/token`, // token 端点
    end_session_endpoint: `${CONFIG.AuthURLWeb}/connect/logout`, // 注销端点
    revocation_endpoint: CONFIG.WebURL // 注销端点
  }
}

export default oidcConfig
