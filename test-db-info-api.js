async function testAPI() {
  try {
    const res = await fetch('http://localhost:3000/api/debug/db-info')
    const data = await res.json()
    
    console.log('📊 Información de BD desde API:\n')
    console.log(JSON.stringify(data, null, 2))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testAPI()
