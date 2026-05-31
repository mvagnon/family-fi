export interface AuthUser {
  email: string;
  id: string;
  name: string;
}

export interface SignInWithEmailInput {
  email: string;
  password: string;
}
