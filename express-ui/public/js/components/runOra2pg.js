app.component('runOra2pg', {
    name: 'runOra2pg',
    props:{
        project: {
            type: String
        }
    },
    template: /*html*/
    `<iframe :src="'/ora2pg/'+project+'/exec/'"></iframe>`,
});