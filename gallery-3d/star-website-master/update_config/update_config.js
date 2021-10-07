const fs = require('fs');
const configFile = require('./config_template');

class Config {
    constructor(hauteur, largeur) {
        this.path_images = './dist/images/PIX/';
        this.path_videos = './dist/images/GIF/';
        this.range = -1000;
        this.range_dist = 50;
        this.newConfig = configFile;
        this.template = [];
    }

    getFiles(path) {
        var array = [];
        fs.readdirSync(path).forEach(file => {
            array.push(file);
        });
        return array;
    }

    getContent(){
        let images = this.getFiles(this.path_images);
        let videos = this.getFiles(this.path_videos);
        return {images: images, videos: videos};
    }

    createObjectConfig(file, index) {
        let object = {
            "name" : "second video",
            "description" : "test",
            "src" : "images/GIF/GIF-ALEX.ogv",
            "miniature" : "images/GIF/GIF-ALEX.gif",
            "video" : true,
            "x_size" : 800,
            "y_size" : 800,
            "x" : "18",
            "y" : "8",
            "z" : "16"
        };
        let extension = file.substr(file.lastIndexOf('.') + 1);
        let filename = this.removeExtention(file);
        index = index % this.template.length;
        if(index === 0) {
            this.range += this.range_dist;
        }
        object.name = filename;
        if(extension === "gif" || extension === "ogv") {
            object.video = true;
            object.description = "";
            if(extension === "gif")
                object.miniature = "images/GIF/" + filename + ".gif";
            else
                object.miniature = undefined;
            object.src = "videos/MOV/" + filename + ".ogv";
            object.x_size = 800;
            object.y_size = 800;
        } else if (extension === "png"){
            delete object.video;
            delete object.miniature;
            delete object.x_size;
            delete object.y_size;
            object.description = "";
            object.src = "images/PIX/" + file;
        }
        object.x = this.template[index].x;
        object.y = this.template[index].y;
        object.z = this.template[index].z - this.range;
        object.z = object.z.toString();
        return object;
    }


    async createConfig(){
        let allFiles = this.getContent();
        for(let project of configFile.project) {
            var object = {x: project.x, y: project.y, z: project.z};
            this.template.push(object);
        }

        this.newConfig = this.cleanConfig(this.newConfig);
        console.log(this.template);
        this.newConfig.project = allFiles.images.concat(allFiles.videos);
        let i = 0;
        console.log(this.template);
        for(let project of this.newConfig.project) {
            this.newConfig.project[i] = this.createObjectConfig(project, i);
            i++;
        }
        this.createFile(this.newConfig);
        return this.newConfig;
    }

    removeExtention(filename){
        return filename.split('.').slice(0, -1).join('.');
    }

    cleanConfig(config) {
        let newconfig  = config;
        newconfig.project = [];
        return newconfig;
    }

    createFile(obj) {
        fs.writeFile("./src/config_file.js", "let project = " + JSON.stringify(obj, null, 4) + "\nmodule.exports = project;", function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The config was saved!");
        });
    }
}

var config = new Config;
config.createConfig();
