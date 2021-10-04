
const { existsSync, readdirSync } = require('fs');
const { resolve } = require('path');
const cors = require('cors')
const app = require('express')();
const hbs = require('hbs');

const useParentFolder = existsSync(root('../templates'));

require(root('emails/helpers/vtex-helpers-v3.2.2'));
hbs.registerHelper('clearText', (value) => value.replace(/\W+/g, ' '));
hbs.registerPartials(useParentFolder ? root('../templates/partials') : root('emails/templates/partials'), function (err) { });

function root(folders) {
    return resolve(...folders.split('/'));
}

function findModel(templateName) {
    if (existsSync(root('../templates/defaults'))) {
        if (readdirSync(root('../templates/defaults')).includes(templateName)) return templateName;
    }

    if (existsSync(root('emails/templates/defaults'))) {
        if (readdirSync(root('emails/templates/defaults')).includes(templateName)) return templateName
    }
    return null
}
const viewFiles =  useParentFolder ? readdirSync(root('../templates')) : readdirSync(root('emails/templates'));
const fileNames = viewFiles
    .filter(folder => /.hbs$/gi.test(folder))
    .map(template => {
        return {
            file: template.split('.')[0],
            model: findModel(template)
        }
    });

app.use(cors());
app.set('views', useParentFolder ? root('../templates') : root('emails/templates'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render(root('webpack/server/view'), { files: fileNames })
});

fileNames.forEach(({ file }) => {
    app.get(`/${file}`, (req, res) => {
        res.render(file, useParentFolder ? require(root(`../json/${file}.json`)) : require(root(`emails/json/${file}.json`)))
    })
    app.get(`/templates/defaults/${file}`, (req, res) => {
        if (useParentFolder) {
            res.render(
                root(`../templates/defaults/${file}`), 
                require(root(`../json/${file}.json`))
            )
        } else {
            res.render(
                root(`emails/templates/defaults/${file}`), 
                require(root(`emails/json/${file}.json`))
            )
        }
    })
});

module.exports = app