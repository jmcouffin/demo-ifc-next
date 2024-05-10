//------------------------------------------------------------------------------
import IFC_DATA from "@/public/data/json/ifcData.json";

//------------------------------------------------------------------------------
import { Header } from "./Header";
import { ControlLight } from "./ControlLight";
import { ControlAnimation } from "./ControlAnimation";
import { Attributes } from "./Attributes";

//------------------------------------------------------------------------------
import { IfcData } from "@/types/ifc";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export const IfcPropertyPanel = ({ guid }: { guid: string }) => {
    //------------------------------------------------------------------------------
    const ifcData = IFC_DATA as IfcData;
    const entitiyProperties = ifcData[guid];

    if (!entitiyProperties?.props?.Name) {
        return <></>;
    }

    //------------------------------------------------------------------------------
    return (
        <>
            <Header entitiyProperties={entitiyProperties} />
            <div className="card-body pb-8">
                {entitiyProperties?.props?.type == "IfcLightFixture" && <ControlLight guid={guid} />}
                {entitiyProperties?.props?.GlobalId == "02a5zYLwD3j9mC$YV6woIu" && <ControlAnimation />}
                <Attributes guid={guid} />
            </div>
        </>
    );
};
//------------------------------------------------------------------------------
IfcPropertyPanel.displayName = "IfcPropertyPanel";
