import db from "../db.js";

export const getAllTodos = async ({done, search} = {}) => {
  const query = db('todos').select('*')

  if (done !== undefined) {
    query.where('done', done === 'true')
  }

  if (search !== undefined) {
    query.whereLike('text', `%${search}%`)
  }

  const todos = await query;

  return todos
}

export const getTodo = async (id) => {
  const todo = await db('todos').select('*').where('id', id).first();

  return todo
}


export const createTodo = async (text) => {
  await db('todos').insert({text: text})
}

export const updateTodo = async (todo) => {
  await db('todos').update(todo).where('id', todo.id)
}

export const deleteTodo = async (todo) => {
  await db('todos').delete().where('id', todo.id)
}
