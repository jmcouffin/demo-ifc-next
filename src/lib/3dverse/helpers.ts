import IFC_DATA from "../../../public/data/json/ifcData.json";
import ifctype2guids from "../../../public/data/json/ifctype2guids.json";
import ENERGY_DATA from "../../../public/data/json/energyData.json";
import { guid2euid, euid2guid } from "../id-converter";
import { EnergyData, IfcData, ChartInput, CanvasEvent, Attribute, BasePoint } from "@/types/ifc";
import * as THREE from "three";
import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

import chroma from "chroma-js";
import { Entity } from "@/types/3dverse";

const ifcData = IFC_DATA as IfcData;
const ifcTypes = ifctype2guids;
const roomEnergyData = ENERGY_DATA as EnergyData;

const TRAVEL_TIME = 1;

function getValueColor(value: number) {
    const scale = chroma.scale(["green", "yellow", "red"]).domain([0, 600]);
    return scale(value).rgb();
}

export function createChartInputs() {
    let labels: string[] = [];
    let data = [];
    let colors = [];

    for (const s in ENERGY_DATA) {
        const spaceName = ifcData[s].props.LongName
            ? `${ifcData[s].props.LongName} - ${ifcData[s].props.Name}`
            : ifcData[s].props.Name;
        if (typeof spaceName == "string") {
            labels.push(spaceName);
            data.push(roomEnergyData[s]);
            colors.push(getValueColor(roomEnergyData[s]));
        }
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

export function createChart({ data, labels, colors }: ChartInput) {
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
        indexAxis: "y" as const,
        responsive: true,
        tooltips: {
            mode: "y" as const,
        },
    };

    return { chart_data: chartData, chart_options: chartOptions };
}

export async function toggleEnergyView(activate: boolean) {
    const originalColor = [0, 0.5686274509803921, 0.788235294117647];

    const matIds = {
        "d1cccba6-1dc8-43e7-b9f5-380b838b533b": { originalColor: originalColor, energyColor: [0, 1, 0] },
        "6d0cec57-748b-4906-9ddc-d83d221ede40": { originalColor: originalColor, energyColor: [1, 0.5, 0] },
        "7f72e7bd-055e-43af-9b93-8140ec5b69a8": { originalColor: originalColor, energyColor: [1, 0, 0] },
    };

    const originalMat = {
        dataJson: {
            albedo: [0, 0.5686274509803921, 0.788235294117647],
            metallic: 1,
            opacity: 0,
            roughness: 0.7,
        },
        isDoubleSided: true,
        name: "Interior Fill",
        shaderRef: "6d7d6861-0938-41db-9fc2-187e09504c96",
        skinnedShaderRef: "baa040d3-4e11-4bbf-b932-5c7782d2dcc4",
        uuid: "18803c48-b14f-4fc2-b0ce-ed72b2776c77",
        version: 1,
    };

    for (const [matUUID, colors] of Object.entries(matIds)) {
        const newMatDesc = originalMat;
        newMatDesc.uuid = matUUID;
        if (activate) {
            newMatDesc.dataJson.albedo = colors.energyColor;
            newMatDesc.dataJson.opacity = 0.7;
        } else {
            newMatDesc.dataJson.albedo = colors.originalColor;
        }

        SDK3DVerse.engineAPI.ftlAPI.updateMaterial(matUUID, newMatDesc);
    }
}

async function processPickedEntity(
    position: { x: number; y: number },
    guidSetter: (guid: string) => void,
    energyVisible: boolean,
  ) {
    const target = await SDK3DVerse.engineAPI.castScreenSpaceRay(position.x, position.y);
  
    if (!target.pickedPosition) {
      SDK3DVerse.engineAPI.unselectAllEntities();
      guidSetter("");
      return;
    }
  
    const entity = target.entity;
  
    if (!("tags" in entity.components)) {
      return;
    }
  
    if (entity.components.tags.value[0] === "IfcSpace" && !energyVisible) {
      entity.setVisibility(false);
      await processPickedEntity(position, guidSetter, energyVisible);
      entity.setVisibility(true);
    } else {
      entity.select();
    const guid = euid2guid(entity.getParent().getEUID());
      if (guid in ifcData) {
        guidSetter(guid);
      }
  
      // **Camera Movement Integration Starts Here**
  
      // Get the entity's global Axis-Aligned Bounding Box (AABB)
      const globalAABB = entity.getGlobalAABB();
      const globalAABBCenter = globalAABB.center;
      const globalAABBMin = globalAABB.min;
  
      // Access the active viewport
      const viewport = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0];
      const offset = 0.5; // Adjust the offset as needed
  
      // Move the camera to a position offset from the entity
      await viewport.travel(
        [globalAABBMin[0] - offset, globalAABBCenter[1], globalAABBCenter[2]],
        [0, 0, 0, 1],
        10 // Duration in seconds; adjust as needed
      );
  
      // Make the camera look at the center of the entity
      viewport.lookAt(globalAABBCenter);
    }
  }

