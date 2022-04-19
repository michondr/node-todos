import { createUser, getUser } from "../db/users.js";
import express from "express";

const router = express.Router()

router.get('/logout', async (req, res) => {
  res.cookie('token', null)

  res.redirect('/')
})

router.get('/register', async (req, res) => {
  res.render('register')
})

router.post('/register', async (req, res) => {
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

router.get('/login', async (req, res) => {
  res.render('login')
})

router.post('/login', async (req, res) => {
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

export default router
