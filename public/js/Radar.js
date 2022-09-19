import {CONFIG} from "./main.js"

const FORMATS = ["json", "xml", "csv", "geojson"]

function checkFormat(format) {
    // Ensures the provided format is available
    if (!FORMATS.includes(format.toLowerCase())) throw Error(`Must use one of these file formats ${FORMATS}`)
}
async function ajax(endpoint, format, version) {
    if (!version) version = 2
    if (!format) format = "json"
    let url = CONFIG.DOMAIN + endpoint
    format = format.toLowerCase()
    checkFormat(format)
    // Version 2 only seems to support JSON so far
    if (format != "json") version = 1
    // URI encode the URL
    let _accept = `application/${format}${version == 2 ? ";version=2" : ""}`
    // Handle different accept headers
    if (endpoint.indexOf("/basins") >= 0) _accept = `application/vnd.named+pg+json`
    return fetch(url, 
        {
            "headers": { "accept": _accept}
    })
    .then(res=> {
        if (!res.ok) return {"msg": res.text(), "status": res.status}
        // Version 1 has problems with proper json - return text if it's version 1
        if (format == "json" && version == 2) return res.json()
        else return res.text()
    }).catch(err => {
        console.error(err)
        return {"err": err, "url": url}
    })
}

class Locations {
    constructor() {
        console.log(CONFIG.OFFICE)
        this.office = CONFIG?.OFFICE
    }
    setOffice(office) {
        this.office = office
    }
    get(location_id=null, office=this.office, unit=null, datum=null, names=null, format=null) {
        let _url = `/locations`
        if (location_id) {
            _url += `/${location_id}?office=${office}`
            return ajax(_url, format)
        } else {
            _url += `?office=${office}`
            if (names) _url += `&names=${names}`
            if (datum) _url += `&datum=${datum}`
        }
        if (unit) _url += `&unit=${unit}`
        return ajax(_url, format)
    }
    async catalog(page, page_size,
        unit_system, office, like,
        timeseries_category_like, timeseries_group_like,
        location_category_like, location_group_like) {
        // Gets a catalog of available timeseries
        return await Catalog.get("locations", page, page_size,
            unit_system, office, like,
            timeseries_category_like, timeseries_group_like,
            location_category_like, location_group_like)
    }
    delete() {}
    patch() {}
    post() {}

    list() { return ajax(`/locations?office=${this.office}`, "json", 1) }

    groups(group_id=null, include_assigned=null, category_id=null, format=null, office=this.office) {
        let _url = `location/group?office=${office}`
        if (!(group_id && office && category_id)) { 
            // Returns CWMS Location Groups Data - Requires version 1
            if (include_assigned) _url += `&include-assigned=${include_assigned}`
            return ajax(`/${_url}`, format, 1)
        } return ajax(`/${_url}/${group_id}&category-id=${category_id}`)
        // Retrieves requested Location Group
        // If no group given, Returns CWMS Location Groups Data

    }

}


class Offices {
    constructor() {
        this.office = CONFIG?.OFFICE
    }

    get(office=null, format=null) {
        // Return all offices
        if (!office) return ajax(`/offices/`)
        // Return info about a specific office
        return ajax(`/offices/${office}`, format)
    }
}

class Units {
    constructor(format=null) {
        this.format = format
        this.office = CONFIG?.OFFICE
    }

    get length() {
        this.ALL.length
    }
    async list() {
        if (!this.ALL) await this.load()
        return this.ALL
    }
    get(format) {
        if (!format) format = this.format
        let _url = "/units"
        return ajax(_url, format)
    }

    async load(format=null) {
        // Loads ALL units into this OBJECT for reuse later
        this.format = format
        this.ALL = await this.get(format)
    }
}

class Parameters {
    constructor(format=null) {
        this.format = format
        this.office = CONFIG?.OFFICE
    }

    get(format) {
        if (!format) format = this.format
        let _url = "/parameters"
        return ajax(_url, format)
    }
    async list() {
        if (!this.ALL) await this.load()
        return this.ALL
    }

    async load(format = null) {
        // Loads ALL Parameters into this OBJECT for reuse later
        this.format = format
        this.ALL = await this.get(format)
        return this.ALL
    }
}

class TimeZones {
    constructor(format = null) {
        this.format = format
        this.office = CONFIG?.OFFICE
    }

    get length() {
        this.ALL.length
    }
    async list() {
        if (!this.ALL) await this.load()
        return this.ALL
    }
    get(format) {
        if (!format) format = this.format
        let _url = "/timezones"
        return ajax(_url, format, 1)
    }

    async load(format = null) {
        // Loads ALL TimeZones into this OBJECT for reuse later
        this.format = format
        this.ALL = await this.get(format)
    }
}


class Levels {
    constructor() {
        this.office = CONFIG?.OFFICE
        this.last_query = null
        this.level_names = null
    }

