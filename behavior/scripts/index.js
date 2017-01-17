'use strict'

exports.handle = (client) => {
  // Create steps
  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('welcome')
      client.addResponse('provide/documentation', {
        documentation_link: 'http://docs.init.ai',
      })
      client.addResponse('provide/instructions')

      client.updateConversationState({
        helloSent: true
      })

      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('apology/untrained')
      client.done()
    }
  })

const handleGreeting = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addTextResponse('Hello world, I mean human')
      client.addResponse('greeting')
      client.done()
    }
  })

  const handleGoodbye = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      //client.addTextResponse('See you later!')
      client.addResponse('goodbye')
      client.done()
    }
  })

  const handleBooth = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      //client.addTextResponse('See you later!')
      client.addResponse('Photobooth/booths')
      client.done()
    }
  })

  client.runFlow({
    classifications: {
      greeting: 'greeting',
      goodbye: 'goodbye',
    },
    streams: {
      greeting: handleGreeting,
      goodbye: handleGoodbye,
      main: 'onboarding',
      onboarding: [sayHello],
      end: [untrained]
    }
  })
}
