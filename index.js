const translationsRaw = require('./translations.json')
const translations = Object.entries(translationsRaw)
const contentfulManagement = require('contentful-management')
const express = require('express')
const app = express()
const port = 3000

const TOKEN = 'CFPAT-FbO5rpGVCvOigcJOiZsbBwi6rjHNrLtlb7FsvNnqNMY'
const SPACE = 'e48r2iwyjczp'
const ENVIRONMENT = 'master'
const newLocalizedGroupId = '11G4hpZ7Ovy7gl5uG41Su1'
const translationsEntries = []

app.get('/verify', async (_req, res) => {
  try {
    const client = contentfulManagement.createClient({ accessToken: TOKEN })

    const space = await client.getSpace(SPACE)
    const env = await space.getEnvironment(ENVIRONMENT)

    const localizedItems = await env.getEntries({ content_type: 'localizedItem', limit: 1000 })

    let syncedUp = true
    translations.forEach(t => {
      if (!localizedItems.items.find(item => item.fields?.key['en-US'] === t[0])) {
        console.log(`"${t[0]}": "${t[1]}",`)
        syncedUp = false
      }
    })

    syncedUp && console.log('All synced Up!')
  } catch(error) {
    console.error('Error creating entry:', error)
  }

  res.send('Hello World!')
})

app.get('/update', async (_req, res) => {
  try {
    const client = contentfulManagement.createClient({ accessToken: TOKEN })

    const space = await client.getSpace(SPACE)
    const env = await space.getEnvironment(ENVIRONMENT)

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

    //containerEntry.update()
  } catch(error) {
    console.error('Error creating entry:', error)
  }

  res.send('Hello World!')
})

app.get('/update', async (_req, res) => {
  try {
    const client = contentfulManagement.createClient({ accessToken: TOKEN })

    const space = await client.getSpace(SPACE)
    const env = await space.getEnvironment(ENVIRONMENT)
    const localization = 'en-US'

    // Get all existing localized items in contentful
    const localizedItems = await env.getEntries({ content_type: 'localizedItem', limit: 1000 })
    // Get localized item group we want to add the items to
    const newLocalizedGroup = await env.getEntry(newLocalizedGroupId)
    // Get the current entries so that we add the same entries twice
    const newLocalizedGroupEntries = await env.getEntryReferences(newLocalizedGroupId, 4)
    // Create an object with the keys to speed check for already added entries
    const mappedAlreadyBindedLocalizedItems = newLocalizedGroupEntries?.includes?.Entry?.reduce(
      (accumValue, currentItem, {}) => ({
        ...accumValue,
        [currentItem.fields.key[localization]]: true
      })
    ) || {}

    localizedItems.items.forEach(entry => {
      const { fields, sys } = entry
      const { key } = fields
      const { id } = sys
      // If the items dont exist yet then we add them
      // If key is empty in contentful it returns undefined
      if (key && !mappedAlreadyBindedLocalizedItems[key[localization]]){
        // If the entry has no items added yet localizedItems will be undefined
        if (!('localizedItems' in newLocalizedGroup.fields)){
          newLocalizedGroup.fields.localizedItems = {
            [localization]: []
          }
        }
        // Add the entry at the end of the entry array
        newLocalizedGroup.fields.localizedItems[localization].push({
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id,
          }
        })
        console.log('Added '+key[localization])
      }
      else {
        console.warn(key && key[localization] + ' Already exists!')
      }
    })
    // let contentful know we updated the entry with the current values
    newLocalizedGroup.update()
  } catch(error) {
    console.error('Error creating entry:', error)
  }

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