export async function handleCanvasSelection(
    event: CanvasEvent,
    guidSetter: (guid: string) => void,
    energyVisible: boolean,
) {
    processPickedEntity({ x: event.clientX, y: event.clientY }, guidSetter, energyVisible);
}

export function unselectEntities(event: React.KeyboardEvent<HTMLElement>, guidSetter: (guid: string) => void) {
    if (event.key === "Escape") {
        SDK3DVerse.engineAPI.unselectAllEntities();
        guidSetter("");
    }
}

export function getInitialPoint() {
    const cameraTransform = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getCamera().getGlobalTransform();
    return { position: cameraTransform.position, orientation: cameraTransform.orientation };
}

export function handleReset(basePoint: BasePoint) {
    SDK3DVerse.engineAPI.cameraAPI.travel(basePoint.position, basePoint.orientation, [-2.8170461654663086, 6.087423324584961, -3.1617369651794434]);
}

export function handleCameraSwitchChange(cameraState: boolean, cameraSetter: (cameraState: boolean) => void) {
    if (!cameraState) {
        SDK3DVerse.engineAPI.cameraAPI.setControllerType(
            SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getId(),
            SDK3DVerse.cameraControllerType.editor,
        );
    } else {
        SDK3DVerse.engineAPI.cameraAPI.setControllerType(
            SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getId(),
            SDK3DVerse.cameraControllerType.orbit,
        );
    }

    cameraSetter(!cameraState);
}

export function handleEdgeSwitchChange(edgeState: boolean, edgeSetter: (edgeState: boolean) => void) {
    const cam = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getCamera();
    const camComponent = cam.getComponent("camera");

    if (!edgeState) {
        const newCamComponent = {
            ...camComponent,
            dataJSON: {
                ...camComponent.dataJSON,
                edgeOutlines: true,
            },
        };
        cam.setComponent("camera", newCamComponent);
    } else {
        // Untoggle to hide the edges.
        const newCamComponent = {
            ...camComponent,
            dataJSON: {
                ...camComponent.dataJSON,
                edgeOutlines: false,
            },
        };
        cam.setComponent("camera", newCamComponent);
    }
    edgeSetter(!edgeState);
}

function computeDistance(u: number[], v: number[]) {
    var dx = u[0] - v[0];
    var dy = u[1] - v[1];
    var dz = u[2] - v[2];

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export async function goToRoom(roomUUID: string | undefined) {
    if (roomUUID) {
        // Retrieve the IfcSpace entity to travel to from the scene graph.
        const spaceEntity = (await SDK3DVerse.engineAPI.findEntitiesByEUID(roomUUID))[0];
        const activeViewPort = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0];

        const aabbCenterGlobal = spaceEntity.getGlobalAABB().center;
        const currentCameraPosition = SDK3DVerse.engineAPI.cameraAPI
            .getActiveViewports()[0]
            .getCamera()
            .getGlobalTransform().position;

        const orientation = SDK3DVerse.engineAPI.cameraAPI
            .getActiveViewports()[0]
            .getCamera()
            .getGlobalTransform().orientation;

        const speed = computeDistance(currentCameraPosition, aabbCenterGlobal) / TRAVEL_TIME;

        SDK3DVerse.engineAPI.cameraAPI.travel(aabbCenterGlobal, orientation)

        SDK3DVerse.updateControllerSetting({
            lookAtPoint: [aabbCenterGlobal[0] + 0.2, aabbCenterGlobal[1] + 0.2, aabbCenterGlobal[2] + 0.2],
        });
    }
}

