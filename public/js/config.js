// Parses a given config file

class Config {
    constructor() {

    }
    
    async initialize() {
        await this.readConfig()
    }

    static async create(file_name) {
        // Config wrapper to initialize with the new config file
        const conf = new Config();
        conf.config_file = file_name
        await conf.initialize(file_name)
        return conf
    }

    get DOMAIN() {
        return this.config?.DOMAIN ? this.config.DOMAIN : "https://cwms-data.usace.army.mil/cwms-data"
    }
    get OFFICE() {
        return this.config?.OFFICE ? this.config.OFFICE : ""
    }
    get lakes() {
        return this.config?.projects?.lakes
    }
    get projects() {
        // projects = lakes in this context
        return this.lakes()
    }

    async readConfig() {
        this.config = await this.openConfig()
    }
    async openConfig() {
        if (!this.config_file) throw Error("You must specify a config file on the create('config file.json') method")
        if (!this.config_file.includes("json")) {
            alert("Invalid File, must be a JSON file. (.json)")
            return {}
        }
        return await fetch(this.config_file)
            .then(res => res.json())
            .then(data=> {
                return data
            })
            .catch((err)=> {
                console.error(err)
                alert(`Unable to load Config ${this.config}`)
                return 
            })

    }
}

export default Config