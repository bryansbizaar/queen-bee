import { http, HttpResponse } from 'msw'
import { mockApiResponses } from './mockApi.js'

export const handlers = [
  // Products API
  http.get('/api/products', () => {
    return HttpResponse.json(mockApiResponses.products.success)
  }),
  http.get('/api/products/:id', ({ params }) => {
    const { id } = params
    const product = mockApiResponses.products.success.data.find(p => p.id === Number(id))
    if (product) {
      return HttpResponse.json({ success: true, data: { product: product } })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Orders API
  http.post('/api/orders', async ({ request }) => {
    const data = await request.json()
    if (data) {
      return HttpResponse.json(mockApiResponses.orders.success, { status: 201 })
    }
    return new HttpResponse(null, { status: 400 })
  }),

  // Stripe API
  http.post('/api/stripe/payment-intent', () => {
    return HttpResponse.json(mockApiResponses.stripe.paymentIntent.success)
  }),
]