    get getLastQuery() {
        return this?.last_query
    }
    get getLastData() {
        return this?.last_query?.data
    }
    get getLastParams() {
        return this?.last_query?.params
    }
    get getLevelNames() {
        // Reads the previous get() call's data and returns a list of the level names returned
        // Use the previously computed array
        if (this.level_names) return this.level_names
        const DATA = this.getLastData["location-levels"]["location-levels"]
        let level_names = []
        console.log('data', DATA)
        for (let index = 0; index < DATA.length; index++) {
            const level = DATA[index];
            level_names.push(level.name)
        }
        this.level_names = level_names
        return level_names
    }

    async get(name=null, office=null, unit=null, datum=null, begin=null, end=null, timezone=null, format=null, version=null) {
        let _url = "/levels?"
        // Build the URL
        if (name)     _url += `name=${name}&`
        if (office)   _url += `office=${office}&`
        if (unit)     _url += `unit=${unit}&`
        if (datum)    _url += `datum=${datum}&`
        if (begin)    _url += `begin=${begin}&`
        if (end)      _url += `end=${end}&`
        if (timezone) _url += `timezone=${timezone}&`
        if (format)   _url += `format=${format}&`
        // Remove the last &
        this.query = _url.substring(0, _url.length - 1)
        let levels = await ajax(this.query, format, version)
        this.last_query = {"params": 
                            { "name": name, "office": office, "unit": unit, 
                              "datum": datum, "begin": begin, "end": end, 
                              "timezone": timezone, "format": format, "version": version, 
                              "query": this.query
                            }, 
                            "data": levels}
        return levels
    }
}

class TimeSeries {
    constructor() {
        this.office = CONFIG?.OFFICE
        this.last_query = {}
        
    }

    async groups(office=null, group_id=null, category_id=null) {
        //  Office_id : Specifies the owning office of the timeseries group(s) whose data is to be included in the response. 
        //  If this field is not specified, matching timeseries groups information from all offices shall be returned.
        let _url = "/timeseries/group?"
        this.last_query.endpoint = _url
        // Returns CWMS Timeseries Groups Data
        if (office) _url += `office=${office}&`
        if (!group_id) return ajax(_url.substring(0, _url.length - 1), null, 1)
        _url += `group-id=${group_id}&`
        if (category_id) _url += `category-id=${category_id}&`
        // Remove the last & or ? if nothing
        this.query = _url.substring(0, _url.length - 1)
        let groups = await ajax(this.query, null, 1)
        this.last_query = {
            "params":
            {
                "office": office, "group_id": group_id, 
                "category_id": category_id, "query": this.query
            },
            "data": groups
        }
        return groups
    }

    async get(name, office=null, unit=null, 
              datum=null, begin=null, end=null, 
              timezone=null, format=null, page=null, 
              page_size=null, version=2) {
        // [name] Specifies the name(s) of the time series whose data is to be included in the response. A case insensitive comparison is used to match names.
        // [office] Specifies the owning office of the time series(s) whose data is to be included in the response. If this field is not specified, matching location level information from all offices shall be returned.
        // [unit] Specifies the unit or unit system of the response. Valid values for the unit field are:
            // EN. (default) Specifies English unit system. Location level values will be in the default English units for their parameters.
            // SI. Specifies the SI unit system. Location level values will be in the default SI units for their parameters.
            // Other. Any unit returned in the response to the units URI request that is appropriate for the requested parameters.
        // [datum] Specifies the elevation datum of the response. This field affects only elevation location levels. Valid values for this field are:
            // NAVD88. The elevation values will in the specified or default units above the NAVD-88 datum.
            // NGVD29. The elevation values will be in the specified or default units above the NGVD-29 datum.
        // [begin] Specifies the start of the time window for data to be included in the response. If this field is not specified, any required time window begins 24 hours prior to the specified or default end time. The format for this field is ISO 8601 extended, with optional offset and timezone
        // [end] Specifies the end of the time window for data to be included in the response. If this field is not specified, any required time window ends at the current time. The format for this field is ISO 8601 extended, with optional timezone
        // [timezone] Specifies the time zone of the values of the begin and end fields (unless otherwise specified), as well as the time zone of any times in the response. If this field is not specified, the default time zone of UTC shall be used. Ignored if begin was specified with offset and timezone.
        // [format] Specifies the encoding format of the response. Valid values for the format field for this URI are:
            // tab
            // csv
            // xml
            // wml2(only if name field is specified)
            // json(default)
        // [page] This end point can return a lot of data, this identifies where in the request you are. This is an opaque value, and can be obtained from the 'next-page' value in the response.
        // [page-size] How many entries per page returned. Default 500.
        if (!name) throw Error(`Timeseries Name is required! Params are:
            {
              name, office=null, unit=null, 
              datum=null, begin=null, end=null, 
              timezone=null, format=null, page=null, 
              page_size=null, version=2
            }`)
        let _url = `/timeseries?name=${encodeURIComponent(name)}&`
        if (page_size) _url += `page_size=${page_size}&`
        if (timezone)  _url += `timezone=${timezone}&`
        if (office)    _url += `office=${office}&`
        if (format)    _url += `format=${format}&`
        if (datum)     _url += `datum=${datum}&`
        if (begin)     _url += `begin=${begin}&`
        if (page)      _url += `page=${page}&`
        if (unit)      _url += `unit=${unit}&`
        if (end)       _url += `end=${end}&`
        return await ajax(_url, null, version)
    }

