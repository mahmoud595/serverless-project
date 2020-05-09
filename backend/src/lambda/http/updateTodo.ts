import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLayer/todo'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  let statusCode = 200
  try {
    await updateTodo(updatedTodo, todoId)
  } catch (error) {
    statusCode = error.statusCode || 500
  } finally {
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }

}
