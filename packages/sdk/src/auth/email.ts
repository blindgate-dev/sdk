import {
  postApiV1AuthSignIn,
  postApiV1AuthSignUp,
  type SignInResponse,
  type SignUpResponse,
} from '@blindgate/api'

export class EmailAuth {
  async signIn(credentials: { identifier: string; password: string }): Promise<SignInResponse> {
    return postApiV1AuthSignIn(credentials)
  }

  async signUp(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }): Promise<SignUpResponse> {
    return postApiV1AuthSignUp(data)
  }
}
