import {
  deletePasskey,
  listPasskeys,
  passkeyLoginChallenge,
  passkeyLoginVerify,
  passkeyRegisterChallenge,
  passkeyRegisterVerify,
  type ListPasskeysResponse,
  type PasskeyRegisterBody,
  type PasskeyRegistrationResponse,
  type PasskeyVerifyBody,
  type SignInResponse,
} from '@blindgate/api'
import { BlindgateError } from '../types'
import { isBrowser } from '../utils'

type CredentialWithJson = PublicKeyCredential & { toJSON(): unknown }

function assertWebAuthnSupport(): void {
  if (!isBrowser() || typeof PublicKeyCredential === 'undefined') {
    throw new BlindgateError(
      'Passkeys are only available in browsers with WebAuthn support',
      'WEBAUTHN_UNSUPPORTED',
    )
  }
  if (
    typeof PublicKeyCredential.parseRequestOptionsFromJSON !== 'function' ||
    typeof PublicKeyCredential.parseCreationOptionsFromJSON !== 'function'
  ) {
    throw new BlindgateError(
      'This browser does not support the WebAuthn JSON API',
      'WEBAUTHN_UNSUPPORTED',
    )
  }
}

function toJson<T>(credential: Credential | null): T {
  if (!credential || typeof (credential as CredentialWithJson).toJSON !== 'function') {
    throw new BlindgateError(
      'No passkey credential was returned by the browser',
      'WEBAUTHN_CANCELLED',
    )
  }
  return (credential as CredentialWithJson).toJSON() as T
}

export class PasskeyAuth {
  /** Sign in with a passkey registered for the given email. */
  async signIn(email: string): Promise<SignInResponse> {
    assertWebAuthnSupport()

    const { challenge } = await passkeyLoginChallenge({ email })
    const credential = await navigator.credentials.get({
      publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(
        challenge as unknown as PublicKeyCredentialRequestOptionsJSON,
      ),
    })

    return passkeyLoginVerify({ credential: toJson<PasskeyVerifyBody['credential']>(credential) })
  }

  /** Register a new passkey for the currently signed-in user. */
  async register(): Promise<PasskeyRegistrationResponse> {
    assertWebAuthnSupport()

    const { challenge } = await passkeyRegisterChallenge()
    const credential = await navigator.credentials.create({
      publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(
        challenge as unknown as PublicKeyCredentialCreationOptionsJSON,
      ),
    })

    return passkeyRegisterVerify({
      credential: toJson<PasskeyRegisterBody['credential']>(credential),
    })
  }

  async list(): Promise<ListPasskeysResponse> {
    return listPasskeys()
  }

  async delete(id: string): Promise<void> {
    await deletePasskey(id)
  }
}
