import {Maybe, Validation} from 'monet'

class ValidationError {
  constructor(key, value){
    this[key] = value
  }

  concat(other){
    return Object.assign(this, other)
  }

  toArray(){
    return Object.keys(this).map(key => this[key])
  }

  toObject(){
    return Object.keys(this).reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
  }

  toJSON(){
    return this.toObject()
  }    
}

ValidationError.of = (k, v) => {
    return new ValidationError(k, v)
}

/**
 * Trims a string
 * @param  {String} s
 * @return {String}
 */
const trim = s => s.trim()

/**
 * Returns true if a value is truthy
 * @param  {Any} s
 * @return {Boolean}
 */
const istruthy = s => !!s

/**
 * Validates an invitation code along with an email address.
 *
 *  I would typically export a function such as this for testing purposes.  Also,
 *  since Validation's Fail type should be accumulative, I would typically
 *  separate the validation of "invite" and "email" into two separate functions.
 * 
 * @param  {String} invite
 * @param  {String} email
 * @return {Validation.<ValidationError, Object>}
 */
const validateInviteAndEmail = (invite, email) => {

    let maybeInvite = Maybe.fromNull(invite).map(trim).filter(istruthy)
    let maybeEmail = Maybe.fromNull(email).map(trim).filter(istruthy)

    // Let's say both invite & email must be provided, and you need to check both
    let out = maybeInvite.flatMap(inv => {
        return maybeEmail.flatMap(em => {
            return {invite: inv, email: em}
        })
    }) 

    // If the prior operation returns an instance of Maybe.None, Maybe.toValidation 
    // will produce a Fail[ValidationError], where Fail is a subtype of Validation.
    // If the prior operation instead returns an instance of Maybe.Some, Maybe.toValidation
    // will produce Success[Object]
    .toValidation(ValidationError.of("registration", 
        "both invite and email are required"))

    // The function passed to flatMap will only be invoked if toValidation produced
    // a Success[Object].  Failures are short-circuited.  It gives you the opportunity
    // to modify the Validation.  I typically use it to complete more fine-tuned
    // checks on data that to this point looks valid.
    .flatMap(({invite, email}) => {
        // complete additional checks
        let maxChar = 320
        if (invite.length > maxChar) {
            return Validation.fail(ValidationError.of("invite", 
                `invite must be lesse than ${maxChar}`))
        }

        if (email.indexOf('@') === -1) {
            return ValidationError.of("email", "a valid email is required")
        }

        return Validation.success({invite, email})
    })

    return out
}

/**
 * An example of a validation that depends on multiple input values
 * @param  {String} pwd0
 * @param  {String} pwd1
 * @return {Validation.<ValidationError, String>}
 */
const validatePassword = (pwd0, pwd1) => {
    return Maybe.fromNull(pwd0)
        .map(trim)
        .filter(istruthy)
        .flatMap(p0 => {
            return Maybe.fromNull(pwd1).map(trim).filter(istruthy)
                .filter(p1 => p1 === p0)
        })
        .toValidation(ValidationError.of('password', 'password must match'))
        .flatMap(pwd => {
            let minChar = 8
            if (pwd.length < minChar ) {
                return Validation.fail(ValidationError.of('password', 
                    `password must exceed ${minChar} characters`))
            }

            return Validation.success(pwd)
        })
}

/**
 * Validates user login data
 * @param  {Object} raw
 * @param {String} invite
 * @param {String} email
 * @param {String} password
 * @return {Validation.<ValidationError, Object>}
 */
export const validate = (raw) => {
    let {invite, email, password0, password1} = raw

    let fn = function(password, inviteAndEmail) {
        let {email, invite} = inviteAndEmail
        return {password, email, invite}
    }.curry()

    return validateInviteAndEmail(invite, email)
            .ap(validatePassword(password0, password1).map(fn))
}

