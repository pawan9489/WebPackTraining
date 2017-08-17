var glob = require('glob');
var counter = 0;
var getDirectories = function (src, callback) {
    glob(src + '/**/*', callback);
};
new Promise((rs,rj) => {
    getDirectories('../features', function (err, res) {
        if (err) {
            console.log('Error', err);
        } else {
            counter++;
            rs(res.length);
        }
    });
}).then((data) => {
    // var dir_count = 0;
    // let folder_regex = /\.feature$/;
    // data.forEach(function (file) {
    //     if(!folder_regex.test(file)){
    //         dir_count++;
    //     }
    // });
    counter = data;
    console.log('calling the walksync ' + data);
    let fileList = walkSync('../features',[]).then(data => {
    }).catch(err => {
        console.log(err);
    });
}).catch(err => console.log(err));
