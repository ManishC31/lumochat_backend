import { pool } from "../configs/db.config.js";
import type { IUpdateUser, NewUserInput } from "../types/user.type.js";

export const getUserByEmail = async (email: string) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`select * from users where email = $1 limit 1`, [email]);
    return rows[0];
  } catch (error) {
    console.error("getUserByEmail err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserById = async (userId: number) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`select id, name, email, status, image from users where id = $1 limit 1`, [userId]);
    return rows[0];
  } catch (error) {
    console.error("getUserById err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getPasswordOfUser = async (userId: number) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`select password from users where id = $1`, [userId]);
    return rows[0]?.password;
  } catch (error) {
    console.error("getPasswordOfUser err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const createUser = async ({ email, name, password, authType }: NewUserInput) => {
  const client = await pool.connect();
  try {
    const query = `insert into users (name, email, password, auth_type ) values ($1, $2, $3, $4) returning *`;
    const { rows } = await client.query(query, [name, email, password, authType]);
    return rows[0];
  } catch (error) {
    console.error("createUser err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateUserData = async ({ id, status, name }: IUpdateUser) => {
  const client = await pool.connect();
  try {
    const query = `update users set name = $1, status = $2 where id = $3`;
    await client.query(query, [name, status, id]);
  } catch (error) {
    console.error("updateUserData err:", error);
    throw error;
  } finally {
    client.release();
  }
};
