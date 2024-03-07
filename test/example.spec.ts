import { test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

test('user can create a new transaction', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'Feather',
      amount: 100,
      type: 'debit',
    })
    .expect(201)
})
