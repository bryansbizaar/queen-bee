// client/src/tests/setup/mockProducts.js
export const mockProducts = [
  {
    id: 1,
    title: 'Dragon',
    price: 1500,
    stock: 5,
    description: 'Fierce dragon-shaped beeswax candle with intricate details',
    category: 'Novelty',
    image: '/images/dragon.jpg',
    burnTime: '15 hours',
    weight: '200g'
  },
  {
    id: 2,
    title: 'Corn Cob',
    price: 1600,
    stock: 3,
    description: 'Rustic corn cob candle made from pure beeswax',
    category: 'Novelty',
    image: '/images/corn-cob.jpg',
    burnTime: '18 hours',
    weight: '250g'
  },
  {
    id: 3,
    title: 'Beeswax Taper',
    price: 800,
    stock: 10,
    description: 'Classic taper candle, perfect for dining',
    category: 'Traditional',
    image: '/images/taper.jpg',
    burnTime: '8 hours',
    weight: '50g'
  },
  {
    id: 4,
    title: 'Honey Bear',
    price: 1200,
    stock: 7,
    description: 'Adorable honey bear candle with natural honey scent',
    category: 'Novelty',
    image: '/images/honey-bear.jpg',
    burnTime: '12 hours',
    weight: '150g'
  },
  {
    id: 5,
    title: 'Pillar Candle',
    price: 2000,
    stock: 4,
    description: 'Large pillar candle for extended burning',
    category: 'Traditional',
    image: '/images/pillar.jpg',
    burnTime: '25 hours',
    weight: '400g'
  }
]

export const getProductById = (id) => {
  return mockProducts.find(product => product.id === id)
}

export const getProductsByCategory = (category) => {
  return mockProducts.filter(product => product.category === category)
}
