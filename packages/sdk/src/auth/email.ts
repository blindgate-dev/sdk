import {
  type AuthSignInBody,
  type AuthSignUpBody,
  type SignInResponse,
  type SignUpResponse,
  signIn,
  signUp,
} from '@blindgate/api'

export class EmailAuth {
  async signIn(credentials: AuthSignInBody): Promise<SignInResponse> {
    return signIn(credentials)
  }

  async signUp(data: AuthSignUpBody): Promise<SignUpResponse> {
    return signUp(data)
  }
}
