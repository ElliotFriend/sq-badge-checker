const { map, isEmpty, orderBy, partition, flatten } = require('lodash')
const fs = require('fs')
const StellarSdk = require('stellar-sdk')
const fetch = require('node-fetch')

// import StellarSdk from 'stellar-sdk'

const questUrl = 'quest.stellar.org'
const server = new StellarSdk.Server('https://horizon.stellar.org')

let getBadges = async (url) => {
  try {
    let res = await StellarSdk.StellarTomlResolver.resolve(url)
    let rawBadges = res.CURRENCIES.filter(item => /^(SSQ\d\d)|(SQ0[1-4]0[1-8])|(SQL0\d0\d)$/.test(item.code))

    // Create a new array, containing an object for each of the SQ assets.
    // Also, save a new png, built from the data entries on the issuer account
    let newBadges = rawBadges.map(item =>  {
      try {
        let badgeObject = createBadgeObject(item)
        // if (/^SQL010\d$/.test(item.code)) {
        //   await writePngFile(badgeObject.issuer, item.image.slice(-1), `public/assets/badges/${badgeObject.filename}`, manageData=false, url=item.image)
        // } else {
        //   await writePngFile(badgeObject.issuer, item.image.slice(-1), `public/assets/badges/${badgeObject.filename}`)
        // }
        return badgeObject
      } catch (e) {
        console.log(`error: ${e}`)
      }
    })
    // console.log(newBadges)
    saveBadgeDetails(newBadges)
  } catch (e) {
    console.log(`error: ${e}`)
  }

}

const createBadgeObject = (badge) => {
  let thisBadge = {
    code: badge.code,
    issuer: badge.issuer,
    filename: badge.image,
    description: questDescriptions[badge.code] || 'description goes here',
    owned: false,
  }
  if (/^SSQ0\d$/.test(badge.code)) {
    thisBadge.side = true
  }
  if (/^SQL0\d0\d$/.test(badge.code)) {
    thisBadge.learn = true
  }
  if (badge.tag === 'mono') {
    thisBadge.monochrome = true
  }
  return thisBadge
}

const writePngFile = async (issuer, version, filename, manageData=true, url=null) => {
  let png = await server
  .loadAccount(issuer)
  .then(({data_attr}) => {
    if (isEmpty(data_attr)) {
        if (!url) {
            throw 'data_attr empty'
        } else {
          let dl_png = fetch(url)
          return dl_png
        }
    }
    if (version <= 2) {
        const prefix = parseInt(version) + 1
        return map(data_attr, (value, key) =>
            `${key.substring(prefix)}${Buffer.from(value, 'base64').toString('utf8')}`
        ).join('')
    }

    let pngBufferArray = map(data_attr, (value, key) => {
        const keyBuffer = Buffer.from(key, 'base64')
        return {
            index: parseInt(keyBuffer.slice(0, 2).toString('hex'), 16),
            key: keyBuffer.slice(2),
            value
        }
    })

    pngBufferArray = orderBy(pngBufferArray, 'index')
    pngBufferArray = map(pngBufferArray, ({key, value}) =>
        Buffer.concat([key, Buffer.from(value, 'base64')])
    )

    return Buffer.concat(pngBufferArray)
  })
  .then((png) => {
    let pngData = version <= 2 ? Buffer.from(png, 'base64') : png
    fs.writeFileSync(filename, pngData)
  })
}

const saveBadgeDetails = (detailsArray) => {
  detailsArray = partition(detailsArray, (o) => !o.monochrome)
  // detailsArray = orderBy(detailsArray, ['code', 'monochrome'], ['asc', 'desc'])
  fs.writeFileSync('src/lib/testBadgeDetails.js', JSON.stringify(detailsArray))
}

const questDescriptions = {
  SQ0101: "Create and fund your account",
  SQ0102: "Add a memo and send a payment",
  SQ0103: "Add data to the blockchain",
  SQ0104: "Enable multisig transactions",
  SQ0105: "Create, issue, and acquire a custom asset",
  SQ0106: "Make an offer to sell that asset",
  SQ0107: "Pay the transaction fee from another account",
  SQ0108: "Acquire SRT using a path payment",
  SQ0201: "Create and fund your account with a hashed memo",
  SQ0202: "Create, issue, and acquire a custom asset",
  SQ0203: "Create a fee bump transaction",
  SQ0204: "Create a claimable balance",
  SQ0205: "Claim that claimable balance",
  SQ0206: "Sponsor future reserves for another account",
  SQ0207: "Revoke the account sponsorship",
  SQ0208: "Set a home domain for your account",
  SQ0301: "Make use of a sequence number bump operation in a transaction",
  SQ0302: "Submit a transaction containing 100 operations",
  SQ0303: "Submit a hash signed transaction",
  SQ0304: "Submit a pre-authorized transaction",
  SQ0305: "Successfully submit a clawback operation",
  SQ0306: "Mint a Stellar Quest style NFT",
  SQ0307: "Acquire and make use of a SEP-0010 JWT",
  SQ0308: "Use SEP-0006 to acquire some MULT from the testanchor",
  SSQ01: "Attend Stellar's Meridian 2020 conference",
  SSQ02: "Stellar Community Fund 2021 Panelist"
}

getBadges(questUrl)
