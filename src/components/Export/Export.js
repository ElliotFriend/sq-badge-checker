import './Export.css';
import React, { componentDidMount } from 'react';
import { Redirect } from 'react-router-dom'
import { generateVerificationHash, copyToClipboard } from '../../lib/utils.js'

/**
 * This component exports the proof for the user, once they've signed their
 * chosen verification text. An HTML <canvas> element is drawn and filled with
 * the user's badges, verification text, date, and more. We also provide them
 * with the Verification Token, as well as the verification URL.
 * TODO: Turn this into a functional component (I think?)
 */
class Export extends React.Component {
  constructor(props) {
    super(props)
    this.state = { verification_token: "" }
  }

  /**
   * Wait until the component has already been rendered, so that we can draw on
   * the canvas element.
   */
  componentDidMount() {
    let generationDate = new Date()
    const canvas = document.getElementById('canvas')
    canvas.style.cssText = 'image-rendering: optimizeSpeed;' +
                           'image-rendering: pixelated;' +
                           'image-rendering: crisp-edges;' +
                           'image-rendering: -moz-crisp-edges;'
    canvas.crossOrigin = "Anonymous"
    const ctx = canvas.getContext("2d")
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    const img = this.refs.background
    img.onload = () => {
      // After the image has been loaded, set up the background and begin
      // looping through the provided assets
      ctx.fillStyle = "#111420"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      let ptrn = ctx.createPattern(img, 'repeat')
      ctx.fillStyle = ptrn
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = "11px Courier"
      let xPos = 10
      let yPos = 20
      this.props.badges.forEach((badge, i, a) => {
        // Get some information about where we are in the array and on canvas
        let image = document.getElementById(badge.issuer)
        let series = badge.code.slice(0, -2)
        let lastBadge = i >= 1 ? a[i-1] : null
        let lastSeries = lastBadge ? lastBadge.code.slice(0, -2) : null
        let seriesTitle = series === 'SSQ'
          ? "STANDALONE SIDE QUEST BADGES"
          : series === 'SQL00'
          ? "SQ LEARN - PIONEER QUEST"
          : series === 'SQL01'
          ? "SQ LEARN - PAYMENT OPERATIONS"
          : series === 'SQL02'
          ? "SQ LEARN - CONFIGURATION OPERATIONS"
          : series === 'SQL03'
          ? "SQ LEARN - ADVANCED OPERATIONS"
          : series === 'SSQL'
          ? "SQ LEARN - SIDE QUEST BADGES"
          : `SQ LEGACY - SERIES ${series.slice(-2)}`

        ctx.fillStyle = "#ffffff"
        if (i === 0) {
          // Start with a series header
          ctx.fillText(seriesTitle, xPos, 17)
        } else if (series !== lastSeries && !/^Q\d\d$/.test(lastSeries)) {
          // We're starting a new series
          xPos = 10
          yPos += 138
          ctx.fillText(seriesTitle, xPos, yPos + 7)
          yPos += 10
        } else if (badge.monochrome && !lastBadge.monochrome) {
          xPos = 10
          yPos += 138
        }
        // Draw the image onto the canvas
        ctx.drawImage(image, xPos, yPos, 128, 128)
        if (badge.owned === false) {
          // If the badge is not owned, draw some overlay on the image
          ctx.globalAlpha = 0.95
          ctx.fillStyle = "#000000"
          ctx.fillRect(xPos, yPos, 128,128)
          ctx.fillStyle = "#ffffff"
          ctx.globalAlpha = 1
          ctx.fillText("BADGE NOT OWNED", xPos + 15, yPos + 128 / 2)
          ctx.font = "15px Courier"
          ctx.fillText(badge.code, xPos + 10, yPos + 20)
          if (badge.monochrome === true) { ctx.fillText("MONOCHROME", xPos + 10, yPos + 35) }
          ctx.font = "11px Courier"
        }
        if (i === a.length - 1) {
          // We're on the last item, put the details and such on the canvas
          xPos = 10
          yPos += 138
          ctx.font = "12px Courier"
          ctx.fillText(`VERIFICATION TEXT: ${this.props.verText}`, xPos, yPos + 19)
          ctx.fillText(`GENERATED ON: ${generationDate}`, xPos, yPos + 31)
          ctx.fillText("TO VERIFY PROOF, PLEASE VISIT BADGES.ELLIOTFRIEND.COM/VERIFY", xPos, yPos + 44)
          ctx.fillText("THIS IMAGE HAS BEEN SIGNED BY AND CREATED FOR:", xPos, yPos + 99)
          ctx.fillText("GENERATED BY BADGES.ELLIOTFRIEND.COM", xPos, yPos + 128)
          ctx.font = "20px Courier"
          ctx.fillText(this.props.pubkey, xPos, yPos + 115)
        }
        xPos += 138
      })
    }

    let user_assets = this.props.user_assets
    let pubkey = this.props.pubkey
    let verText = this.props.verText
    let messSig = this.props.messSig

    let generateVerificationOperations = (assets) => {
      return assets.reduce((acc, item, i, a) => {
        return acc.concat(item.operation)
      }, [])
    }

    /**
     * Build the object that will store the public key, the verification text,
     * the message signature, and an array of operations to be verified.
     */
    let verificationObject = {
      p: pubkey,
      m: verText,
      s: messSig,
      d: generationDate,
      o: generateVerificationOperations(user_assets)
    }

    /**
     * Create a hash of the object from above, and make the two an array.
     * convert that into a base64-encoded string, and save it as our token.
     */
    generateVerificationHash(verificationObject)
      .then((hash) => {
        let finalArray = new Array(JSON.stringify(verificationObject), hash)
        let token = Buffer.from(finalArray.join(',')).toString('base64')
        this.setState({
          verification_token: token
        })
      })
  }

