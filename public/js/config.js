// Parses a given config file

class Config {
    constructor(file_name) {
        this.config_file = file_name
        this.config = {}
    }
    open(file_name) {
        if (!file_name) file_name = this.config_file
        if (!file_name.includes("json")) {
            alert("Invalid File, must be a JSON file. (.json)")
            return {}
        }
        return fetch(this.config_file)
            .then(res.json())
            .then(data=> {
                this.config = data
                return data
            })
            .catch((err)=> {
                console.error(err)
                alert(`Unable to load Config ${this.config}`)
                return 
            })

    }
}