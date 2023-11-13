const axios = require('axios')

exports.main = (context = {}, sendResponse) => {
  const { contracts } = context.parameters
  const token = "pat-na1-35d12fcb-c3a8-4413-815c-679d2437ead0"
  return getTable(token, contracts)
    .then((data) => {
      console.log(data.data)
      sendResponse({ status: 'success' })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const getTable = (token, contracts) => {
  return axios.get(
    `https://api.hubapi.com/cms/v3/hubdb/tables/7410851`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
}