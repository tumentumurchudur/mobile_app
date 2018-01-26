import { IFbToken } from "./fb-token";

export interface IUser {
  // TODO: Add other useful optional parameters like photoURL; displayName ect.
  email: string | null;
  password: string | null;
  uid: string | null;
  orgPath?: string | null;
  providerData?: Partial<IFbToken> | null;
}
