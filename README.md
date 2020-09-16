# Twitch rewards handler
Custom reward interactions for obs

### requirements
- Nodejs 14
- yarn
- [obs websocket plugin](https://github.com/Palakis/obs-websocket)


### ideas
- sub/resub things?
- control a led strip
- play sounds (settle for no audio device option?)
    - `vlc -I dummy file:// vlc://quit` (the easy way, quit at the end for shutdown)
    - https://www.npmjs.com/package/speaker
    - https://github.com/Streampunk/naudiodon
    - https://github.com/TooTallNate/node-lame
    - https://github.com/TooTallNate/node-speaker
    - https://github.com/TooTallNate/node-speaker/pull/154 (this might work)
    - https://github.com/suldashi/node-lame (@suldashi/lame)
