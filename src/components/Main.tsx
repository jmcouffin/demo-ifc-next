import { useState, useCallback, memo } from "react";

import { Canvas } from "./Canvas";
import { SidePanel } from "@/components/SidePanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Settings } from "@/components/Settings";
import { EnergyView } from "./EnergyView";
import { EnergyViewButton } from "./EnergyViewButton";

import { handleCanvasSelection, unselectEntities } from "@/lib/3dverse/helpers";

export const Main = memo(() => {
    const [guid, setGuid] = useState("");
    const [basePoint, setBasePoint] = useState({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });

    const handleChange = useCallback((event: React.MouseEvent<HTMLElement>) => {
        handleCanvasSelection(event, setGuid);
    }, []);

    const handleKey = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        unselectEntities(event, setGuid);
    }, []);

    return (
        <>
            <Canvas onInputChange={handleChange} onKeyboardChange={handleKey} setBasePoint={setBasePoint} />
            <SidePanel />

            <div
                className="flex flex-row
                            justify-between
                            absolute
                            top-4
                            left-[var(--side-panel-width)]
                            ml-3
                            max-w-[500px]
                            gap-3"
            >
                <Settings basePoint={basePoint} />

                <EnergyViewButton />
            </div>

            <EnergyView />

            {guid ? <PropertiesPanel guid={guid} /> : null}
        </>
    );
});

Main.displayName = "Main";
