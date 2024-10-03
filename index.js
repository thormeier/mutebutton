const bigRedButton = require('./big-red-button')
const { exec } = require('child_process')

const openCallback = () => {
  exec('XDG_RUNTIME_DIR=/run/user/1000 /home/thor/projects/private/mutebutton/setvolume.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
     if (error !== null) {
       console.log('exec error: ' + error);
     }
  })
}
const pushCallback = () => {
  exec('XDG_RUNTIME_DIR=/run/user/1000 /home/thor/projects/private/mutebutton/mictoggle.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  })
}
const closeCallback = () => {
  exec('XDG_RUNTIME_DIR=/run/user/1000 /home/thor/projects/private/mutebutton/turnalloff.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  })
}
const debug = false

bigRedButton(openCallback, pushCallback, closeCallback, debug)
