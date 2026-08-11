/** Shared legal version constants — keep in sync with web content/legal.ts */
export const LEGAL_VERSIONS = {
  privacy: '2026-08-10',
  terms: '2026-08-10',
  ageAttestation: '18+',
  participation: '2026-08-10',
  photoInternal: '2026-08-10',
  anonymousStory: '2026-08-10',
} as const;

export const CONSENT_TYPES = {
  TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  AGE_ATTESTATION_18: 'AGE_ATTESTATION_18',
  PARTICIPATION: 'PARTICIPATION',
  PHOTO_INTERNAL: 'PHOTO_INTERNAL',
  VIDEO_INTERNAL: 'VIDEO_INTERNAL',
  SOCIAL_PUBLISH: 'SOCIAL_PUBLISH',
  ANONYMOUS_STORY: 'ANONYMOUS_STORY',
  FUTURE_INVITES: 'FUTURE_INVITES',
} as const;
