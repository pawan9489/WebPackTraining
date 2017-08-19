import { get } from 'https'
import { join } from 'path'
import mkdirp from 'mkdirp'
import fs from 'fs'

function fetchData(rest_api,projests,repos,action,folder_path,branch,user_name,password) {
    // console.log(rest_api + projests + repos + action + folder_path + branch)
    // console.log(encodeURI(rest_api + projests + repos + action + folder_path + branch))
    let options = {
        host: 'bitbucket.es.ad.adp.com',
        port: 443,
        path: encodeURI(rest_api + projests + repos + action + folder_path + branch),
        // authentication headers
        headers: {
            'Authorization': 'Basic ' + new Buffer(user_name + ':' + password).toString('base64')
        }   
    }
    return new Promise((resolve,reject) => {
        get(options, function(res){
            let body = ""
            res.on('data', function(data) {
                body += data
            })
            res.on('end', function() {
            //here we have the full response, html or json object
                // console.log(body)
                resolve(JSON.parse(body))
            })
            res.on('error', function(e) {
                console.log("Got error: " + e.message)
            })
        })
    }).catch(err => {
        console.log()
        console.log('--------------FetchData Catch--------------')
        console.log(folder_path)
        console.log(err.message)
        console.log()
    })
}

function fetchAll(rest_api,projests,repos,action,folder_path,branch,user_name,password) {
    return new Promise(async (resolve, reject) => {
        let data = await fetchData(rest_api,projests,repos,action,folder_path,branch,user_name,password)
        try {
            // console.log(JSON.stringify(data,null,2))
            data.children.values.forEach(async f => {
                if (f.type === 'FILE'){
                    // get raw file and copy it locally
                    if(f.path.toString.split('.')[1] === 'feature'){ // only consider feature files
                        let new_folder_path = folder_path + '/' + f.path.toString
                        // new_folder_path.replace(/ /g, "%20")
                        let path_to_copy = './downloaded/' + folder_path.split('/lux_framework/')[1]
                        path_to_copy.replace(/ /g, "_")
                        mkdirp(path_to_copy, err => {
                            if(err) console.log('Error While Creating Directory ' + err.message)
                            // else console.log('Path Created ' + path_to_copy)
                        })
                        let file = await fetchData(rest_api,projests,repos,action,new_folder_path,branch,user_name,password)
                        await writeToFile(path_to_copy + '/' + f.path.toString.replace(/ /g,"_"), file)
                    }
                } else { // FOLDER
                    // recursively fetch data
                    let new_folder_path = folder_path + '/' +  f.path.toString
                    // console.log(new_folder_path)
                    // new_folder_path.replace(/ /g, "%20")
                    await fetchAll(rest_api,projests,repos,action,new_folder_path,branch,user_name,password)
                }
                if (f === data.children.values[data.children.values.length - 1]) {
                    resolve()
                }
            })
        } catch(err) {
            console.log('Try Catch Block')
            // console.log(err)
            console.log(err.message)
            console.log(data)
        }
    }).catch(err => {
        console.log()
        console.log('--------------FetchALL Catch--------------')
        console.log(err.message)
        console.log()
    })
}

function writeToFile(filePath,json) {
    return new Promise((resolve,reject) => {      
        for(var i = 0; i < json.size; i++) {
            var temp = json.lines[i].text + "\n";
            fs.appendFileSync(filePath, temp);
            if( i === json.size -1 ) {
                resolve()
            }
        }
    }).catch(err => {
        console.log()
        console.log('--------------writeToFile Catch--------------')
        console.log(err.message)
        console.log()
    })
}

(async function() {
    // console.time('test')
    const user_name = '*********'
    const password = '**********'
    const rest_api = '************'
    const projests = '************'
    const repos = '************'
    let action = '************'
    let folder_path = '************' ///ipuk/work_in_progress/buzzards/Emma
    let branch = '************'
    try {
        await fetchAll(rest_api,projests,repos,action,folder_path,branch,user_name,password)
        // console.timeEnd('test')
    } catch(err) {
        console.log('Main Function Catch ----')
        console.log(err.message)
    }
})()
