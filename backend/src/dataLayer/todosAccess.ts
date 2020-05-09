import * as AWS from 'aws-sdk'
const AWSXRay =  require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)


import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('Todo Access')

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosBucket = process.env.TODOS_S3_BUCKET,
    private readonly todosIndex = process.env.TODOS_ID_INDEX,
    private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
  ) {

  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    todo.attachmentUrl = `https://${this.todosBucket}.s3.amazonaws.com/${todo.todoId}`;
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()
    return todo
  }

  async deleteTodo(todo: TodoItem): Promise<void> {
    await Promise.all([
      this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId: todo.userId,
          createdAt: todo.createdAt
        }      
      }).promise(),
      this.s3.deleteObject({
        Bucket: this.todosBucket,
        Key: todo.todoId,
      }).promise()
    ])
  }

  async updateTodo(updatedTodo: UpdateTodoRequest, todo: TodoItem): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todo.userId,
        createdAt: todo.createdAt
      },
      UpdateExpression: 'set done = :done, #n = :name, dueDate = :dueDate',
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':done': updatedTodo.done,
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate
      },
    }).promise()

  }

  async getTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()
    return result.Items[0] as TodoItem
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.todosBucket,
      Key: todoId,
      Expires: this.urlExpiration
    })
    return uploadUrl
  }

}
function createDynamoDBClient() {
  logger.info("Creating Todos DynamoDB Client...");
  return new XAWS.DynamoDB.DocumentClient();
 }