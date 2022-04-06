import test from "ava";
import supertest from "supertest"
import db from "../src/db.js";
import { app } from "../src/app.js";

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})


test.serial('GET / returns list of todos', async (t) => {
  const textToFind = 'foobar to find #'

  await db('todos').insert({ text: textToFind })

  const response = await supertest(app).get('/')

  t.is(response.status, 200)
  t.assert(response.text.includes(textToFind))
})

test.serial('POST /add creates new todo', async (t) => {
  const textToFind = 'foobar to find #'

  const response = await supertest(app).post('/add').type('form').send({text: textToFind}).redirects(1)

  t.is(response.status, 200)
  t.assert(response.text.includes(textToFind))
})
