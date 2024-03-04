import { publicToken, mainSceneUUID } from "../utils/config.js";
import ifcInfo from "../../public/data/json/ifcInfo.json";
import ifcTypes from "../../public/data/json/ifctype2guids.json";
import energyData from "../../public/data/json/energyData.json";
import { guid2euid, euid2guid } from "../utils/idsConverter";

import chroma from "chroma-js";

const ifcdata = ifcInfo;
const ifctypes = ifcTypes;

function getValueColor(value) {
    const scale = chroma.scale(["green", "yellow", "red"]).domain([0, 600]);
    return scale(value).rgb();
}

export function createChartInputs() {
    let labels = [];
    let data = [];
    let colors = [];

    for (const s in energyData) {
        labels.push(ifcdata[s].props.Name);
        data.push(energyData[s]);
        colors.push(getValueColor(energyData[s]));
    }

    const formattedColors = colors.map((color) => `rgba(${color.join(",")})`);
    const combinedArrays = data.map((value, index) => ({ a: value, b: labels[index], c: formattedColors[index] }));
    combinedArrays.sort((obj1, obj2) => obj2.a - obj1.a);

    data = combinedArrays.map((obj) => obj.a);
    labels = combinedArrays.map((obj) => obj.b);
    colors = combinedArrays.map((obj) => obj.c);

    return {
        data: data,
        labels: labels,
        colors: colors,
    };
}

export function createChart(data, labels, colors) {
    // Chart.js data object
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Energy consumption",
                data: data,
                backgroundColor: colors,
                borderWidth: 1,
            },
        ],
    };

    // Chart.js options object
    const chartOptions = {
        type: "bar",
        indexAxis: "y",
        responsive: true,
        tooltips: {
            mode: "y",
        },
    };

    return { chart_data: chartData, chart_options: chartOptions };
}

export const initApp = async () => {
    await SDK3DVerse.joinOrStartSession({
        userToken: publicToken,
        sceneUUID: mainSceneUUID,

        canvas: document.getElementById("display-canvas"),
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.editor,
        },
    });
    const projectEntity = (await SDK3DVerse.engineAPI.findEntitiesByNames("IfcProject"))[0];
    const projectGlobalCenter = projectEntity.getGlobalAABB().center;

    SDK3DVerse.updateControllerSetting({
        lookAtPoint: [projectGlobalCenter[0], projectGlobalCenter[1], projectGlobalCenter[2]],
    });
};

export async function toggleEnergyView(activate) {
    const rootEntities = await SDK3DVerse.engineAPI.getRootEntities();

    for (const rootEntity of rootEntities) {
        if (
            !("camera" in rootEntity.components) &&
            !("point_light" in rootEntity.components) &&
            !("label" in rootEntity.components)
        ) {
            await rootEntity.setVisibility(activate ? false : true);
        }
    }

    for (const guid of ifctypes["IfcSpace"]) {
        const spaceEntity = (await SDK3DVerse.engineAPI.findEntitiesByEUID(guid2euid(guid)))[0];
        const charge = energyData[guid];
        const spaceEntityChildren = await spaceEntity.getChildren();

        for (const spaceEntityChild of spaceEntityChildren) {
            if ("tags" in spaceEntityChild.components) {
                if (spaceEntityChild.components.tags.value.includes("IfcSpace")) {
                    if (charge) {
                        spaceEntityChild.detachComponent("material_ref");
                        spaceEntityChild.detachComponent("material");
                        spaceEntityChild.attachComponent("material");

                        const color = getValueColor(charge);

                        spaceEntityChild.setComponent("material", {
                            dataJSON: activate
                                ? {
                                      albedo: [color[0] / 255, color[1] / 255, color[2] / 255],
                                      opacity: 0.75,
                                  }
                                : {
                                      albedo: [0, 0.5686274509803921, 0.788235294117647],
                                      opacity: 0.15,
                                      metallic: 0.01,
                                      roughness: 0.99,
                                  },

                            isDoubleSided: true,

                            shaderRef: "6d7d6861-0938-41db-9fc2-187e09504c96",
                        });
                    }
                    await spaceEntityChild.setVisibility(true);
                }
            }
        }
    }
}
