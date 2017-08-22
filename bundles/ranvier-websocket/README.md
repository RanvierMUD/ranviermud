This bundle is a _very_ basic sample implementation of using websockets instead of telnet.
To enable replace `"ranvier-telnet"` bundle in `ranvier.json` with `"ranvier-websocket"`.

An example websockets client compatible with this bundle can be downloaded from
[github.com/shawncplus/neuro](https://github.com/shawncplus/neuro)

When using `ranvier-websockets` it's suggested that you set the `playerTickFrequency` and
`entityTickFrequency` configurations in `ranvier.json` to faster than the default 100ms to
allow for smoother rendering of data on the client.
