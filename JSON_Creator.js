var walkSync = async function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir),
        readline = require('readline');
    var json = {};


    json['company_relationship'] = {
        type: 'folder',
        contents: []
    };

    filelist = filelist || [];
    files.forEach(await function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            json[file] = {
                type: 'folder',
                contents: []
            };
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            //console.log(path.join(dir, file)) ==>> ..\features\baseline\company_relationship\cba.feature
            let absolute_path = path.join(__dirname,dir);
            let file_path = path.join(absolute_path, file).toString();
            let temp = file_path.split('\\');
            let parent = temp[temp.length-2];
            // console.log('Parent-> ' + parent);

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

            // let feature_tag = '';
            // let feature_desc = '';
            // let uncommented_scenarios = [];
            let temp_scenario = {};
            let tag_taken_by_scenario = false; // tag tracker for scenario
            let scenario_tag = '';
            let tag_regex = /^(\s*)@(.*)$/;
            let feature_regex = /^(\s*)Feature:(.*)$/;
            let scenario_regex = /^(\s*)(Scenario:|Scenario Outline:)(.*)$/;
            rd.on('line', function(line) {
                // First Checking out Tags
                if(tag_regex.test(line)){
                    if(obj.feature_tag === '') {
                        obj.feature_tag = line.trim();
                        console.log('Features Tag -> ' + obj.feature_tag);
                    } else { // Tag belongs to Scenario
                        scenario_tag = line.trim();
                        tag_taken_by_scenario = false;
                        console.log('Scenario Tag -> ' + scenario_tag);
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
                        temp_scenario['desc'] = line.split(':')[1].trim();
                    }
                    obj.uncommented_scenarios.push(temp_scenario);
                }
                // console.log(line);
            });
            console.log(obj);
            console.log(obj.feature_tag);
            console.log(obj.feature_desc);

            json[parent].contents.push({
                type: 'file',
                path: file_path,
                feature: {
                    tag: obj.feature_tag,
                    desc: obj.feature_desc,
                    scenarios: obj.uncommented_scenarios
                }
            });
            filelist.push(file);
        }
    });
    console.log(JSON.stringify(json,null,4));
    return filelist;
};

let fileList = walkSync('../features/baseline/company_relationship',[]);
// var fileList = walkSync('../features',[]);

// console.log(fileList);

