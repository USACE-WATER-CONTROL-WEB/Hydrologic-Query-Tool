// Handles Device Local Storage
const deviceStorage = window.localStorage;

function saveStorage(key, data) {
    // Store json string of a given key
    deviceStorage.setItem(key, JSON.stringify(data));
    // Store the date for data storage life
    if (data && data.updated) setLastUpdatedStorage(key, data.updated);
    return data
}

function loadStorage(key, defaultVal) {
    // Pull item from storage of a given key as an Object
    const data = JSON.parse(deviceStorage.getItem(key));
    if (data) console.log("Loaded", key, "from Local Storage");
    else return defaultVal;
    return data;
}

function deleteStorage(key) {
    // delete single item from storage of a given key
    deviceStorage.removeItem(key);
}

function clearStorage() {
    // Remove all key:value from storage
    deviceStorage.clear();
}

function getUsedSpaceStorage(key) {
    // Return total for all keys if no key given
    if (!key) {
        let total_stor_len = JSON.stringify(deviceStorage).length
        if (total_stor_len < 1024) return total_stor_len + " bytes"
        return Math.round(total_stor_len / 1024) + " kb";
    } else {
        // Load all data for this key
        let data = loadStorage(key);
        // Set size to zero if it does not exist
        if (!data) data = 0;
        let data_len = JSON.stringify(data).length
        if (data_len < 1024) return data_len + " bytes"
        // Return the total size used by this key in kb
        return Math.round(data_len / 1024) + " kb";
    }
}

console.log("Total Used Local Storage: ", getUsedSpaceStorage());

export {getUsedSpaceStorage, clearStorage, loadStorage, saveStorage, deleteStorage, deviceStorage}