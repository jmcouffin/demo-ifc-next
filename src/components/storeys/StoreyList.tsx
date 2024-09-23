//------------------------------------------------------------------------------
import { useState } from "react";
import { Accordion, Button } from "@chakra-ui/react";

//------------------------------------------------------------------------------
import IFC_DATA from "../../../public/data/json/ifcData.json";
import IFC_TYPES from "../../../public/data/json/ifctype2guids.json";

//------------------------------------------------------------------------------
import { MainPanelHeader } from "@/components/layout/MainPanelHeader";
import { StoreyListAccordionItem } from "./StoreyListAccordionItem";

//------------------------------------------------------------------------------
import { IfcData, IfcType } from "@/types/ifc";
import { getEntityFromGuid } from "@/lib/3dverse/helpers";

//------------------------------------------------------------------------------
export const StoreyList = () => {
    //------------------------------------------------------------------------------
    const ifcData = IFC_DATA as IfcData;
    const ifctypes = IFC_TYPES as IfcType;

    const storeyKey = "IfcBuildingStorey";
    const storeyGuids = ifctypes[storeyKey];

    // Function to check if a storey has IfcSpaces
    const hasStoreySpaces = (storeyGuid: string): boolean => {
        const spaces = ifcData[storeyGuid].props?.spaces;
        return Array.isArray(spaces) && spaces.length > 0;
    };

    // Filter out storeys without IfcSpaces
    const filteredStoreyGuids = storeyGuids.filter(hasStoreySpaces);

    // Initialize visibleStoreys as an object mapping storeyGuid to boolean
    const initialVisibility = filteredStoreyGuids.reduce((acc, guid) => {
        acc[guid] = true;
        return acc;
    }, {} as { [key: string]: boolean });

    const [visibleStoreys, setVisibleStoreys] = useState(initialVisibility);

    //------------------------------------------------------------------------------
    const handleStoreyVisibility = async (storeyGuid: string, event: any) => {
        event.stopPropagation();

        if (storeyGuid) {
            const storeyEntity = await getEntityFromGuid(storeyGuid);

            const isVisible = visibleStoreys[storeyGuid];

            setVisibleStoreys((prevState) => ({
                ...prevState,
                [storeyGuid]: !isVisible,
            }));

            storeyEntity?.setVisibility(!isVisible);
        }
    };

    //------------------------------------------------------------------------------
    const areSomeVisible = Object.values(visibleStoreys).some((element: boolean) => element === true);

    const toggleStoreysVisibility = async (event: any) => {
        event.stopPropagation();
        const newVisibility = !areSomeVisible;

        const newVisibleStoreys = { ...visibleStoreys };
        for (const storeyGuid of filteredStoreyGuids) {
            newVisibleStoreys[storeyGuid] = newVisibility;
            const storeyEntity = await getEntityFromGuid(storeyGuid);
            await storeyEntity?.setVisibility(newVisibility);
        }
        setVisibleStoreys(newVisibleStoreys);
    };

    //------------------------------------------------------------------------------
    return (
        <article className="overflow-y-scroll h-full">
            <div className="flex-1 pb-4 md:pb-12">
                <MainPanelHeader title="Storeys">
                    <Button
                        variant="ghost"
                        fontSize="2xs"
                        size="2xs"
                        px="1"
                        color="content.secondary"
                        fontWeight={400}
                        onClick={toggleStoreysVisibility}
                    >
                        {areSomeVisible ? "Hide" : "Show"} all
                    </Button>
                </MainPanelHeader>

                <div className="md:mx-2">
                    <Accordion allowMultiple>
                        {filteredStoreyGuids.map((storeyGuid: string, index: number) => {
                            const isStoreyVisible = visibleStoreys[storeyGuid];

                            return (
                                <StoreyListAccordionItem
                                    key={storeyGuid}
                                    index={index}
                                    ifcData={ifcData}
                                    storeyGuid={storeyGuid}
                                    storeyCount={filteredStoreyGuids.length}
                                    isStoreyVisible={isStoreyVisible}
                                    handleStoreyVisibility={handleStoreyVisibility}
                                />
                            );
                        })}
                    </Accordion>
                </div>
            </div>
        </article>
    );
};
