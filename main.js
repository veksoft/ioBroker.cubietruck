/*
 *
 * cubietruck adapter
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils

var fs = require('fs');
var cp = require('child_process');

var pollTimer = null;
var adapter = utils.adapter('cubietruck');

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback)
{
//    adapter.log.info('on unload');

    try
    {
        adapter.log.info('cleaned everything up...');

        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null; // форсируем запуск сборщика мусора
        }
        
        callback();
    }
    catch (e)
    {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj)
{
//    adapter.log.info('on stateChange: if a subscribed object changes');

    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state)
{
//    adapter.log.info('on stateChange: if a subscribed state changes');

    // Warning, state can be null if it was deleted
//    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack)
    {
          if (id.indexOf('leds.') !== -1) {

            var ids = id.split(".");
            var led = ids[ids.length - 1].toString();
            switchLed(led, state.val);
        }

//        adapter.log.info('ack is not set!');
    }
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj)
{
//    adapter.log.info('on message');

    if (typeof obj == 'object' && obj.message)
    {
        if (obj.command == 'send')
        {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback)
                adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function ()
{
    main();
});

function main()
{
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
//    adapter.log.info('config test1: ' + adapter.config.test1);
//    adapter.log.info('config test2: ' + adapter.config.test2);

/*    adapter.setObject('testVariable',
    {
        type: 'state',
        common:
        {
            name: 'testVariable',
            type: 'boolean',
            role: 'indicator'
        },
        native: {}
    });*/

    adapter.setObject('cpu.load1',
        {
            type: 'state',
            common:
            {
                name: 'cpu load 1 minutes',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('cpu.load5',
        {
            type: 'state',
            common:
            {
                name: 'cpu load 5 minutes',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('cpu.load15',
        {
            type: 'state',
            common:
            {
                name: 'cpu load 15 minutes',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('cpu.temp',
        {
            type: 'state',
            common:
            {
                name: 'cpu temperature (°C)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });
    
/*    adapter.setObject('hdd.temp',
        {
            type: 'device',
            common:
            {
                name: 'hdd temperature (°C)',
                type: 'number',
                role: 'sensor'
            },
            native: {}
        });*/

    adapter.setObject('powerSupply.voltage',
        {
            type: 'state',
            common:
            {
                name: 'power supply voltage (V)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('powerSupply.current',
        {
            type: 'state',
            common:
            {
                name: 'power supply current (mA)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('batterySupply.status',
        {
            type: 'state',
            common:
            {
                name: 'battery status',
                type: 'string',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('batterySupply.health',
        {
            type: 'state',
            common:
            {
                name: 'battery health',
                type: 'string',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('batterySupply.voltage',
        {
            type: 'state',
            common:
            {
                name: 'battery supply voltage (V)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('batterySupply.current',
        {
            type: 'state',
            common:
            {
                name: 'battery supply current (mA)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('batterySupply.capacity',
        {
            type: 'state',
            common:
            {
                name: 'battery capacity (%)',
                type: 'number',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('leds.orange',
        {
            type: 'state',
            common:
            {
                name: 'switch orange led',
                type: 'boolean',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('leds.blue',
        {
            type: 'state',
            common:
            {
                name: 'switch blue led',
                type: 'boolean',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('leds.green',
        {
            type: 'state',
            common:
            {
                name: 'switch green led',
                type: 'boolean',
                role: 'value'
            },
            native: {}
        });

    adapter.setObject('leds.white',
        {
            type: 'state',
            common:
            {
                name: 'switch white led',
                type: 'boolean',
                role: 'value'
            },
            native: {}
        });

    // in this cubietruck all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');

    // the variable testVariable is set to true as command (ack=false)
//    adapter.setState('testVariable', true);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
//    adapter.setState('testVariable', {val: true, ack: true});

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
//    adapter.setState('testVariable', {val: true, ack: true, expire: 30});

    // examples for the checkPassword/checkGroup functions
//    adapter.checkPassword('admin', 'iobroker', function (res)
//    {
//        console.log('check user admin pw ioboker: ' + res);
//    });

//    adapter.checkGroup('admin', 'admin', function (res)
//    {
//        console.log('check group user admin group admin: ' + res);
//    });

//    adapter.log.info('start poll timer');
    pollTimer = setInterval(poolCubietruck, 60000);
    poolCubietruck();
}

function poolCubietruck()
{
//    adapter.log.info('pool cubietruck:' + count);
//    count++;

    var tempCPU = fs.readFileSync("/sys/devices/platform/sunxi-i2c.0/i2c-0/0-0034/temp1_input").toString();
    tempCPU = parseFloat(tempCPU) / 1000;
    tempCPU = tempCPU.toFixed(1);
    adapter.setState('cpu.temp', tempCPU, true);

/*    cp.exec("hddtemp /dev/sda | awk '{ print $3}' | awk -F '°' '{ print $1}'", function(err, tempHDD)
    {
        if (!err && tempHDD) {
            adapter.setState('hdd.temp', {val: parseFloat(tempHDD), ack: true});
        }
    });*/

    var loadAvg = fs.readFileSync("/proc/loadavg").toString().split(" ");
    adapter.setState('cpu.load1',  parseFloat(loadAvg[0]), true);
    adapter.setState('cpu.load5',  parseFloat(loadAvg[1]), true);
    adapter.setState('cpu.load15', parseFloat(loadAvg[2]), true);

    var acData = fs.readFileSync("/sys/class/power_supply/ac/uevent").toString();
    acData = acData.split("\n");
    for (var i = 0; i < acData.length; i++) {
        if (!acData[i] || !acData[i].trim()) continue;

        var acDataLine = acData[i].split("=");
        if (acDataLine.length != 2) continue;

        if (acDataLine[0] == 'POWER_SUPPLY_VOLTAGE_NOW') {
            adapter.setState('powerSupply.voltage', (parseInt(acDataLine[1]) / 1000000).toFixed(2), true);
        } else
        if (acDataLine[0] == 'POWER_SUPPLY_CURRENT_NOW') {
            adapter.setState('powerSupply.current', Math.round((parseInt(acDataLine[1]) / 1000)), true);
        }
    }

    var batData = fs.readFileSync("/sys/class/power_supply/battery/uevent").toString();
    batData = batData.split("\n");
    for (var i = 0; i < batData.length; i++) {
        if (!batData[i] || !batData[i].trim()) continue;

        var batDataLine = batData[i].split("=");
        if (batDataLine.length != 2) continue;

        if (batDataLine[0] == 'POWER_SUPPLY_STATUS') {
            adapter.setState('batterySupply.status', batDataLine[1], true);
        } else
        if (batDataLine[0] == 'POWER_SUPPLY_HEALTH') {
            adapter.setState('batterySupply.health', batDataLine[1], true);
        } else
        if (batDataLine[0] == 'POWER_SUPPLY_VOLTAGE_NOW') {
            adapter.setState('batterySupply.voltage', (parseInt(batDataLine[1]) / 1000000).toFixed(2),true);
        } else
        if (batDataLine[0] == 'POWER_SUPPLY_CURRENT_NOW') {
            adapter.setState('batterySupply.current', Math.round((parseInt(batDataLine[1]) / 1000)), true);
        } else
        if (batDataLine[0] == 'POWER_SUPPLY_CAPACITY') {
            adapter.setState('batterySupply.capacity', parseInt(batDataLine[1]), true);
        }
    }

    adapter.setState('leds.blue',   statusLed('blue'),   true);
    adapter.setState('leds.orange', statusLed('orange'), true);
    adapter.setState('leds.white',  statusLed('white'),  true);
    adapter.setState('leds.green',  statusLed('green'),  true);

//  adapter.setState('leds.white',  blink);
//  blink = !blink;
}

function statusLed(led) {
    
    var v;

    if (led == 'blue') {
        v = fs.readFileSync("/sys/class/leds/blue:ph21:led1/brightness").toString();
    } else
    if (led == 'orange') {
        v = fs.readFileSync("/sys/class/leds/orange:ph20:led2/brightness").toString();
    } else
    if (led == 'white') {
        v = fs.readFileSync("/sys/class/leds/white:ph11:led3/brightness").toString();
    } else
    if (led == 'green') {
        v = fs.readFileSync("/sys/class/leds/green:ph07:led4/brightness").toString();
    }

    return (v != 0);// ? 'ON' : 'off';
}

function switchLed(led, value) {

    adapter.log.info('switch led' + led + " to " + value ? 'ON' : 'off');
    var v = value ? 1 : 0;

    if (led == 'blue') {
        cp.exec("echo " + v + " > /sys/class/leds/blue:ph21:led1/brightness");
    } else
    if (led == 'orange') {
        cp.exec("echo " + v + " > /sys/class/leds/orange:ph20:led2/brightness");
    } else
    if (led == 'white') {
        cp.exec("echo " + v + " > /sys/class/leds/white:ph11:led3/brightness");
    } else 
    if (led == 'green') {
        cp.exec("echo " + v + " > /sys/class/leds/green:ph07:led4/brightness");
    }
}