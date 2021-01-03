
const fs = require('fs');
const path = require('path');
const cors = require('cors')
const express = require('express');
const app = express();
const { Router } = require('express');
const router = new Router();
const webSocket = require('ws')

function root(folders){
    return path.resolve(...folders.split('/'));
}

function findModel(templateName){
    if (fs.existsSync(root( 'app/templates/models'))) {
        if(fs.readdirSync(root('app/templates/models')).includes(templateName)) return templateName
    }
    return null
}

const viewFiles = fs.readdirSync(root('app/templates'));
const fileNames = viewFiles
    .filter(folder => /.hbs$/gi.test(folder))
    .map(template=> {
        return {
            file : template.split('.')[0],
            model: findModel(template)
        }
});

require('hbs').registerHelper('clearText', (value)=> value.replace(/\W+/g,' '));
require(root('app/helpers/vtex-helpers-v3.2.2'))

app.use(cors())
app.use(express.json());
app.use(express.static(__dirname));
app.set('views',root('app/templates'));
app.set('view engine','hbs');
app.use(router);

app.get('/' , (req,res)=> {
    res.render(root('webpack/src/view'),{files:fileNames})
});

fileNames.forEach(({file}) => {
    app.get(`/${file}` , (req,res)=> {
        res.render(file,require(root(`app/json/${file}.json`)))
    })
    app.get(`/templates/models/${file}` , (req,res)=> {
        res.render(root(`app/templates/models/${file}`),require(root(`app/json/${file}.json`)))
    })
});

app.listen( 5050 , ()=> new webSocket.Server({ port: 8090}))