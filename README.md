# Demo IFC - 3D BIM/Digital Twin web application powered by 3dverse.

![Alt text](public/socials/screenshot.png?raw=true)

### Purpose

This repo aims to enable anyone to develop its own 3D BIM/Digital Twin web application supporting the IFC format.\
It's possible to either build on top of this repo or to get inspiration from it.

### Tech stack

The framework used is [Next.js](https://nextjs.org/) and the IFC functions have been developed using [IfcOpenShell](https://ifcopenshell.org/).

***The whole 3D rendering part of the application is handled by [3dverse](https://3dverse.com/), and the tools to manipulate/modify/query your 3D scene are provided by its [SDK](https://docs.3dverse.com/sdk/).***

## Getting started quickly with the default IFC file

### Prerequisites

-   #### Node.js
    https://nodejs.org/en/download/current

To run this repo locally, open your command line and paste:

```
git clone https://github.com/3dverse/demo-ifc-next
cd demo-ifc-next
npm install
npm run dev
```

This should open your browser. If it's not, open your browser and use http://localhost:3000/demo-ifc-next.

## Getting started with your own IFC file(s)

### Clone the repository

```
git clone https://github.com/3dverse/demo-ifc-next
```

### Prerequisites

-   #### ifcopenshell-python
    Make sure your python version is ≥ 3.

```
python -m pip install -r requirements.txt
```

To test if your installation was successfull, run:

```
python -c "import ifcopenshell;print(ifcopenshell.version)"
```

This should output something like `v0.7.0-f0e03c79d`.\
If the output doesn't look like the above, the installation was not successfull. In that case follow the instructions (3 steps) provided [here](https://blenderbim.org/docs-python/ifcopenshell-python/installation.html#pre-built-packages.).

-   #### Node.js
    https://nodejs.org/en/download/current

### 3dverse Console setup

-   Create a 3dverse account at https://console.3dverse.com/
-   Create a Project from the template **Empty** - _Start from scratch_
-   On the left pane select _Asset Browser_ and then from the file explorer you see on the screen, go to the _Public_ folder
-   Once in the public folder, upload your IFC file
    You will see a _Main Scene_ element appears. Click on it and then on the right pane click on the _Asset UUID_ section. This will copy the UUID of your scene which will be of use for the next step.

### Get access to your Project and your scene

To get access to your Project and your scene you need to get a token for all and pass it in your web application config file `config.js`.

#### Scene UUID

If you already copied your Scene UUID you can skip the next instruction. Otherwise:

-   Go to _Asset Browser_ -> _Public_ folder, and click on _Main Scene_. On the right pane, click on the _Asset UUID_ section to copy it
-   Edit this line with the Scene UUID you just copied: `export const mainSceneUUID = %YOUR_MAIN_SCENE_UUID%;`

#### Public token

-   Go to _API Access_ and copy your public token
-   Edit this line with the Scene UUID you just copied: `export const publicToken = %YOUR_PUBLIC_TOKEN%;`

### Preprocess your IFC file

In `public/data/ifc`, delete the default IFC file, place your own IFC file, and run the following commands:

```
cd public/scripts
python preprocess_ifc.py
cd ..
```

### Run the application

```
npm install
npm run dev
```

This should open your browser. If it's not, open your browser and use http://localhost:3000/demo-ifc-next.
