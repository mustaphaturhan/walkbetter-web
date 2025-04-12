/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NOMINATIM: string;
    readonly PHOTON: string;
    readonly USER_AGENT: string;
  }
}
