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
