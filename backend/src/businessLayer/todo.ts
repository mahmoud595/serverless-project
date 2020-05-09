import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { AppError } from '../errors/appError'

const todoAccess = new TodosAccess()
const logger = createLogger('Todos')

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos for user: ', { userId })

  return todoAccess.getTodos(userId)
}

export async function createTodo(todoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
  logger.info('Creating todo', { todoRequest, userId });
  const todoId = uuid.v4()
  const todo = {
    ...todoRequest,
    createdAt: (new Date()).toISOString(),
    userId,
    todoId,
    done: false,

  }
  return todoAccess.createTodo(todo)
}

export async function updateTodo(todoRequest: UpdateTodoRequest, todoId: string): Promise<void> {
  logger.info('Update todo', { todoId, todoRequest })
  const toBeUpdatedTodo = await todoAccess.getTodo(todoId)
  if (!toBeUpdatedTodo) {
    logger.info('Todo not found', { todoId })
    throw new AppError('Not found', 404)
  }
  logger.info('Todo Found', { toBeUpdatedTodo })
  await todoAccess.updateTodo(todoRequest, toBeUpdatedTodo)
}


export async function deleteTodo(todoId: string): Promise<void> {
  logger.info('Deleting todo', { todoId });
  const toBeDeletedTodo = await todoAccess.getTodo(todoId)
  if (!toBeDeletedTodo) {
    logger.info('Todo not found', { todoId })
    throw new AppError('Not found', 404)
  }
  logger.info('Todo Found', { toBeDeletedTodo })
  await todoAccess.deleteTodo(toBeDeletedTodo)

}

export async function generateUploadUrl(todoId: string): Promise<string> {
  logger.info('Generating todo url', { todoId });
  return todoAccess.generateUploadUrl(todoId)
}