export async function getEntityFromGuid(guid: string) {
    return (await SDK3DVerse.engineAPI.findEntitiesByEUID(guid2euid(guid)))[0];
}

export function getSurface(areaData: Attribute) {
    return typeof areaData === "number" ? areaData.toFixed(2) : "-";
}

export async function updateLightIntensity(
    value: number,
    spotLightEntity: Entity | undefined,
    setIntensity: (value: number) => void,
) {
    // spotLightEntity
    if (spotLightEntity) {
        const spotlightComponent = spotLightEntity.getComponent("point_light");
        const newComponent = {
            ...spotlightComponent,
            intensity: value,
        };
        setIntensity(value);
        spotLightEntity.setComponent("point_light", newComponent);
    }
}

function componentToHex(c: number) {
    var hex = (c * 255).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(rgb: number[]) {
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

export async function updateColor(
    value: string,
    spotLightEntity: Entity | undefined,
    setColor: (col: number[]) => void,
) {
    const colorValHex = value;
    const red = parseInt(colorValHex.substring(1, 3), 16);
    const green = parseInt(colorValHex.substring(3, 5), 16);
    const blue = parseInt(colorValHex.substring(5, 7), 16);

    const rgb = [red / 255, green / 255, blue / 255];
    if (spotLightEntity) {
        const spotlightComponent = spotLightEntity.getComponent("point_light");
        setColor(rgb);
        const newComponent = {
            ...spotlightComponent,
            color: rgb,
        };
        spotLightEntity.setComponent("point_light", newComponent);
    }
}

export function toToggle(components: string[]) {
    return !("camera" in components) && !("point_light" in components) && !("label" in components);
}

async function setAnimSeqControllerPlayState(playState: number) {
    const animSeqControllerEntity = (await SDK3DVerse.engineAPI.findEntitiesByEUID("4a621b5b-2ecb-45ff-9748-a708b6188342"))[0];
    const sequenceControlerComponent = animSeqControllerEntity.getComponent("animation_sequence_controller");

    const newSequenceControlerComponent = {
        ...sequenceControlerComponent,
        playState: playState,
    };

    animSeqControllerEntity.setComponent("animation_sequence_controller", newSequenceControlerComponent);

}

export async function runAnimation(uuid: string) {
    setAnimSeqControllerPlayState(1);
}

export async function pauseAnimation(uuid: string) {
    setAnimSeqControllerPlayState(2);
}

export async function stopAnimation(uuid: string) {
    setAnimSeqControllerPlayState(0);
}

export async function showClientAvatars() {
    const clientDisplayEX = await SDK3DVerse.installExtension(SDK3DVerse_ClientDisplay_Ext);
    const clientAvatarContent = await fetch("../../../images/client-avatar.svg").then((res) => res.text());
    clientDisplayEX.showClientAvatars({
        // depending on the size of your scene you might want to adjust the radius
        radius: 80,
        /** @param {{ color: string }} params */
        getClientAvatarSrc({ color }: { color: string }) {
            const svgContent = clientAvatarContent.replace(/FG_COLOR/g, color).replace(/BG_COLOR/g, "#ffffff");
            const url = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
            return url;
        },
        /** @param {{ clientUUID: string }} params */
        getClientDisplayName({ clientUUID }: { clientUUID: string }) {
            // Convert the UUID to something that looks sort of like a word
            const name = [...clientUUID]
                .filter((s) => /[a-zA-Z]/.test(s))
                .slice(0, 5)
                .join("");
            const nameCapitalized = `${name[0].toUpperCase()}${name.slice(1)}`;
            return `User ${nameCapitalized}`;
        },
    });
}

export class CameraController_ {
    canvasElement: HTMLElement;
    cameraControls: CameraControls;
    viewport: any;
    isOn: boolean

    constructor(canvasElement: HTMLElement) {
        this.canvasElement = canvasElement;
        // create THREE camera
        this.viewport = SDK3DVerse.engineAPI.cameraAPI.getViewports()[0];
        const { fovy, aspectRatio, nearPlane, farPlane } = this.viewport.getProjection();
        const camera = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane || 100000);
        this.cameraControls = new CameraControls(camera, this.canvasElement);
        this.isOn = false;
    }

    onCameraUpdate = () => {
        const cameraPosition = this.cameraControls.camera.position.toArray();
        const cameraOrientation = new THREE.Quaternion();
        this.cameraControls.camera.getWorldQuaternion(cameraOrientation);
        const cameraOrientationArray = cameraOrientation.toArray();

        this.viewport.setLocalTransform({
            position: cameraPosition,
            orientation: cameraOrientationArray,
        });
    };

    async activateThreeJsController() {
        this.viewport.setControllerType(SDK3DVerse.cameraControllerType.none);
        const clock = new THREE.Clock();

        const cameraTransform: {
            position: [number, number, number];
            orientation: [number, number, number, number];
        } = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getCamera().getGlobalTransform();

        this.cameraControls.enabled = true;

        const target = new THREE.Object3D();
        target.rotation.setFromQuaternion(new THREE.Quaternion(...cameraTransform.orientation));
        target.translateOnAxis(new THREE.Vector3(0, 0, -1), 0.01);

        this.cameraControls.setLookAt(...cameraTransform.position, ...target.position.toArray());

        // listen to camera update events
        this.cameraControls.addEventListener("update", this.onCameraUpdate);
        this.cameraControls.dollySpeed = 0.5;

        const anim = () => {
            const delta = clock.getDelta();
            this.cameraControls.update(delta);
            requestAnimationFrame(anim);
        };
        anim();
    }

    deactivateThreeJsController() {
        this.cameraControls.enabled = false;
        this.cameraControls.removeEventListener("update", this.onCameraUpdate);
        this.viewport.setControllerType(SDK3DVerse.cameraControllerType.editor);
    }
}

//--------------------------------------------------------------------------
export const SPOTLIGHT_EUID = "cd0609bb-6366-4640-867f-e753e2cd64b1";
export const DOOR_GUID = "1PDnLIM013wvkZO9Lb4$i6";
export const DOOR_EUID = guid2euid(DOOR_GUID);
export const LAMP_POS = {
    "position": [
        -1.74158,
        1.632169,
        -0.204084
    ],
    "orientation": [
        -0.1,
        0.2,
        0.02,
        1
    ],
    "scale": [
        1,
        1,
        1
    ]
};

export const DOOR_POS = {
    "position": [
        11.5,
        5,
        -10
    ], // viewer position from the door
    "orientation": [
        0,
        1,
        0,
        0
    ], // second value is 1 for 180 degree rotation of the camera
    "scale": [
        1,
        1,
        1
    ]
};

export const LAMP_COORDS = [-2.446315,1.850855,0.015018]; // exact lamp location
export const DOOR_COORDS = [10.82,2.9999,-2.89]; // exact door location

//--------------------------------------------------------------------------
export const getSpotlightEntity = async () => {
    const [spotlightEntity] = await SDK3DVerse.engineAPI.findEntitiesByEUID(SPOTLIGHT_EUID);
    return spotlightEntity;
};

//--------------------------------------------------------------------------
export const travelToEntity = async (entityUUID: string) => {
    const [entity] = await SDK3DVerse.engineAPI.findEntitiesByEUID(entityUUID);
    const [viewport] = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports();
    const speed = 15;
    SDK3DVerse.engineAPI.cameraAPI.stopTravel();

    // SDK3DVerse.engineAPI.cameraAPI.travel(
    //     viewport,
    //     entity.getGlobalTransform().position,
    //     entity.getGlobalTransform().orientation,
    //     speed,
    // );
};
//--------------------------------------------------------------------------
export const focusOnEntity = async (entityUUID: string) => {
    const [entity] = await SDK3DVerse.engineAPI.findEntitiesByEUID(entityUUID);
    const [viewport] = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports();
    entity.focusOn(viewport, { speedFactor: 3 });
};
