export type NewUserInput = {
  name: string;
  email: string;
  password: string;
};

export interface IUser {
  id: number;
  name: string;
  email: string;
  image?: string;
}

export interface IUpdateUser {
  id: number;
  name: string;
  status: string;
}
