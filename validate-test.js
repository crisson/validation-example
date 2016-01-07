import chai from 'chai'

import {validate, ValidationError } from './validate'

const {expect } = chai

describe('validate', function() {
    let goodData = {
        email: 'john.smith@example.com',
        invite: 'invitecode',
        password0: 'goodpassword',
        password1: 'goodpassword'
    }

    let badData = {
        email: 'john.smithatexample.com',
        invite: new Array(1000).join('a'),
        password0: 'shorty',
        password1: 'short1',
    }

    it('fails if an empty email is provided')
    it('fails if an empty invite code is provided')

    it('fails if an invalid email is provided', () => {
        let data = Object.assign({}, goodData, {
            email: badData.email
        })
        let output = validate(data)
        expect(output.isFail()).to.be.true

        let error = output.fail()
        expect(error).to.be.instanceOf(ValidationError)
        expect(error.email).to.match(/valid email/)
    })

    it('fails if too long a token is provided', () => {
        let data = Object.assign({}, goodData, {
            invite: badData.invite
        })

        let output = validate(data)
        expect(output.isFail()).to.be.true

        let error = output.fail()
        expect(error).to.be.instanceOf(ValidationError)
        expect(error.invite).to.match(/less than/)
    })

    it('failure accumulates error messages', () => {
        let data = Object.assign({}, goodData, {
            invite: badData.invite,
            password0: badData.password1
        })

        let output = validate(data)
        expect(output.isFail()).to.be.true

        let error = output.fail()
        expect(error).to.be.instanceOf(ValidationError)
        expect(error.invite).to.be.a('string').have.length.above(0)
        expect(error.password).to.be.a('string').have.length.above(0)
    })

    it('accepts valid data', () => {
        let result = validate(goodData)
        expect(result.isSuccess()).to.be.true

        let output = result.success()
        expect(output).to.not.be.instanceOf(ValidationError)
        expect(output).to.be.an('object')
        expect(output).to.have.property('email', goodData.email)
        expect(output).to.have.property('invite', goodData.invite)
        expect(output).to.have.property('password', goodData.password0)
    })
});
