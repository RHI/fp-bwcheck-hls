Flowplayer Bandwidth Check / Dynamic Stream Adjust for HTTP Live Streaming ( HLS )
===

Flowplayer Plugin Requirements
---
[Birate Select](http://flash.flowplayer.org/plugins/streaming/brselect.html)  
[Menu](http://flash.flowplayer.org/plugins/flash/menu.html)  
[HTTP Streaming - HLS](https://github.com/flowplayer/flash/tree/master/plugins/httpstreaming-hls)  

Used in our demos, but not a requirement for this plugin
---
[Content](http://flash.flowplayer.org/plugins/flash/content.html) - used in our examples, but not a requirement

Implementation
---

Like other Flowplayer JavaScript Plugins, rampBWHLS is called on the flowplayer object

````
.rampBWHLS({
    interval: 7000,
    file: "../test2.png",
    fileSize: 65536,
    debug: true
});
````

| Parameter | Value |
| ----------|-------|
| interval  | The Interval at which the bandwidth check is performed |
| file      | Location of the file used for bandwidth checking |
| fileSize  | Size of file referenced by file |
| debug     | true/false |


Example
--------------
````
flowplayer("bitrate", "../flowplayer/flowplayer-3.2.15.swf", {
    // configure the required plugins
    "plugins":  {

        "httpstreaming": {
            "url": '../flowplayer/flowplayer.httpstreaminghls-3.2.10.swf'


        },
        "menu": {
            "url": "../flowplayer/flowplayer.menu.swf",
            "items": [
                // you can have an optional label as the first item
                // the bitrate specific items are filled here based on the clip's bitrates
                { "label": "select bitrate:", "enabled": false }
            ],
            "onSelect": function( a ) {
                debugger;
            }
        },
        "brselect": {
            "url": "../flowplayer/flowplayer.bitrateselect-3.2.13.swf",
            "menu": true,
            "onStreamSwitchBegin": function (newItem, currentItem) {
                $f("bitrate").getPlugin('content').setHtml("Will switch to: " + newItem.streamName +
                        " from " + currentItem.streamName);
            },
            "onStreamSwitch": function (newItem) {
                $f("bitrate").getPlugin('content').setHtml("Switched to: " + newItem.streamName + " with bitrate: " + newItem.bitrate);
            }
        },
        "content": {
            "url": '../flowplayer/flowplayer.content.swf',
            "bottom": 30, left: 0, width: 250, height: 150,
            "backgroundColor": 'transparent', backgroundGradient: 'none', border: 0,
            "textDecoration": 'outline',
            "style": {
                "body": {
                    "fontSize": 14,
                    "fontFamily": 'Arial',
                    "textAlign": 'center',
                    "color": '#ffffff'
                }
            }
        }

    },


    "clip": {
        "url": "http://publishing.ramp.com/thumbnails/cached_media/0006/0006684/0006684332/6684332_ios.stream/6684332enc_24286603.m3u8",
        "ipadUrl": "http://184.72.239.149/vod/smil:bigbuckbunnyiphone.smil/playlist.m3u8",
        "urlResolvers": ["httpstreaming","brselect"],
        "provider": "httpstreaming",
        "autoPlay": false,
        "bitrates": {
            "default": 770,
            "labels": { "300": "Low", "400": "Medium", "600": "High"  }
        }
    },
    "log": {
        "level": '',
        "filter": 'org.osmf.*, org.electroteque.m3u8.*, org.flowplayer.bitrateselect.*'
    }

}).rampBWHLS({
    interval: 7000,
    file: "../test2.png",
    fileSize: 65536,
    debug: true
});
````

