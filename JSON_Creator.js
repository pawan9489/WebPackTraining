import { join } from 'path'
import fs from 'fs'
import readline from 'readline'

const tag_regex = /^(\s*)@(.*)$/
const feature_regex = /^(\s*)Feature:(.*)$/
const scenario_regex = /^(\s*)(Scenario:|Scenario Outline:)(.*)$/

const folder_to_start = 'features'
const features_folder = './features'
const json = {
    [folder_to_start]: {
        type: 'folder',
        contents: {}
    }
};

function rreaddirSync (dir, allFiles = []) {
    return new Promise((resolve,reject) => {
        const files = fs.readdirSync(dir).map(f => join(dir, f))
        allFiles.push(...files)
        files.forEach(f => {
            fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles)
        })
        resolve(allFiles)
    })
}

async function put_data_in_json(main,f,file_or_folder) {
    return new Promise(async (resolve, reject) => {
        let path_array = f.split('\\')
        let current_folder_or_file = path_array[path_array.length - 1]
        let index_of_main = path_array.indexOf(main)
        let parent_folders = path_array.slice(index_of_main + 1,path_array.length - 1)
        try {
            let temp = json[main].contents
            for(let i = 0; i < parent_folders.length; i++) {
                temp = temp[parent_folders[i]].contents
            }
            if (file_or_folder === 'folder') {
                temp[current_folder_or_file] = {
                        type: 'folder',
                        path: f,
                        contents: {}
                }
            } else if (file_or_folder === 'file') { // file
                await lineiterator(temp,current_folder_or_file,f)
                resolve()
            }
        } catch(err){
            console.log(f)
            console.log(err)
            return;
        }
    })
}

function lineiterator(temp,current_folder_or_file,f) {
    let tag_taken_by_scenario = false; // tag tracker for scenario
    let scenario_tag = '';
    let obj = {
        feature_tag: '',
        feature_desc: '',
        uncommented_scenarios: []
    };
    let rd = readline.createInterface({
        input: fs.createReadStream(f),
        output: process.stdout,
        console: false,
        terminal: false
    });
    return new Promise(function(resolve, reject) {
        rd.on('line', function (line){
            let temp_scenario = {
                'tag': '',
                'desc': ''
            };
            // First Checking out Tags
            if(tag_regex.test(line)){
                if(obj.feature_tag === '') {
                    obj.feature_tag = line.trim();
                } else { // Tag belongs to Scenario
                    scenario_tag = line.trim();
                    tag_taken_by_scenario = false;
                }
            }

            // Checking the Feature Description
            if(feature_regex.test(line)){
                obj.feature_desc = line.split(':')[1].trim();
            }

            // Checking the Scenarios
            if(scenario_regex.test(line)){
                if(!tag_taken_by_scenario){
                    temp_scenario['tag'] = scenario_tag;
                    tag_taken_by_scenario = true;
                }
                temp_scenario['desc'] = line.split(':')[1].trim();
                obj.uncommented_scenarios.push(temp_scenario);
            }
        })
        rd.on('close', function () {
            // temp[current_folder_or_file] = {
            //     type: 'file',
            //     path: f.toString(),
            //     feature: obj
            // }
            resolve(obj);
        })
    }).then( obj => {
        temp[current_folder_or_file] = {
            type: 'file',
            path: f,
            feature: obj
        }
    })
}

function readFilesFolders (arr) {
    return new Promise((resolve,reject) => {
        arr.forEach(async f => {
            if(fs.statSync(f).isDirectory()){ 
                await put_data_in_json(folder_to_start,f,'folder')
            } else { // Feature -> File
                await put_data_in_json(folder_to_start,f,'file')
            }
            if (f === arr[arr.length - 1]) {
                console.log('LAST FILE -> ' + f)
                resolve()
            }
        })
    })
}

(async function() {
    try {
        let allFiles = await rreaddirSync(features_folder,[])
        await readFilesFolders(allFiles)
        fs.writeFileSync('result.json',JSON.stringify(json,null,2), () => console.log('JSON Saved'));
        // console.log(JSON.stringify(json,null,2))
    } catch(err) {
        console.log(err)
    }
})()
