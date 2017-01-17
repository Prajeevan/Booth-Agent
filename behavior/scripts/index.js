'use strict'
const getCurrentWeather = require('./lib/getCurrentWeather')

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
/*
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
*/

const collectCity = client.createStep({
  satisfied() {
    return Boolean(client.getConversationState().weatherCity)
  },

  extractInfo() {
    const city = client.getFirstEntityWithRole(client.getMessagePart(), 'city')

    if (city) {
      client.updateConversationState({
        weatherCity: city,
      })

      console.log('User wants the weather in:', city.value)
    }
  },

  prompt() {
    client.addResponse('prompt/weather_city')
    client.done()
  },
})


const provideWeather = client.createStep({
  satisfied() {
    return false
  },

  prompt(callback) {
    getCurrentWeather(client.getConversationState().weatherCity.value, resultBody => {
      if (!resultBody || resultBody.cod !== 200) {
        console.log('Error getting weather.')
        callback()
        return
      }

      const weatherDescription = (
        resultBody.weather.length > 0 ?
        resultBody.weather[0].description :
        null
      )

      const weatherData = {
        temperature: resultBody.main.temp,
        condition: weatherDescription,
        city: resultBody.name,
      }

      console.log('sending real weather:', weatherData)
      client.addResponse('provideWeather/weather', weatherData)
      client.done()

      callback()
    })
  }
})



client.runFlow({
  classifications: {},
  streams: {
    main: 'getWeather',
    hi: [sayHello],
    getWeather: [collectCity, provideWeather],
  }
})











}
