import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'
import { test, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('deve ser capaz de criar um novo usuário', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })
})
