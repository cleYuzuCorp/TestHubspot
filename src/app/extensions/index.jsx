import React, { useState, useEffect } from "react"
import {
  Divider,
  Link,
  Button,
  Text,
  Input,
  Flex,
  hubspot,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  DateInput,
  Alert,
} from "@hubspot/ui-extensions"

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
))

hubspot.extend(({ actions }) => (
  <Extension
    fetchProperties={actions.fetchCrmObjectProperties}
  />
))

const Extension = ({ context, runServerless, sendAlert, fetchProperties }) => {
  // const [text, setText] = useState("")

  // const handleClick = () => {
  //   runServerless({ name: "myFunc", parameters: { text: text } }).then((resp) =>
  //     sendAlert({ message: resp.response })
  //   )
  // }

  const [startDate, setStartDate] = useState(new Date())
  const [startDateTemp, setStartDateTemp] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [endDateTemp, setEndDateTemp] = useState(new Date())
  const [price, setPrice] = useState(0)
  const [priceTemp, setPriceTemp] = useState(0)
  const [contracts, setContracts] = useState([])

  const Months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
      fetchProperties(["firstname", "lastname"])
        .then(properties => {
          setFirstName(properties.firstname);
          setLastName(properties.lastname);
      });
  }, [fetchProperties]);

  useEffect(() => {
    setContracts(calculateContracts())
  }, [startDate, endDate, price])

  const calculateContracts = () => {
    if (startDate && endDate && price) {
      const startMonth = startDate.month
      const startYear = startDate.year
      const endMonth = endDate.month
      const endYear = endDate.year
      const contracts = []

      const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1
      const contractAmountPerMonth = price / totalMonths

      for (let year = startYear; year <= endYear; year++) {
        const start = year === startYear ? startMonth : 0
        const end = year === endYear ? endMonth : 11

        for (let month = start; month <= end; month++) {
          contracts.push({ month: Months[month] + ' ' + year, amount: contractAmountPerMonth })
        }
      }
      return contracts
    }
    return []
  }

  const handleSubmit = () => {
    setStartDate(startDateTemp)
    setEndDate(endDateTemp)
    setPrice(priceTemp)
    runServerless({ name: "myFunc" }).then(() =>
      sendAlert({ message: "Modification effectué avec succès !" })
    )
  }

  return (
    <>
      <Flex direction="column" gap="lg">
        <Flex justify="center" gap="lg">
          <DateInput
            name="start-date"
            label="Date de début de contrat"
            value={startDateTemp}
            onChange={(date) => {
              setStartDateTemp(date)
            }}
          />
          <DateInput
            name="end-date"
            label="Date de fin de contrat"
            value={endDateTemp}
            onChange={(date) => {
              setEndDateTemp(date)
            }}
          />
        </Flex>

        <Flex justify="center">
          <Input
            name="price"
            label="Montant du contrat"
            value={priceTemp}
            onChange={(price) => {
              setPriceTemp(price)
            }}
          />
        </Flex>

        <Flex justify="center">
          <Button variant="primary" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </Flex>

        <Text>Hello {firstName} {lastName}</Text>

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

      {/* <Text>
        <Text format={{ fontWeight: "bold" }}>
          Your first UI extension is ready!
        </Text>
        Congratulations, {context.user.firstName}! You just deployed your first
        HubSpot UI extension. This example demonstrates how you would send
        parameters from your React frontend to the serverless function and get a
        response back.
      </Text>
      <Flex direction="row" align="end" gap="small">
        <Input name="text" label="Send" onInput={(t) => setText(t)} />
        <Button type="submit" onClick={handleClick}>
          Click me
        </Button>
      </Flex>
      <Divider />
      <Text>
        What now? Explore all available{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extension-components">
          UI components
        </Link>
        , get an overview of{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extensions-overview">
          UI extensions
        </Link>
        , learn how to{" "}
        <Link href="https://developers.hubspot.com/docs/platform/create-ui-extensions">
          add a new custom card
        </Link>
        , jump right in with our{" "}
        <Link href="https://developers.hubspot.com/docs/platform/ui-extensions-quickstart">
          Quickstart Guide
        </Link>
        , or check out our{" "}
        <Link href="https://github.com/HubSpot/ui-extensions-react-examples">
          code Samples
        </Link>
        .
      </Text> */}
    </>
  )
}
