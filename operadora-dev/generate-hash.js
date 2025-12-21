const bcrypt = require('bcryptjs')

const password = 'Password123!'

bcrypt.hash(password, 10).then(hash => {
  console.log('✅ Nuevo hash para Password123!:')
  console.log(hash)
  
  // Verificar que funciona
  bcrypt.compare(password, hash).then(match => {
    console.log('\n✅ Verificación:', match ? 'CORRECTO' : 'ERROR')
    process.exit(0)
  })
}).catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
