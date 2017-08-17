const json = {};
var walkSync = function(dir, filelist) {
    return new Promise((finished,error) => {  // 1st Promise
        var path = path || require('path');
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir),
            readline = require('readline');
        let promises = [];
        filelist = filelist || [];
        new Promise((resolve,reject) => {  // 2nd Promise
            files.forEach(function(file) {
                promises.push(
                    new Promise((rs,rj) => { // 3rd -> List of Promises
                        if (fs.statSync(path.join(dir, file)).isDirectory()) {
                            json[file] = {
                                type: 'folder',
                                contents: []
                            };
                            filelist = walkSync(path.join(dir, file), filelist);
                        }
                        else {
                            let absolute_path = path.join(__dirname,dir);
                            let file_path = path.join(absolute_path, file).toString();
                            let temp = file_path.split('\\');
                            let parent = temp[temp.length-2];
                            let rd = readline.createInterface({
                                input: fs.createReadStream(file_path),
                                output: process.stdout,
                                console: false,
                                terminal: false
                            });
                            let obj = {
                                feature_tag: '',
                                feature_desc: '',
                                uncommented_scenarios: []
                            };
                            new Promise((res,rej) => { // 4th Promise
                                rd.on('close', () => {
                                    // console.log(JSON.stringify(json,null,4));
                                    res([obj,parent]); 
                                });
                                let tag_taken_by_scenario = false; // tag tracker for scenario
                                let scenario_tag = '';
                                let tag_regex = /^(\s*)@(.*)$/;
                                let feature_regex = /^(\s*)Feature:(.*)$/;
                                let scenario_regex = /^(\s*)(Scenario:|Scenario Outline:)(.*)$/;
                                rd.on('line', function(line) {
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
                                });
                            }).then((data) => {
                                let obj = data[0];
                                let parent = data[1];
                                json[parent].contents.push({
                                    type: 'file',
                                    path: file_path,
                                    feature: {
                                        tag: obj.feature_tag,
                                        desc: obj.feature_desc,
                                        scenarios: obj.uncommented_scenarios
                                    }
                                });
                                // console.log(filelist);
                                // filelist.push(file);
                                rs('Done with the file');
                            }).catch(err => {
                                console.log(err);
                            });
                        }
                    }).then(js => {
                        // console.log(js + ' ' + file);
                        // console.log(JSON.stringify(js,null,4));
                    }).catch(err => console.log(err))
                );
            });
            Promise.all(promises).then(() => {
                resolve('Done working with all the files');
                // finished(json);
            }).catch(err => {
                console.log(err);
            });
        }).then((data) => {
            finished(json);
            // console.log(data);
        }).catch(err => {
            console.log(err);
        });
    }).then((data) => {
        let fs = require('fs');
        fs.writeFileSync('result.json',JSON.stringify(data,null,4), () => console.log('JSON Saved'));
        // console.log('Completed Successfully');
    });
};

let fileList = walkSync('features',[]).then(data => {
    // console.log(JSON.stringify(json,null,4));
    // console.log('final part');
    // console.log(JSON.stringify(data,null,4));
    let fs = require('fs');
    fs.writeFileSync('result.json',JSON.stringify(json,null,4), () => console.log('JSON Saved'));
}).catch(err => {
    console.log(err);
});
