import ejs from 'ejs'
import { WebSocketServer } from "ws";
import { getAllTodos, getTodo } from "./db.js";

/** @type {Set<WebSocket>} */
const connections = new Set()

export const createWebsocketServer = (server) => {
  const wss = new WebSocketServer({server});

  wss.on('connection', (ws) => {
    console.log('created, size: ', connections.size)
    connections.add(ws)

    ws.on('close', () => {
      console.log('closed, size: ', connections.size)
      connections.delete(ws)
    })

  });
}

export const sendTodosToAllConnections = async () => {
  const todos = await getAllTodos()
  const html = await ejs.renderFile('views/_todos.ejs', {todos})
  const jsonData = JSON.stringify({type: 'allTodos', html});

  for (const connection of connections) {
    connection.send(jsonData)
  }
}

export const sendTodoDetailToAllConnections = async (todoId) => {
  const todo = await getTodo(todoId)

  const html = await ejs.renderFile('views/_todo.ejs', {todo})
  const jsonData = JSON.stringify({type: 'todoDetail', html});

  for (const connection of connections) {
    connection.send(jsonData)
  }
}

export const sendTodoDeletedToAllConnections = async (todoId) => {
  const jsonData = JSON.stringify({type: 'todoDeleted', todoId});

  for (const connection of connections) {
    connection.send(jsonData)
  }
}
