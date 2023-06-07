const express = require('express')
const app = express()
const port = 3000

const contentfulManagement = require('contentful-management');

app.get('/', (req, res) => {
  const client = contentfulManagement.createClient({
    accessToken: 'CFPAT-FbO5rpGVCvOigcJOiZsbBwi6rjHNrLtlb7FsvNnqNMY',
  });

  client.getSpace('e48r2iwyjczp')
    .then((space) => space.getEnvironment('staging'))
    .then((env) => env.createEntry('localizedItem', {
      fields: {
        key: { 'en-US': 'example.from.express' },
        content: { 'en-US': 'Example from Express' },
      }
    }))
    .then((entry) => console.log('Entry created:', entry.sys.id))
    .catch((error) => console.error('Error creating entry:', error));

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
