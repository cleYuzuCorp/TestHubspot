import React, { useState, useEffect, useCallback } from "react"
import {
  Alert,
  Button,
  Text,
  Flex,
  hubspot,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  DateInput,
  NumberInput,
} from "@hubspot/ui-extensions"

hubspot.extend<'crm.record.tab'>(({ context, runServerlessFunction, actions }) => (
  <Contract
    context={context}
    runServerless={runServerlessFunction}
    addAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
  />
))

const Contract = ({ context, runServerless, addAlert, fetchProperties }) => {

  const [startDate, setStartDate] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [endDate, setEndDate] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [price, setPrice] = useState(0)

  const [contracts, setContracts] = useState<{ month: string, amount: number }[]>([]);

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  const [error, setError] = useState("")

  const Months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  useEffect(() => {
    fetchProperties(["firstname", "lastname", "email", "createdate", "lastmodifieddate"])
      .then(properties => {
        setFirstName(properties.firstname)
        setLastName(properties.lastname)
        setEmail(properties.email)

        const createDateTimestamp = properties.createdate
        const createDate = new Date(parseInt(createDateTimestamp))
        const createYear = createDate.getFullYear()
        const createMonth = createDate.getMonth()
        const createDateOfMonth = createDate.getDate()
        const createFormattedDate = createDate.toLocaleDateString()
        const formattedCreate = { year: createYear, month: createMonth, date: createDateOfMonth, formattedDate: createFormattedDate }

        const lastModifiedDateTimestamp = properties.lastmodifieddate
        const lastModifiedDate = new Date(parseInt(lastModifiedDateTimestamp))
        const lastModifiedYear = lastModifiedDate.getFullYear()
        const lastModifiedMonth = lastModifiedDate.getMonth()
        const lastModifiedDateOfMonth = lastModifiedDate.getDate()
        const lastModifiedFormattedDate = lastModifiedDate.toLocaleDateString()
        const formattedLastModified = { year: lastModifiedYear, month: lastModifiedMonth, date: lastModifiedDateOfMonth, formattedDate: lastModifiedFormattedDate }

        setStartDate(formattedCreate)
        setEndDate(formattedLastModified)
      })
  }, [fetchProperties])

  const handleSubmit = useCallback(async () => {
    await runServerless({
      name: 'updateContract',
      parameters: {
        startDate: startDate,
        endDate: endDate,
        price: price
      },
    }).then((resp) => {
      if (resp.status === 'SUCCESS') {
        addAlert({
          type: 'success',
          message: 'Modification effectué avec succès',
        })

        const extractedData = resp.response.data.data

        const newData = extractedData.map(item => ({
          month: item.month || '',
          amount: item.amount || 0,
        }))

        setContracts(newData)
      } else {
        setError(resp.message || 'An error occurred')
      }
    })
  }, [startDate, endDate, price, runServerless, addAlert])


  if (error !== '') {
    return <Alert title="Error" variant="error" >{error}</Alert>
  }

  return (
    <>
      <Flex direction="column" gap="lg">
        <Flex justify="center" gap="lg">
          <DateInput
            name="start-date"
            label="Date de début de contrat"
            value={startDate}
            onChange={(date) => {
              if (date && date.formattedDate) {
                setStartDate({
                  year: date.year,
                  month: date.month,
                  date: date.date,
                  formattedDate: date.formattedDate
                });
              }
            }}
          />
          <DateInput
            name="end-date"
            label="Date de fin de contrat"
            value={endDate}
            onChange={(date) => {
              if (date && date.formattedDate) {
                setEndDate({
                  year: date.year,
                  month: date.month,
                  date: date.date,
                  formattedDate: date.formattedDate
                });
              }
            }}
          />
        </Flex>

        <Flex justify="center">
          <NumberInput
            name="price"
            label="Montant du contrat"
            min={0}
            value={price}
            onChange={(price) => {
              setPrice(price)
            }}
          />
        </Flex>

        <Flex justify="center">
          <Button variant="primary" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </Flex>

        <Text>Hello {firstName} {lastName}, your email : {email}</Text>

        <Table bordered={true}>
          <TableHead>
            <TableRow>
              <TableHeader>Mois</TableHeader>
              <TableHeader>Montant/Durée</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => <TableRow>
              <TableCell>{contract.month}</TableCell>
              <TableCell>{contract.amount}</TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </Flex>
    </>
  )
}
