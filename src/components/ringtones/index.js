import Sound from 'react-native-sound'
import InCallManager from 'react-native-incall-manager'

// Enable playback in silence mode
InCallManager.start({media: 'audio'});
// Sound.setCategory('Playback');

class Ringtone {
    constructor(filename, isPlayback) {
        this.filename = filename
        // See notes below about preloading sounds within initialization code below.
        this.whoosh = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
                return
            }

            if (isPlayback) {
              this.whoosh.setCategory("Playback")
            } else {
              this.whoosh.setCategory("PlayAndRecord")
            }


            // Loop indefinitely until stop() is called
            this.whoosh.setNumberOfLoops(-1)

            console.log('duration in seconds: ' + this.whoosh.getDuration() + 'number of channels: ' + this.whoosh.getNumberOfChannels())
        })

    }

    stop() {
        if(this.whoosh) {
            // Get the current playback point in seconds
            this.whoosh.getCurrentTime((seconds) => {
                console.log(this.filename)
                console.log('at ' + seconds)
            })
            clearTimeout(this.playAudio)
            this.whoosh.stop()
            this.whoosh.setVolume(0.0)
        }
    }

    play() {
        this.whoosh.setVolume(0.5)
        this.whoosh.setCurrentTime(0.0)
        this.playAudio = setTimeout(() => {
            // Play the sound with an onEnd callback
            this.whoosh.play((success) => {
                if (success) {
                    console.log('successfully finished playing')
                } else {
                    console.log('playback failed due to audio decoding errors')

                    this.whoosh.reset()
                }
            })
        }, 100)
    }
}

export const ringtone = new Ringtone('incallmanager_ringtone.mp3', false)
export const ringback = new Ringtone('incallmanager_ringback.mp3', true)
