import knex from "knex";
import knexfile from "../knexfile.js";

const db = knex(knexfile)

export default db

export const getAllTodos = async () => {
  return db('todos').select('*')
}
export const getTodo = async (id) => {
  console.log(id)
  return db('todos').select('*').where('id', id).first()
}
