import express from 'express'

const port = 3000

let id = 1

const todos = [
  {
    id: id++,
    text: 'Vzít si dovolenou',
    done: false,
  },
  {
    id: id++,
    text: 'Koupit Elden Ring',
    done: true,
  },
]

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index', {
    title: 'ToDos!',
    todos,
  })
})

app.post('/add', (req, res) => {
  const text = String(req.body.text)

  todos.push({
    id: id++,
    text,
    done: false,
  })

  res.redirect('/')
})

app.get('/toggle/:id', (req, res, next) => {
  const id = Number(req.params.id)

  const todo = todos.find((todo) => todo.id === id)

  if (!todo) return next()

  todo.done = !todo.done

  res.redirect('back')
})

app.get('/delete/:id', (req, res, next) => {
  const id = Number(req.params.id)

  const index = todos.findIndex((todo) => todo.id === id)

  if (index === -1) return next()

  todos.splice(index, 1)

  res.redirect('/')
})

app.get('/detail/:id', (req, res, next) => {
  const id = Number(req.params.id)

  const todo = todos.find((todo) => todo.id === id)

  if (!todo) return next()

  res.render('detail', {
    todo,
  })
})

app.post('/edit/:id', (req, res, next) => {
  const id = Number(req.params.id)
  const text = String(req.body.text)

  const todo = todos.find((todo) => todo.id === id)

  if (!todo) return next()

  todo.text = text

  res.redirect('back')
})

app.use((req, res) => {
  console.log('404', req.method, req.url)

  res.render('404')
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
