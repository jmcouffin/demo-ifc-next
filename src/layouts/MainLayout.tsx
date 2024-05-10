//------------------------------------------------------------------------------
import { useState, useCallback, memo, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";

//------------------------------------------------------------------------------
import { WelcomeModal } from "@/components/common/WelcomeModal";
import { Canvas } from "@/components/canvas/Canvas";
import { MainActionBar } from "@/components/canvas/MainActionBar";
import { DetailsPanel } from "@/components/canvas/DetailsPanel";
import { SecondaryActionBar } from "@/components/canvas/SecondaryActionBar";
import { MainPanel } from "@/components/layout/MainPanel";
import { EnergyConsumptionPanel } from "@/components/energy/EnergyConsumptionPanel";
import { AboutCard } from "@/components/about/AboutCard";

//------------------------------------------------------------------------------
import { handleCanvasSelection, unselectEntities } from "@/lib/3dverse/helpers";
import { Product } from "@/types/ifc";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export const MainLayout = memo(() => {
    //--------------------------------------------------------------------------
    // Hooks
    const [selectedPropertyGUID, setselectedPropertyGUID] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
            handleCanvasSelection(event, setselectedPropertyGUID, energyVisible);
        },
        [energyVisible],
    );

    //------------------------------------------------------------------------------
    const handleKey = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        unselectEntities(event, setselectedPropertyGUID);
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
            <MainPanel
                isExpanded={isMainPanelExpanded}
                onExpand={onExpandMainPanel}
                onCollapse={onCollapseMainPanel}
                setselectedPropertyGUID={setselectedPropertyGUID}
                setSelectedProduct={setSelectedProduct}
            />
            <MainActionBar isMainPanelExpanded={isMainPanelExpanded} setEnergyVisibility={setEnergyVisibility} />
            <SecondaryActionBar basePoint={basePoint} sessionId={sessionId} />
            <DetailsPanel
                selectedProduct={selectedProduct}
                selectedPropertyGUID={selectedPropertyGUID}
                onClose={() => {
                    setselectedPropertyGUID(null);
                    setSelectedProduct(null);
                }}
            />
            <AboutCard />
            <WelcomeModal />
        </>
    );
});

//------------------------------------------------------------------------------
MainLayout.displayName = "MainLayout";
