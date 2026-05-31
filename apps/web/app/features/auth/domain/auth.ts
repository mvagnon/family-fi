export interface AuthUser {
  email: string;
  id: string;
  image?: string | null;
  name: string;
}

export interface SignInWithEmailInput {
  email: string;
  password: string;
}
