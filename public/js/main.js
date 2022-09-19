import {$} from "./utils/helper.js"
import * as Storage from "./utils/Storage.js"
import * as RADAR from "./Radar.js"
import Config from "./config.js"


const CONFIG = await Config.create("/public/configs/SWT.config.json")
$("body").innerText = "Running tests... View the console/network tab"
console.log(CONFIG)
console.log(Storage.deviceStorage)

let Loc = new RADAR.Locations()
// This below seems busted /catalog/locations is not returning in time (504) as of 09/18/22
//console.log(await Loc.catalog(null, 50, null, CONFIG.OFFICE, "KEYS*"))
console.log(await Loc.get("ALAT2"))
console.log(await Loc.get(null, CONFIG.OFFICE, null, null, "KEYS"))
console.log(await Loc.groups())
console.log(await Loc.list())

let Office = new RADAR.Offices()
console.log(await Office.get("SWT"))
console.log(await Office.get())

let UNITS = new RADAR.Units()
console.log(await UNITS.get())

let PARAMETERS = new RADAR.Parameters()
console.log(await PARAMETERS.get(), await PARAMETERS.list())

let TZ = new RADAR.TimeZones()
console.log(await TZ.get(), await TZ.list())

let Levels = new RADAR.Levels()
console.log(await Levels.get("KEYS*", CONFIG.OFFICE))
console.log("last query", Levels.getLastQuery)
console.log("levels", Levels.getLevelNames)

let Timeseries = new RADAR.TimeSeries()
console.log(await Timeseries.catalog(null, null, null, "SWT", "KEYS*"))
console.log(await Timeseries.get("KEYS.%-Conservation Pool Full.Inst.1Hour.0.Ccp-Rev", CONFIG.OFFICE))

let Basins = new RADAR.Basins()
console.log(await Basins.get(null, CONFIG.OFFICE))
console.log(await Timeseries.groups())
console.log(await Timeseries.groups(CONFIG.OFFICE, null, null))

export {CONFIG}