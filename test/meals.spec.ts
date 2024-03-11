import { execSync } from 'child_process'
import request from 'supertest'
import { test, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  test('deve ser capaz de criar uma nova refeição', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  test('deve ser capaz de listar todas as refeições de um usuário', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Lunch',
        description: 'lunch',
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)
    expect(mealsResponse.body.meals[0].name).toBe('Lunch')
    expect(mealsResponse.body.meals[1].name).toBe('Breakfast')
  })

  test('deve ser capaz de mostrar uma única refeição', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Breakfast',
        description: 'breakfast',
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    })
  })

  test('deve ser capaz de atualizar uma refeição de um usuário', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Dinner',
        description: 'dinner',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  test('deve ser capaz de excluir uma refeição de um usuário', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(204)
  })

  test('deve ser capaz de obter métricas de um usuário', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Thadeu', email: 'thadeu@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date('2021-01-01T08:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Lunch',
        description: 'lunch',
        isOnDiet: false,
        date: new Date('2024-03-11T12:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Snack',
        description: 'snack',
        isOnDiet: true,
        date: new Date('2024-03-11T16:30:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Dinner',
        description: 'dinner',
        isOnDiet: true,
        date: new Date('2024-03-11T21:00:00'),
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: 'breakfast',
        isOnDiet: true,
        date: new Date('2024-03-11T09:00:00'),
      })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 2,
    })
  })
})
