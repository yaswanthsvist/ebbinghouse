var ngrok = require('ngrok')
process.on('message', async function() {
  // Do work  (in this case just up-case the string
  console.log("process.on('message', ngrok")
  //await ngrok.disconnect()
  try {
    await ngrok.disconnect()
    ngrokUrl = await ngrok.connect({
      proto: 'http',
      addr: 8000,
      authtoken: '3G3Pwcwz2kxunakisUdFE_8941fUYiSP1zUuGN3oYdG',
    })
  } catch (e) {
    console.log('ERRORRRRRRs' + JSON.stringify(e))
  }
  console.log("process.on('message', ngrok")
  // Pass results back to parent process
  process.send(ngrokUrl)
})
