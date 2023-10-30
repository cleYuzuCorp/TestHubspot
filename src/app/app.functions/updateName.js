const axios = require('axios')

exports.main = (context = {}, sendResponse) => {
  const { contactId, name } = context.parameters
  const token = "pat-na1-35d12fcb-c3a8-4413-815c-679d2437ead0"
  return updateName(token, contactId, name)
    .then(() => {
      sendResponse({ status: 'success' })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const updateName = (token, contactId, name) => {
  return axios.patch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
    {
      properties: {
        lastname: name,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
}