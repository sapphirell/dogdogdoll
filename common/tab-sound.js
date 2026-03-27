let tabBubbleAudio = null

function getTabBubbleAudio() {
  try {
    if (tabBubbleAudio) return tabBubbleAudio
    if (typeof uni === 'undefined' || typeof uni.createInnerAudioContext !== 'function') {
      return null
    }
    const audio = uni.createInnerAudioContext()
    audio.src = '/static/tab-bubble-pop.mp3'
    audio.loop = false
    audio.autoplay = false
    audio.obeyMuteSwitch = true
    tabBubbleAudio = audio
    return tabBubbleAudio
  } catch (error) {
    console.warn('[tab-sound] init failed', error)
    return null
  }
}

export function playTabBubbleSound() {
  try {
    const audio = getTabBubbleAudio()
    if (!audio) return
    try { audio.stop() } catch (error) {}
    try {
      if (typeof audio.seek === 'function') audio.seek(0)
    } catch (error) {}
    audio.play()
  } catch (error) {
    console.warn('[tab-sound] play failed', error)
  }
}
