![Logo](icons/visLogo.png)

This project adds web visualisation to Node-RED. It is based on [ioBroker.vis](https://github.com/ioBroker/ioBroker.vis).

Functionality
-------------
 We introduce "vis in" node which creates the visualisation server with communication via socket.io.

Install
-------

```bash
cd $NODE_RED_HOME
npm install node-red-vis
```

Usage
--------

Create "advanced => vis in" node and 3 inject nodes as pictured:

![node-red](doc/node-red.png)

Deploy it. After deploying go to [http://localhost:1880/vis/edit.html](http://localhost:1880/vis/edit.html) and create "basic - ctrl Bulb on/off":

![basic](doc/basic-ctrl_Bulb_on-off.png)

and "RGraph - Gauge-Basic":

![RGraph-Gauge-Basic](doc/RGraph-Gauge-Basic.png)

Write into Object ID of "basic - ctrl Bulb on/off" - "/kitchen/lamp":

![ctrl-Bulb(On-Off)](doc/ctrl-Bulb_On-Off.png)

and into Object ID of "RGraph - Gauge-Basic" - "/balkon/temperature":

![RGraph-Gauge](doc/RGraph-Gauge.png)

Wait for the project saved (about 3 seconds) and after that click here:

![Close](doc/close.png)

You will see something like this:

![Runtime](doc/index.png)

If you click on lamp following payload will be sent:

![Debug](doc/click.png)

You can forward this message to your hardware to control it.

The only issue is **at start** all drawn controls must receive the value.


