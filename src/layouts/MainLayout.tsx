//------------------------------------------------------------------------------
import { useState, useCallback, memo, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";

//------------------------------------------------------------------------------
import { Canvas } from "@/components/canvas/Canvas";
import { MainPanel } from "@/components/layout/MainPanel";
import { IfcPropertyPanel } from "@/components/IfcProperty/IfcPropertyPanel";
import { EnergyConsumptionPanel } from "@/components/energy/EnergyConsumptionPanel";
import { CanvasActionBar } from "@/components/canvas/CanvasActionBar";
import { ShareQRCode } from "@/components/canvas/ShareQRCode";

//------------------------------------------------------------------------------
import { handleCanvasSelection, unselectEntities } from "@/lib/3dverse/helpers";
import { WelcomeModal } from "@/components/common/WelcomeModal";
import { AboutCard } from "@/components/about/AboutCard";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export const MainLayout = memo(() => {
    //--------------------------------------------------------------------------
    // Hooks
    const [selectedPropertyEUID, setSelectedPropertyEUID] = useState<string | null>(null);
    const [energyVisible, setEnergyVisibility] = useState(false);
    const [basePoint, setBasePoint] = useState({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    const [sessionId, setSessionId] = useState("");

    //------------------------------------------------------------------------------
    const {
        isOpen: isMainPanelExpanded,
        onClose: onCollapseMainPanel,
        onOpen: onExpandMainPanel,
    } = useDisclosure({ defaultIsOpen: true });

    //--------------------------------------------------------------------------
    // Effects
    useEffect(() => {
        document.documentElement.classList.toggle("main-panel-expanded", isMainPanelExpanded);
    }, [isMainPanelExpanded]);

    //------------------------------------------------------------------------------
    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            handleCanvasSelection(event, setSelectedPropertyEUID, energyVisible);
        },
        [energyVisible],
    );

    //------------------------------------------------------------------------------
    const handleKey = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        unselectEntities(event, setSelectedPropertyEUID);
    }, []);

    //------------------------------------------------------------------------------
    // UI
    return (
        <>
            <Canvas
                onInputChange={handleChange}
                onKeyboardChange={handleKey}
                setBasePoint={setBasePoint}
                setSessionId={setSessionId}
            />

            {energyVisible && <EnergyConsumptionPanel isMainPanelExpanded={isMainPanelExpanded} />}

            <MainPanel isExpanded={isMainPanelExpanded} onExpand={onExpandMainPanel} onCollapse={onCollapseMainPanel} />

            <CanvasActionBar
                isMainPanelExpanded={isMainPanelExpanded}
                basePoint={basePoint}
                energyVisible={energyVisible}
                setEnergyVisibility={setEnergyVisibility}
            />

            <ShareQRCode sessionId={sessionId} />

            {selectedPropertyEUID && (
                <IfcPropertyPanel guid={selectedPropertyEUID} onClose={() => setSelectedPropertyEUID(null)} />
            )}

            <AboutCard />
            <WelcomeModal />
        </>
    );
});

//------------------------------------------------------------------------------
MainLayout.displayName = "MainLayout";
