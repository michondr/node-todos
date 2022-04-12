import express from 'express'
import db, { createUser, getAllTodos, getUser, getUserByToken } from "../src/db.js"
import { sendTodoDeletedToAllConnections, sendTodoDetailToAllConnections, sendTodosToAllConnections } from "./websockets.js";
import cookieParser from "cookie-parser";

export const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use(async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    res.locals.user = await getUserByToken(token)
  } else {
    res.locals.user = null
  }

  next()
})

app.get('/', async (req, res) => {

  let todos = null;

  if (req.query.done === 'true') {
    todos = await db('todos').select('*').where('done', true);
  } else if (req.query.done === 'false') {
    todos = await db('todos').select('*').where('done', false);
  } else {
    todos = await getAllTodos();
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

app.get('/logout', async (req, res) => {
  res.cookie('token', null)

  res.redirect('/')
})

app.get('/register', async (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  try {
    const user = await createUser(name, password)
    res.cookie('token', user.token)
    res.redirect('/')
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.redirect('/register')
    }
  }

})

app.get('/login', async (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  const user = await getUser(name, password)

  if (user) {
    res.cookie('token', user.token)
    res.redirect('/')
  } else {
    res.redirect('/login')
  }
})

app.use((req, res) => {
  console.log('404', req.method, req.url)

  res.render('404')
})

