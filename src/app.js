import express from 'express'
import cookieParser from "cookie-parser";
import todosRouter from './routes/todos.js'
import usersRouter from './routes/users.js'
import { getUserByToken } from "./db/users.js";

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

app.use(todosRouter)
app.use(usersRouter)

app.use((req, res) => {
  console.log('404', req.method, req.url)

  res.render('404')
})

