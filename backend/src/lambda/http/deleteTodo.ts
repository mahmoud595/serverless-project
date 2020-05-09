import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteTodo } from '../../businessLayer/todo'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  let statusCode = 200
  try {
    await deleteTodo(todoId)
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
