import db from "../db.js";
import { sendTodoDeletedToAllConnections, sendTodoDetailToAllConnections, sendTodosToAllConnections } from "../websockets.js";
import express from "express";
import { createTodo, deleteTodo, getAllTodos, getTodo, updateTodo } from "../db/todos.js";

const router = express.Router()

router.get('/', async (req, res) => {
  const todos = await getAllTodos({
    done: req.query.done,
    search: req.query.search,
  })

  res.render('index', {
    title: 'ToDos!',
    todos,
  })
})

router.post('/add', async (req, res) => {
  await createTodo(String(req.body.text))

  await sendTodosToAllConnections()
  res.redirect('/')
})

router.get('/toggle/:id', async (req, res, next) => {
  const todo = getTodo(Number(req.params.id))
  if (!todo) return next()

  todo.done = !todo.done
  await updateTodo(todo)

  await sendTodoDetailToAllConnections(todo.id)
  await sendTodosToAllConnections()
  res.redirect('back')
})

router.get('/delete/:id', async (req, res, next) => {
  const todo = getTodo(Number(req.params.id))
  if (!todo) return next()

  await deleteTodo(todo)

  await sendTodoDeletedToAllConnections(todo.id)
  await sendTodosToAllConnections()
  res.redirect('/')
})

router.get('/detail/:id', async (req, res, next) => {
  const todo = await getTodo(Number(req.params.id))
  if (!todo) return next()

  res.render('detail', {
    todo,
  })
})

router.post('/edit/:id', async (req, res, next) => {
  const todo = await getTodo(Number(req.params.id))
  if (!todo) return next()

  todo.text = String(req.body.text)
  await updateTodo(todo)

  await sendTodoDetailToAllConnections(todo.id)
  await sendTodosToAllConnections()
  res.redirect('back')
})

export default router
