import { pool } from "../configs/db.config.ts";

export const getMessagesOfConnection = async (connectionId: number, offset: number = 0, limit: number = 50) => {
  const client = await pool.connect();
  try {
    const query = `select * from messages where connection_id = $1 order by id desc offset $2 limit $3`;
    const { rows } = await client.query(query, [connectionId, offset, limit]);
    return rows;
  } catch (error) {
    console.error("getMessagesOfConnection err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const markMessagesAsRead = async (connectionId: number, receiverId: number): Promise<number[]> => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE messages SET is_read = true WHERE connection_id = $1 AND receiver_id = $2 AND is_read = false RETURNING sender_id`,
      [connectionId, receiverId],
    );
    return rows.map((r: any) => r.sender_id);
  } catch (error) {
    console.error("markMessagesAsRead err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getMediaOfConnection = async (connectionId: number) => {
  const client = await pool.connect();
  try {
    const query = `select id, sender_id, file, created_at from messages where connection_id = $1 and file is not null order by id desc`;
    const { rows } = await client.query(query, [connectionId]);
    return rows;
  } catch (error) {
    console.error("getMediaOfConnection err:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const createMessage = async (connectionId: number, senderId: number, receiverId: number, text: string, fileUrl: string | null) => {
  const client = await pool.connect();
  try {
    const query = `insert into messages (connection_id, sender_id, receiver_id, text, file) values ($1, $2, $3, $4, $5) returning *`;
    const { rows } = await client.query(query, [connectionId, senderId, receiverId, text, fileUrl]);
    return rows[0];
  } catch (error) {
    console.error("createMessage err:", error);
    throw error;
  } finally {
    client.release();
  }
};
