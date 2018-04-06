import Sound from 'react-native-sound'

class Ringtone {
    constructor(filename) {
        // See notes below about preloading sounds within initialization code below.
        this.whoosh = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
                return
            }
            // loaded successfully
            console.log('duration in seconds: ' + this.whoosh.getDuration() + 'number of channels: ' + this.whoosh.getNumberOfChannels());
        });
    }

    stop() {
        if(this.whoosh) {
            this.whoosh.stop(() => {
                // Note: If you want to play a sound after stopping and rewinding it,
                // it is important to call play() in a callback.
                this.whoosh.play();
            });
            this.whoosh.stop()
            this.whoosh.setCurrentTime(0.0)
            console.log(' stop audio for tone ')
        }
    }

    play() {
        // Play the sound with an onEnd callback
        this.whoosh.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
                // reset the player to its uninitialized state (android only)
                // this is the only option to recover after an error occured and use the player again
                this.whoosh.reset();
            }
        });
    }
}

export const ringtone = new Ringtone('incallmanager_ringtone.mp3')
export const ringback = new Ringtone('incallmanager_ringback.mp3')
