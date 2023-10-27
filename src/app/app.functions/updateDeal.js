const axios = require('axios')

exports.main = (context = {}, sendResponse) => {
  const { dealId, dealStage } = context.parameters
  const token = "pat-na1-35d12fcb-c3a8-4413-815c-679d2437ead0"
  return updateDeal(token, dealId, dealStage)
    .then(() => {
      sendResponse({ status: 'success' })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const updateDeal = (token, id, stage) => {
  return axios.patch(
    `https://api.hubapi.com/crm/v3/objects/deals/${id}`,
    {
      properties: {
        dealstage: stage,
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