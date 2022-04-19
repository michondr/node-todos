import db from "../db.js";
import crypto from "crypto";


export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const token = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')

  const ids = await db('users').insert({name, salt, hash, token})

  return db('users').where('id', ids[0]).first()
}

export const getUser = async (name, password) => {
  const user = await db('users').where({name}).first()
  if (!user) return null

  const hash = crypto.pbkdf2Sync(password, user.salt, 100_000, 64, 'sha512').toString('hex')
  if (hash !== user.hash) return null

  return user
}

export const getUserByToken = async (token) => {
  return db('users').where({token: token}).first()
}
