import express from 'express'
import db from "../src/db.js"
import {
  sendTodoDeletedToAllConnections,
  sendTodoDetailToAllConnections,
  sendTodosToAllConnections,
} from "./websockets.js";

export const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

app.get('/', async (req, res) => {

  let todos = null;

  if(req.query.done === 'true'){
    todos = await db('todos').select('*').where('done', true);
  } else if(req.query.done === 'false'){
    todos = await db('todos').select('*').where('done', false);
  } else {
    todos = await db('todos').select('*');
  }

  res.render('index', {
    title: 'ToDos!',
    todos,
  })
})

app.post('/add', async (req, res) => {
  await db('todos').insert({text: String(req.body.text)})

  await sendTodosToAllConnections()
  res.redirect('/')
})

app.get('/toggle/:id', async (req, res, next) => {
  const id = Number(req.params.id)

  const todo = await db('todos')
    .select('*')
    .where('id', id)
    .first()

  if (!todo) return next()

  await db('todos').where('id', id).update({done: !todo.done})

  await sendTodoDetailToAllConnections(id)
  await sendTodosToAllConnections()
  res.redirect('back')
})

app.get('/delete/:id', async (req, res, next) => {
  const id = Number(req.params.id)

  await db('todos')
    .delete()
    .where('id', id)

  await sendTodoDeletedToAllConnections(id)
  await sendTodosToAllConnections()
  res.redirect('/')
})

app.get('/detail/:id', async (req, res, next) => {
  const id = Number(req.params.id)

  const todo = await db('todos')
    .select('*')
    .where('id', id)
    .first()

  if (!todo) return next()

  res.render('detail', {
    todo,
  })
})

app.post('/edit/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  const text = String(req.body.text)

  const todo = await db('todos')
    .select('*')
    .where('id', id)
    .first()

  if (!todo) return next()

  await db('todos').where('id', id).update({text: text})

  await sendTodoDetailToAllConnections(id)
  await sendTodosToAllConnections()
  res.redirect('back')
})

app.use((req, res) => {
  console.log('404', req.method, req.url)

  res.render('404')
})

