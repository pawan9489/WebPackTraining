var walkSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir),
        readline = require('readline');
    var json = {};
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            json[file] = {
                type: 'folder',
                contents: []
            };
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            //console.log(path.join(dir, file)) ==>> ..\features\baseline\company_relationship\cba.feature
            var absolute_path = path.join(__dirname,dir);
            var file_path = path.join(absolute_path, file).toString();
            var temp = file_path.split('\\');
            var parent = temp[temp.length-2];
            // console.log('Parent-> ' + parent);

            var rd = readline.createInterface({
                input: fs.createReadStream(file_path),
                output: process.stdout,
                console: false,
                terminal: false
            });

            var feature_tag = '';
            var feature_desc = '';
            var uncommented_scenarios = [];
            var temp_scenario = {};
            var scenario_tag = '';
            var tag_regex = /^(\s*)@(.*)$/;
            var feature_regex = /^(\s*)Feature:(.*)$/;
            var scenario_regex = /^(\s*)(Scenario:|Scenario Outline:)(.*)$/;
            rd.on('line', function(line) {
                // First Checking out Tags

                if(tag_regex.test(line)){
                    if(feature_tag === '') {
                        feature_tag = line.trim();
                        console.log('Features Tag -> ' + feature_tag);
                    } else { // Tag belongs to Scenario
                        scenario_tag = line.trim();
                        console.log('Scenario Tag -> ' + scenario_tag);
                    }
                }
                // console.log(line);
            });

            // json[parent].contents.push({
            //     type: 'file',
            //     path: file_path,
            //     feature: {
            //         tag: '',
            //         desc: '',
            //         scenarios: [
            //             {desc: '', tag: ''}
            //         ]
            //     }
            // });
            feature_tag = '';
            filelist.push(file);
        }
    });
    // console.log(JSON.stringify(json,null,4));
    return filelist;
};

var fileList = walkSync('../features/baseline/company_relationship',[]);
// var fileList = walkSync('../features',[]);

// console.log(fileList);

