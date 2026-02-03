import { httpClient, type SignInSuccessResponse, type SignUpResponse } from '@blindgate/api'
import type { PasskeyCredential } from '../types'
import { isBrowser, base64UrlEncode, base64UrlDecode } from '../utils'

export class PasskeyAuth {
  async signIn(): Promise<SignInSuccessResponse> {
    if (!isBrowser()) {
      throw new Error('Passkey authentication is only available in browser environments')
    }

    const options = await httpClient<{
      challenge: string
      rpId: string
      allowCredentials?: Array<{ id: string; type: string }>
    }>('/api/v1/auth/sign-in/passkey/options', {
      method: 'POST',
    })

    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: base64UrlDecode(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials?.map((cred) => ({
          id: base64UrlDecode(cred.id),
          type: cred.type as PublicKeyCredentialType,
        })),
        userVerification: 'preferred',
      },
    })) as unknown as PasskeyCredential

    if (!credential) {
      throw new Error('No credential selected')
    }

    return httpClient<SignInSuccessResponse>('/api/v1/auth/sign-in/passkey/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: credential.id,
        rawId: base64UrlEncode(base64UrlDecode(credential.rawId)),
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          authenticatorData: credential.response.authenticatorData,
          signature: credential.response.signature,
          userHandle: credential.response.userHandle,
        },
        type: credential.type,
      }),
    })
  }

  async signUp(name?: string): Promise<SignUpResponse> {
    if (!isBrowser()) {
      throw new Error('Passkey registration is only available in browser environments')
    }

    const options = await httpClient<{
      challenge: string
      rp: { id: string; name: string }
      user: { id: string; name: string; displayName: string }
      pubKeyCredParams: PublicKeyCredentialParameters[]
    }>('/api/v1/auth/sign-up/passkey/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: base64UrlDecode(options.challenge),
        rp: options.rp,
        user: {
          id: base64UrlDecode(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        attestation: 'none',
      },
    })) as unknown as PasskeyCredential & {
      response: {
        attestationObject?: string
      }
    }

    if (!credential) {
      throw new Error('Credential creation failed')
    }

    return httpClient<SignUpResponse>('/api/v1/auth/sign-up/passkey/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: credential.id,
        rawId: base64UrlEncode(base64UrlDecode(credential.rawId)),
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          authenticatorData: credential.response.authenticatorData,
          signature: credential.response.signature,
          attestationObject: credential.response.attestationObject,
          userHandle: credential.response.userHandle,
        },
        type: credential.type,
      }),
    })
  }
}
