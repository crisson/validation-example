/* globals app */

import {validate} from 'validator'

app.get('/some-router', (req, res) => {
    res.render('login.whatever', {errors: {}})
})

app.post('/some-route', (req, res) => {
    let {email, invite, password0, password1} = req.body || {}
    let output = validate({email, invite, password0, password1})

    output.cata(errors => {
        res.render('login.whatever', {errors})
    }, data => {
        // do something with data
        res.redirect('some-other-route')
    })
})

app.post('/some-async-route', async (req, res) => {
    let {email, invite, password0, password1} = req.body || {}

    /**
     * Here, validate returns a Validation wrapped in a Promise, so you need to 
     * unwrap it with await before using its methods.
     * @type {Validation.<ValidationError, Object>}
     */
    let output = await validate({email, invite, password0, password1})

    output.cata(errors => {
        // re-render the form with errors
        res.render('login.whatever', {errors})
    }, data => {
        // do something with data
        res.redirect('some-other-route')
    })
})