const { flatten } = require('lodash')
// const fs = require('fs')
const StellarSdk = require('stellar-sdk')
const fetch = require('node-fetch')

const questUrl = 'quest.stellar.org'
const server = new StellarSdk.Server('https://horizon.stellar.org')

export const getBadges = async (url) => {
  try {
    let res = await StellarSdk.StellarTomlResolver.resolve(url)
    let rawBadges = res.CURRENCIES.filter(item => /^(SSQ\d\d)|(SQ0[1-4]0[1-8])|(SQL0\d0\d)$/.test(item.code))

    let newBadges = rawBadges.map(item =>  {
      try {
        let badgeObject = createBadgeObject(item)
        return badgeObject
      } catch (e) {
        console.log(`error: ${e}`)
      }
    })
    let sqlBadges = newBadges.filter((item) => /^SQL\d\d\d\d$/.test(item.code))
    let sq01MainBadges = newBadges.filter((item) => (/^SQ01\d\d/.test(item.code) && !item.monochrome))
    let sq01MonoBadges = newBadges.filter((item) => (/^SQ01\d\d/.test(item.code) && item.monochrome))
    let sq02MainBadges = newBadges.filter((item) => (/^SQ02\d\d/.test(item.code) && !item.monochrome))
    let sq02MonoBadges = newBadges.filter((item) => (/^SQ02\d\d/.test(item.code) && item.monochrome))
    let sq03MainBadges = newBadges.filter((item) => (/^SQ03\d\d/.test(item.code) && !item.monochrome))
    let sq04MainBadges = newBadges.filter((item) => (/^SQ04\d\d/.test(item.code) && !item.monochrome))
    let ssqBadges = newBadges.filter((item) => /^SSQ\d\d$/.test(item.code))
    // using `flatten()` function from lodash here
    let allBadges = flatten([ sqlBadges, sq01MainBadges, sq01MonoBadges, sq02MainBadges, sq02MonoBadges, sq03MainBadges, sq04MainBadges, ssqBadges ])
    // console.log(allBadges)
    return allBadges
    // saveBadgeDetails(allBadges)
  } catch (e) {
    console.log(`error: ${e}`)
  }
}

const newGetBadges = async (url) => {
  try {
    let res = await StellarSdk.StellarTomlResolver.resolve(url)
    let rawBadges = res.CURRENCIES.filter(item => /^(SSQ\d\d)|(SQ0[1-4]0[1-8])|(SQL0\d0\d)$/.test(item.code))

    let newBadges = rawBadges.map(item =>  {
      try {
        let badgeObject = createBadgeObject(item)
        return badgeObject
      } catch (e) {
        console.log(`error: ${e}`)
      }
    })
  } catch (e) {
    console.log(`error: ${e}`)
  }
}

const createBadgeObject = (badge) => {
  let thisBadge = {
    code: badge.code,
    issuer: badge.issuer,
    image: badge.image,
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

// getBadges(questUrl)
