// @ts-strict-ignore
/*
import { createOidcAuth } from 'vue-oidc-client';
// 去掉重复的导入语句
// import oidcConfig from './oauthClient';

const auth = createOidcAuth(oidcConfig);

export default {
  install: (app: any) => {
    app.config.globalProperties.$auth = auth;
    app.provide('auth', auth);
  }
};
*/
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

import oidcConfig from './oauthClient'

const userManager = new UserManager(oidcConfig)

export const login = () => userManager.signinRedirect()
export const logout = () => userManager.signoutRedirect()
export const getUser = () => userManager.getUser()
export const completeLogin = async () => {
  const user = await userManager.signinRedirectCallback()
  return user
}
