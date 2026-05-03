import { pool } from "../configs/db.config.ts";

export const getConnectionsOfUser = async (userId: number) => {
  const client = await pool.connect();
  try {
    const query = `
      select
        case when c.first_user = $1 then u2.id else u1.id end as user_id,
        case when c.first_user = $1 then u2.name else u1.name end as name,
        case when c.first_user = $1 then u2.email else u1.email end as email,
        case when c.first_user = $1 then u2.image else u1.image end as image,
        case when c.first_user = $1 then u2.status else u1.status end as status,
        c.id as connection_id,
        last_msg.text as last_message,
        last_msg.created_at as last_message_time
      from connections c
      join users u1 on u1.id = c.first_user
      join users u2 on u2.id = c.second_user
      left join lateral (
        select text, created_at from messages
        where connection_id = c.id
        order by id desc
        limit 1
      ) last_msg on true
      where (c.first_user = $1 or c.second_user = $1)
      and c.is_accepted = true
      order by last_msg.created_at desc nulls last
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("getConnectionsOfUser err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const createConnectionRequest = async (firstUserId: number, secondUserId: number) => {
  const client = await pool.connect();
  try {
    const query = `insert into connections(first_user, second_user) values ($1, $2)`;
    await client.query(query, [firstUserId, secondUserId]);
  } catch (error) {
    console.error("createConnection err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getConnectionRequests = async (userId: number) => {
  const client = await pool.connect();
  try {
    const query = `
     select c.id as connection_id, c.first_user, c.second_user, c.is_accepted, u.name, u.email, u.image 
      from connections c 
      join users u on u.id = c.first_user 
      where c.second_user = $1 and is_accepted = false`;
    const { rows } = await client.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("getConnectionRequests err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getSentConnections = async (userId: number) => {
  const client = await pool.connect();
  try {
    const query = `select c.first_user, c.second_user, c.pin_status, u.name, u.email, u.image
       from connections c
        join users u on u.id = c.second_user
        where c.first_user = $1
        `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("getSentConnections err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const acceptConnectionRequest = async (connectionId: number) => {
  const client = await pool.connect();
  try {
    const query = `update connections set is_accepted = true where id = $1`;
    await client.query(query, [connectionId]);
  } catch (error) {
    console.error("acceptConnectionRequest err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const rejectConnectionRequest = async (connectionId: number) => {
  const client = await pool.connect();
  try {
    const query = `delete from connections where id = $1`;
    await client.query(query, [connectionId]);
  } catch (error) {
    console.error("acceptConnectionRequest err:", error);
    throw error;
  } finally {
    client.release();
  }
};