  render() {
    let badges = this.props.badges
    let pubkey = this.props.pubkey
    let exportStatus = this.props.exportStatus

    /**
     * Draw the badges onto the document, so we can getElementById later on
     * once we've begun drawing on the canvas.
     */
    const hideImages = (badges) => {
      let imgArray = []
      badges.forEach((badge, i) => {
        imgArray.push(<img id={badge.issuer} alt={`${badge.code} NFT Badge`} src={badge.image || `/assets/badges/${badge.filename}`} key={`${badge.issues}-${i}`} className="d-none nft-badge" />)
      })
      return imgArray
    }

    /**
     * Download the verification token as a text file, if the user should so
     * desire.
     */
    let downloadAsFile = () => {
      let blob = new Blob(
        [ this.state.verification_token ],
        { type: "text/plain;charset=utf-8" }
      )
      let downloadURL = URL.createObjectURL(blob)
      return downloadURL
    }
    let downloadURL = downloadAsFile()

    /**
     * Enable a download button for the image to be downloaded from a browser,
     * without needing to right-click, save as, etc.
     */
    let downloadImage = () => {
      let link = document.createElement('a')
      link.download = `verification-image-${pubkey}.png`
      link.href = document.getElementById('canvas').toDataURL()
      link.click()
    }

    /**
     * Calculate the number of rows we'll be displaying on the canvas, so we can
     * draw the canvas onto the document early with a specific height.
     */
    let imgHeight = badges
      .reduce((acc, item, i, arr) => {
        if (i > 0) {
          let lastItem = arr[i - 1]
          if (item.code.substr(2, 3) !== lastItem.code.substr(2, 3) && !/^Q\d\d$/.test(lastItem.code.substr(2, 3))) {
            return acc += 148
          } else if ((item.monochrome && !lastItem.monochrome) || (!item.monochrome && lastItem.monochrome)) {
            return acc += 138
          } else { return acc }
        } else {
          return acc += 148
        }
      }, 148)

    let verificationURL = `https://badges.elliotfriend.com/verify/${encodeURIComponent(this.state.verification_token)}`

    return (
      <div>
        <h1 className="mt-5 mb-3">Here's The Receipts!</h1>
        <p>You'll find three things on this page: A shareable image, a verification URL, and a Verification Token.</p>
        <h2 className="mt-5">Shareable Image</h2>
        <p className="mb-3">Share this image with everyone you know! And the ones you don't.</p>
        <p><button onClick={() => downloadImage()} className="btn btn-primary">Download Image</button></p>
        <canvas id="canvas" width={1114} height={imgHeight} />
        <img ref="background" alt="starry bits" src="/assets/tileable-classic-nebula-space-patterns-6.png" className="d-none" />
        { hideImages(badges) }
        <div className="container mb-3">
          <div className="row">
            <div className="mt-5 col-lg-6">
              <h2>Verification URL</h2>
              <p>A special link has been created for you. You can share this URL with others, and they can automatically verify your badges using it.</p>
              <a className="mb-3 btn btn-primary" href={verificationURL}>This is the Link Right Here</a>
            </div>
            <div className="mt-5 col-lg-6">
              <h2 className="mb-3">Verification Token</h2>
              <p>This token can be supplied to <strong><a href="https://badges.elliotfriend.com/verify">https://badges.elliotfriend.com/verify</a></strong> in order to verify your proof.</p>
              <div className="row mb-3">
                <div className="col">
                  <button onClick={() => copyToClipboard('verificationTokenPre')} type="button" className="w-100 btn btn-primary">Copy to Clipboard</button>
                </div>
                <div className="col">
                  <a href={downloadURL} id="downloadFileButton" download={`verification-token-${pubkey}.txt`} className="w-100 btn btn-primary">Download as File</a>
                </div>
              </div>
              <pre id="verificationTokenPre" className="user-select-all p-3 text-break text-wrap bg-dark">{this.state.verification_token}</pre>
            </div>
          </div>
        </div>
        { exportStatus === false ? <Redirect to={"/prove/" + pubkey} /> : null }
      </div>
    )
  }
}

export default Export