    async catalog(page, page_size,
        unit_system, office, like,
        timeseries_category_like, timeseries_group_like,
        location_category_like, location_group_like) {
        // Gets a catalog of available timeseries
        return await Catalog.get("timeseries", page, page_size, 
                    unit_system, office, like, 
                    timeseries_category_like, timeseries_group_like, 
                    location_category_like, location_group_like)
    }

    async post() {}
    async delete() {}
    async patch() {}
}

class Catalog {
    constructor() {

    }
    static async get(type = null, page = null, page_size = null,
        unit_system = null, office = null, like = null,
        timeseries_category_like = null, timeseries_group_like = null,
        location_category_like = null, location_group_like = null, 
        format=null, version=null) {
        if (!type && typeof type == "string") throw Error("Must specify a Catalog type string (Timeseries/Locations)")
        let _url = `/catalog/${type.toLowerCase()}?`
        if (page) _url += `page=${page}&`
        if (page_size) _url += `page-size=${page_size}&`
        if (unit_system) _url += `unit-system=${unit_system}&`
        if (office) _url += `office=${office}&`
        if (like) _url += `like=${encodeURIComponent(like)}&`
        if (timeseries_category_like) _url += `timeseries-category-like=${timeseries_category_like}&`
        if (timeseries_group_like) _url += `timeseries-group-like=${timeseries_group_like}&`
        if (location_category_like) _url += `location-category-like=${location_category_like}&`
        if (location_group_like) _url += `location-group-like=${location_group_like}&`
        _url = _url.substring(0, _url.length - 1)
        return await ajax(_url, format, version)
    }
}


class Ratings {
    constructor() {
        this.office = CONFIG?.OFFICE
    }
    async get(rating = null, office = null, name = null,
        unit = null, datum = null, at = null,
        end = null, timezone = null, format = null) {
        // wrap the rating call to get to match other functions 
        return await this.rating(rating, office, name, unit, datum, at, end, timezone, format)
    }
    async template(template_id=null, office=null, template_id_mask=null, page=null, page_size=null) {
        let _url = `/ratings/template`
        // Get cwmsData ratings template spec with templateId
        if (template_id && office) return await ajax(`/${_url}/${template_id}?office=${office}`)
        let params = ""
        if (office) params += `office=${office}&`
        if (template_id_mask) params += `template-id-mask=${template_id_mask}&`
        if (page) params += `page=${page}&`
        if (page_size) params += `page-size=${page_size}`
        return await ajax(`${_url}?${params}`)
    }
    async spec(rating_id=null, office=null, rating_id_mask=null, page=null, page_size=null) {
        let _url = `/ratings/spec`
        // Get cwmsData ratings spec with ratingId
        if (rating_id && office) return await ajax(`/${_url}/${rating_id}?office=${office}`)
        let params = ""
        if (office) params += `office=${office}&`
        if (rating_id_mask) params += `rating-id-mask=${rating_id_mask}&`
        if (page) params += `page=${page}&`
        if (page_size) params += `page-size=${page_size}`
        return await ajax(`${_url}?${params}`)
    }
    async rating(rating=null, office=null, name=null, 
                 unit=null, datum=null, at=null, 
                 end=null, timezone=null, format=null) {
        let _url = `/ratings/ratings`
        // Returns CWMS Rating Data
        if (rating && office) return await ajax(`/${_url}/${rating}?office=${office}`)
        let params = ""
        if (office) params += `office=${office}&`
        if (name) params += `name=${encodeURIComponent(name)}&`
        if (unit) params += `unit=${unit}&`
        if (datum) params += `datum=${datum}`
        if (at) params += `at=${at}`
        if (end) params += `end=${end}`
        if (timezone) params += `timezone=${timezone}`
        if (format) params += `format=${format}`
        return await ajax(`${_url}?${params}`)
    }

}

class Basins {
    constructor() {
        this.office = CONFIG?.OFFICE
    }
    async get(basin_id=null, office=null, unit=null) {
        let _url = `/basins`
        let _params = ""
        if (office) _params += `office=${office}&`
        if (unit) _params += `unit=${unit}&`
        if (basin_id) return await ajax(`${_url}/${basin_id}?${_params}`) 
        return await ajax(`${_url}?${_params}`)
        
    }
}

class Pools {
    constructor() {
        this.office = CONFIG?.OFFICE
    }
    async get(pool_id=null, office=null, project_id=null, 
        bottom_mask=null, top_mask=null, include_explicit=null, include_implicit=null) {
        let _url = `/pools`
        let _params = ""
        if (office) _params += `office=${office}&`

        if (pool_id && office && project_id) return await ajax(`${_url}/${pool_id}?project-id=${project_id}&${_params}`) 
        return await ajax(`${_url}?${_params}`)
        
    }
}

export {Locations, Offices, Units, 
    Parameters, TimeZones, Levels, 
    TimeSeries, Ratings, Basins, 
    Pools}