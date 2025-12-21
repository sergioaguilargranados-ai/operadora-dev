const bcrypt = require('bcryptjs')

const password = 'Password123!'
const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky'

bcrypt.compare(password, hash).then(result => {
  console.log('✅ Password match:', result)
  process.exit(result ? 0 : 1)
}).catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
