'use strict';

const usb = require('./node_modules/usb')

/**
 * Returns the button
 * @param idVendor
 * @param idProduct
 * @returns {undefined}
 */
const getButton = (idVendor, idProduct) => usb.findByIds(idVendor, idProduct)

const debugLog = (message, debug) => {
  if (debug) {
    console.log(message)
  }
}

const poll = button => {
  const buttonInterface = button.interface(0);

  if (button.interfaces.length !== 1 || buttonInterface.endpoints.length !== 1) {
    // Maybe try to figure out which interface we care about?
    throw new Error('Expected a single USB interface, but found: ' + buttonInterface.endpoints.length);
  }

  if (buttonInterface.isKernelDriverActive()) {
    buttonInterface.detachKernelDriver()
  }
  buttonInterface.claim();

  // The value in this buffer is still a mystery - it was pulled out of
  // a USB dump of the official driver polling for button presses.
  const pollCommandBuffer = new Buffer([0, 0, 0, 0, 0, 0, 0, 2])

  // These values were similarly captured from a USB dump.
  const bmRequestType = 0x21
  const bRequest = 0x9
  const wValue = 0x0200
  const wIndex = 0x0
  const transferBytes = 8

  const dic = {
    21: 'close',
    22: 'push',
    23: 'open',
  }

  const endpointAddress = buttonInterface.endpoints[0].address
  const endpoint = buttonInterface.endpoint(endpointAddress)

  endpoint.timeout = 300

  return new Promise((resolve, reject) => {
    button.controlTransfer(bmRequestType, bRequest, wValue, wIndex, pollCommandBuffer, function(error, data) {
      if (error) {
        reject(error)
      }

      endpoint.transfer(transferBytes, function(error, data) {
        if (error) {
          if (error.errno !== usb.LIBUSB_TRANSFER_TIMED_OUT) {
            reject(error)
          }
        } else {
          resolve(dic[data[0]])
        }
      })
    })
  })
}

module.exports = function (openCallback, pushCallback, closeCallback, debug = false) {
  const idVendor = 0x1d34
  const idProduct = 0x000d

  let isPushing = false
  let wasOpenBefore = false

  let button = getButton(idVendor, idProduct)
  if (button) {
    button.open()
  }

  setInterval(() => {
    button = getButton(idVendor, idProduct)
    button.open()

    debugLog('Button found', debug)

    poll(button).then(action => {
      if (action !== 'push' && isPushing) {
        isPushing = false
      }

      if (action === 'open' && !wasOpenBefore) {
        wasOpenBefore = true
        openCallback()
      }

      if (action === 'close') {
        wasOpenBefore = false
        closeCallback()
      }

      if (action === 'push' && !isPushing) {
        isPushing = true
        pushCallback()
      }
    }).catch(() => {})
  }, 100)
}
