# Twitch rewards handler
Custom reward interactions for obs

### requirements
- Nodejs 14
- yarn
- [vlc media player][vlc] (added to path)
- [obs websocket plugin][obs-plugin]


### Documentations
- Launchpad: https://resource.novationmusic.com/support/product-downloads?product=Launchpad

### ideas
- sub/resub things?
- control a led strip
- play sounds
    - `vlc -I dummy file:// vlc://quit` (the easy way, quit at the end for shutdown)
    - (below are packages that did not make it)
    - https://www.npmjs.com/package/speaker
    - https://github.com/Streampunk/naudiodon
    - https://github.com/TooTallNate/node-lame
    - https://github.com/TooTallNate/node-speaker
    - https://github.com/TooTallNate/node-speaker/pull/154 (this might work)
    - https://github.com/suldashi/node-lame (@suldashi/lame)


[obs-plugin]: https://github.com/Palakis/obs-websocket
[vlc]: https://www.videolan.org/vlc/index.html
