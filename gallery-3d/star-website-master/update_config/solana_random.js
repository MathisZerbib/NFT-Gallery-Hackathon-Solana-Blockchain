const fs = require('fs');
const configFile = require('./config_template');
const collectionName = 'aurory';
const solanaNftList = require('./solana_nft_list_'+collectionName).slice(1, 100)

class Config {

    constructor(hauteur, largeur) {
        this.range = -1000;
        this.range_dist = 50;
        this.newConfig = configFile;
        this.template = [];
    }

    createObjectConfig(object, index) {
        index = index % this.template.length;
        if(index === 0) {
            this.range += this.range_dist;
        }
        object.src = object.link_img;
        object.x = this.template[index].x;
        object.y = this.template[index].y;
        object.z = this.template[index].z - this.range;
        object.z = object.z.toString();
        return object;
    }

    async createConfig(){
        for(let project of configFile.project) {
            var object = {x: project.x, y: project.y, z: project.z};
            this.template.push(object);
        }
        this.newConfig.project = solanaNftList;
        let i = 0;
        console.log(this.template);
        for(let project of this.newConfig.project) {
            this.newConfig.project[i] = this.createObjectConfig(project, i);
            i++;
        }
        this.createFile(this.newConfig);
        return this.newConfig;
    }

    createFile(obj) {
        fs.writeFile("./src/config_file_solana_"+collectionName+".js", "let project = " + JSON.stringify(obj, null, 4) + "\nmodule.exports = project;", function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The config was saved!");
        });
    }
}

var config = new Config();
config.createConfig();
