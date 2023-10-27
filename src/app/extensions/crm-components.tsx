import React, { useState, useEffect, useCallback } from "react"
import {
    Text,
    Alert,
    Flex,
    Heading,
    Select,
    Button,
    hubspot,
} from "@hubspot/ui-extensions"

import { CrmAssociationPivot, CrmDataHighlight, CrmPropertyList, CrmReport, CrmStageTracker, CrmActionButton, CrmActionLink, CrmCardActions } from '@hubspot/ui-extensions/crm'

hubspot.extend<'crm.record.tab'>(({ context, actions, runServerlessFunction }) => (
    <CRMComponents
        context={context}
        runServerless={runServerlessFunction}
        fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
        addAlert={actions.addAlert}
    />
))

const CRMComponents = ({ context, runServerless, fetchCrmObjectProperties, addAlert }) => {

    const [stage, setStage] = useState('contractsent')
    const [showProperties, setShowProperties] = useState(true)
    const [dealId, setDealId] = useState(null)
    const [dealname, setDealname] = useState(null)
    const [error, setError] = useState('')

    const stageToPropertiesMap = {
        appointmentscheduled: [
            'dealname',
            'engagements_last_meeting_booked',
            'dealtype',
        ],
        qualifiedtobuy: ['hubspot_owner_id', 'amount', 'dealtype', 'hs_priority'],
        presentationscheduled: [
            'hs_priority',
            'hs_deal_stage_probability',
            'hs_forecast_amount',
        ],
        decisionmakerboughtin: [
            'hs_deal_stage_probability',
            'hs_tcv',
            'amount',
            'notes_last_contacted',
        ],
        contractsent: ['createdate', 'hs_acv', 'hs_deal_stage_probability'],
        closedwon: ['closed_won_reason', 'closedate', 'amount'],
        closedlost: ['closedate', 'closed_lost_reason', 'amount'],
    }

    const options = [
        { label: 'Appointment Scheduled', value: 'appointmentscheduled' },
        { label: 'Qualified to Buy', value: 'qualifiedtobuy' },
        { label: 'Presentation Scheduled', value: 'presentationscheduled' },
        { label: 'Decision Maker Bought In', value: 'decisionmakerboughtin' },
        { label: 'Contract Sent', value: 'contractsent' },
        { label: 'Closed Won', value: 'closedwon' },
        { label: 'Closed Lost', value: 'closedlost' },
    ]

    useEffect(() => {
        fetchCrmObjectProperties(['dealname', 'dealstage', 'hs_object_id']).then(
            (properties) => {
                setStage(properties.dealstage)
                setDealId(properties.hs_object_id)
                setDealname(properties.dealname)
            }
        )
    }, [stage])

    const handleStageChange = useCallback(
        (newStage) => {
            runServerless({
                name: 'updateDeal',
                parameters: {
                    dealId: dealId,
                    dealStage: newStage,
                },
            }).then((resp) => {
                console.log(resp, 'resp')
                if (resp.status === 'SUCCESS') {
                    addAlert({
                        type: 'success',
                        message: 'Deal stage updated successfully',
                    })
                    setStage(newStage)
                } else {
                    setError(resp.message || 'An error occurred')
                }
            })
        },
        [dealId, addAlert, runServerless]
    )

    const handlePropertyToggle = useCallback(() => {
        setShowProperties((current) => !current)
    }, [])

    const dealContext = {
        objectTypeId: "0-3",
        objectId: 14795354663,
    }

    const associateContext = {
        objectTypeId: "0-3",
        association: {
            objectTypeId: "0-1",
            objectId: 769851,
        }
    }

    if (error !== '') {
        return <Alert title="Error" variant="error">{error}</Alert>
    }

    return (
        <>
            <Flex direction="column" gap="lg">
                <Flex direction="column" gap="md">
                    <Heading>Pivot d'association</Heading>
                    <CrmAssociationPivot
                        objectTypeId="contact"
                        maxAssociations={10}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Liste de propriété</Heading>
                    <CrmDataHighlight
                        properties={["firstname", "lastname", "email", "createdate", "lastmodifieddate"]}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Liste de propriété orienté</Heading>
                    <CrmPropertyList
                        properties={['firstname', 'lastname', 'email', 'createdate', 'lastmodifieddate']}
                        direction="row"
                    />
                </Flex>

                {/* <Flex direction="column" gap="md">
                    <Heading>Rapport</Heading>
                    <CrmReport reportId="6339949" />
                </Flex> */}

                <Flex direction="column" gap="md">
                    <Heading>Suivi de scène</Heading>

                    <Text>Deal status : {dealname}</Text>

                    <Flex justify="center" align="end" gap="md">
                        <Select
                            label="Update Deal Stage"
                            name="deal-stage"
                            tooltip="Please choose"
                            value={stage}
                            onChange={handleStageChange}
                            options={options}
                        />

                        <Button
                            variant={showProperties ? 'primary' : 'secondary'}
                            onClick={handlePropertyToggle}
                        >
                            {showProperties ? 'Hide' : 'Show'} Properties
                        </Button>
                    </Flex>

                    <CrmStageTracker
                        properties={stageToPropertiesMap[stage || '']}
                        showProperties={showProperties}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Boutons d'actions</Heading>

                    <Flex justify="center" gap="md">
                        <CrmActionButton
                            actionType="PREVIEW_OBJECT"
                            actionContext={dealContext}
                            variant="secondary"
                        >
                            Preview existing Deal
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="OPEN_RECORD_ASSOCIATION_FORM"
                            actionContext={associateContext}
                            variant="primary"
                        >
                            Create new Deal
                        </CrmActionButton>
                    </Flex>

                    <CrmActionLink
                        actionType="ADD_NOTE"
                        actionContext={dealContext}
                    >
                        Add a note about this deal to the record
                    </CrmActionLink>

                    <CrmCardActions
                        actionType="PREVIEW_OBJECT"
                        actionConfigs={[
                            {
                                type: "action-library-button",
                                label: "Preview",
                                actionType: "PREVIEW_OBJECT",
                                actionContext: {
                                    objectTypeId: "0-3",
                                    objectId: 14795354663
                                },
                                tooltipText: "Preview this deal record."
                            },
                            {
                                type: "dropdown",
                                label: "Activities",
                                options: [
                                    {
                                        type: "action-library-button",
                                        label: "Send email",
                                        actionType: "SEND_EMAIL",
                                        actionContext: {
                                            objectTypeId: "0-1",
                                            objectId: 769851
                                        }
                                    },
                                    {
                                        type: "action-library-button",
                                        label: "Add note",
                                        actionType: "ADD_NOTE",
                                        actionContext: {
                                            objectTypeId: "0-1",
                                            objectId: 769851
                                        },
                                    }
                                ]
                            }
                        ]}
                    />

                    <Flex justify="center" wrap="wrap" gap="md">
                        <CrmActionButton
                            actionType="ADD_NOTE"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 123456
                            }}
                            variant="secondary"
                        >
                            Create note
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="SEND_EMAIL"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 123456
                            }}
                            variant="secondary"
                        >
                            Send email
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="SCHEDULE_MEETING"
                            actionContext={{
                                objectTypeId: '0-1',
                                objectId: 123456
                            }}
                        >
                            Schedule meeting
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="OPEN_RECORD_ASSOCIATION_FORM"
                            actionContext={{
                                objectTypeId: '0-2',
                                association: {
                                    objectTypeId: '0-1',
                                    objectId: 123456
                                }
                            }}
                        >
                            Create new record
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="ENGAGEMENT_APP_LINK"
                            actionContext={{
                                objectTypeId: "0-2",
                                objectId: 2763710643,
                                engagementId: 39361694368
                            }}
                            variant="secondary"
                        >
                            Open note
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="RECORD_APP_LINK"
                            actionContext={{
                                objectTypeId: "0-2",
                                objectId: 2763710643,
                                includeEschref: true
                            }}
                            variant="secondary"
                        >
                            View company
                        </CrmActionButton>
                    </Flex>
                </Flex>
            </Flex >
        </>
    )
}