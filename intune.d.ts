declare namespace Intune {
  interface IntuneUser {
    upn?: string;
  }

  interface IntuneUserResult extends IntuneUser {
    canceled?: boolean;
    accessToken?: string;
    idToken?: string;
  }


  interface CapEventListener {
    remove: () => void;
  }

  interface IntuneMAM {
    acquireToken: (params: { scopes: string[] }) => Promise<IntuneUserResult>;
    acquireTokenSilent: (params: { scopes: string[], upn: string }) => Promise<IntuneUserResult>;
    enrolledAccount: () => Promise<IntuneUser>;
    registerAndEnrollAccount: (params: Required<IntuneUser>) => Promise<void>;
    addListener: (event: string, handler: any) => Promise<CapEventListener>;
    // this function available only on Android platform
    setAppProxyUrl: (params: { url: string }) => Promise<void>;
    displayDiagnosticConsole: () => Promise<void>;
  }
}
