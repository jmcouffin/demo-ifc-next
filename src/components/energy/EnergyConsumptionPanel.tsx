import { memo } from "react";
import { EnergyData } from "@/types/ifc";
import { SpaceEnergyViz } from "./SpaceEnergyViz";

import ifcInfo from "../../../data/json/ifcInfo.json";

import { IfcData } from "@/types/ifc";
import energyData from "../../../data/json/energyData.json";
import { twMerge } from "tailwind-merge";

const ifcData = ifcInfo as IfcData;
const roomEnergyData = energyData as EnergyData;
export const EnergyConsumptionPanel = memo(({ isSidePanelExpanded }: { isSidePanelExpanded: boolean }) => {
    return (
        <aside
            className={twMerge(`absolute bottom-16 lg:top-14 right-4
                flex flex-col gap-1 max-h-[10rem] w-auto lg:w-[30rem]
                bg-backdrop-blur rounded-lg shadow-xl
                animate-appear-top animation-delay-[500ms] opacity-0
            `)}
        >
            <header className="w-full flex flex-row justify-between items-center gap-4 px-4 pt-2">
                <h1>Energy Consumption</h1>
                <p className="flex items-center justify-center gap-1 font-semibold text-xs rounded-full bg-negative-100 text-negative px-2">
                    <small>&#9650;</small> 3 Alerts
                </p>
            </header>
            <div className="overflow-y-scroll grid grid-cols-3 h-full gap-1 px-4">
                {Object.entries(roomEnergyData).map(([roomGuid, cons]: [string, number]) => (
                    <SpaceEnergyViz key={roomGuid} roomName={ifcData[roomGuid].props.Name} cons={cons} />
                ))}
            </div>
        </aside>
    );
});

EnergyConsumptionPanel.displayName = "EnergyPanel";