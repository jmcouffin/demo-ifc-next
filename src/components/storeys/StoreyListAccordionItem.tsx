import { MouseEvent } from "react";
import { AccordionItem, AccordionButton, AccordionIcon, IconButton } from "@chakra-ui/react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

import { CaretRightSharpSolidIcon } from "@/components/common/icons";
import { StoreyListAccordionPanel } from "./StoreyListAccordionPanel";

import { IfcData } from "@/types/ifc";

export const StoreyListAccordionItem = ({
    ifcData,
    storeyGuid,
    storeyCount,
    isStoreyVisible,
    index,
    handleStoreyVisibility,
}: {
    ifcData: IfcData;
    storeyGuid: string;
    storeyCount: number;
    isStoreyVisible: boolean;
    index: number;
    handleStoreyVisibility: (storeyGuid: string, event: MouseEvent<HTMLButtonElement>) => void;
}) => {
    return (
        <AccordionItem
            key={ifcData[storeyGuid].props.GlobalId}
            border="none"
            transition="opacity .25s"
        >
            {({ isExpanded }) => (
                <div
                    className={`
                        my-px bg-ground border transitions-all 
                        ${index === 0 ? "md:rounded-t-md" : ""}
                        ${index === storeyCount - 1 ? "md:rounded-b-md" : ""}
                        ${isExpanded ? "rounded-md overflow-hidden border-accent" : "border-transparent"}
                    `}
                >
                    <div className="relative">
                        <AccordionButton
                            pr="1"
                            pl="2"
                            py="1"
                            textTransform="none"
                            alignItems="center"
                            className="group w-full gap-2"
                            border="none"
                            _hover={{
                                bgColor: "none",
                            }}
                            _focus={{
                                bgColor: "var(--color-bg-underground)",
                            }}
                            _expanded={{
                                bgColor: "var(--color-bg-underground)",
                            }}
                        >
                            <AccordionIcon
                                as={CaretRightSharpSolidIcon}
                                width="3"
                                height="3"
                                opacity={isExpanded ? "1 !important" : 0.2}
                                className="fill-accent group-hover:opacity-[.4] transition-opacity"
                                _expanded={{
                                    transform: "rotate(180deg)",
                                }}
                            />

                            <h2 className="flex-1 text-left font-medium">
                                {ifcData[storeyGuid].props.Name}
                            </h2>
                        </AccordionButton>
                        <IconButton
                            aria-label="Show/hide storey"
                            variant="ghost"
                            size="sm"
                            icon={isStoreyVisible ? <RiEyeLine /> : <RiEyeOffLine />}
                            onClick={(event) => {
                                handleStoreyVisibility(storeyGuid, event);
                            }}
                            pos="absolute"
                            top="0"
                            px={[4, 0]}
                            right="0"
                            className="hover:opacity-100 transition-all"
                            opacity={isStoreyVisible ? 0.8 : 0.5}
                            _hover={{
                                bgColor: "transparent",
                            }}
                            _focus={{
                                bgColor: "transparent",
                            }}
                        />
                    </div>

                    <StoreyListAccordionPanel ifcData={ifcData} storeyGuid={storeyGuid} />
                </div>
            )}
        </AccordionItem>
    );
};
