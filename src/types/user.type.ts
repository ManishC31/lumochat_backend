export type NewUserInput = {
  name: string;
  email: string;
  password?: string;
  authType: string;
};

export interface IUser {
  id: number;
  name: string;
  email: string;
}

export interface IUpdateUser {
  id: number;
  name: string;
  status: string;
}
