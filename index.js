const translationsRaw = require('./translations.json')
const translations = Object.entries(translationsRaw)
const express = require('express')
const app = express()
const port = 3000

const contentfulManagement = require('contentful-management');
const translationsEntries = []

app.get('/', async (_req, res) => {
  try {
    const client = contentfulManagement.createClient({
      accessToken: 'CFPAT-FbO5rpGVCvOigcJOiZsbBwi6rjHNrLtlb7FsvNnqNMY',
    })

    const space = await client.getSpace('e48r2iwyjczp')
    const env = await space.getEnvironment('staging')

    translations.forEach(async ([ key, value ]) => {
      const currentEntry = await env.getEntries({ content_type: 'localizedItem', 'fields.key': key })

      if (!currentEntry.items.length) {
        const entry = await env.createEntry('localizedItem', {
          fields: {
            key: { 'en-US': key },
            content: { 'en-US': value },
          }
        })

        console.log('Entry created')
        translationsEntries.push(entry.sys.id)
      } else {
        translationsEntries.push(currentEntry.items[0].sys.id)
        console.log('Already exists')
      }
    })

/*     const containerEntry = await env.getEntry('11G4hpZ7Ovy7gl5uG41Su1')

    translationsEntries.forEach(entryId => {
      containerEntry.fields.localizedItems['en-US'].push({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: entryId
        }
      })
    })

    containerEntry.update() */
  } catch(error) {
    console.error('Error creating entry:', error)
  }

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
