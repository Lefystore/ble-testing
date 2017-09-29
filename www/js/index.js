/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('device ready');
        alert('device ready');


        var onSuccess = function(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    };
 
    // onError Callback receives a PositionError object 
    // 
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
 
    navigator.geolocation.getCurrentPosition(onSuccess, onError);



        if(!ble){
            alert('no plugin ble');
            var ble = {};
            return;
        }
        ble.startScan([], function(device) {
            alert(device);
            var ul = '';
            $.each(device,function(k,v){
                ul = '<li>'+v+'</li>';
            });
            $('#blelist').html(ul);
            console.log(JSON.stringify(device));
        }, function(){
            alert('scan fgailed');
        });

        setTimeout(ble.stopScan,
            5000,
            function() { alert("Scan complete"); },
            function() { alert("stopScan failed"); }
        );
    }
    
};

*/

'use strict';

var battery = {
    service: "180F",
    level: "2A19"
};

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        batteryStateButton.addEventListener('touchstart', this.readBatteryState, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        //deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        alert('device is ready');
        ble.isEnabled(function(){
            //bluetooth is on
            app.refreshDeviceList();
        }, function(){
            //its oof
            alert('Debe activar el bluetooth de su dispositivo');
        });
    },
    refreshDeviceList: function() {
        alert('refreshing list');
        // scan for all devices
        //ble.startScanWithOptions([],{ reportDuplicates: false }, app.onDiscoverDevice, app.onError);
        ble.scan([], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var html = '<a href="#'+device.id+'" data-id="'+device.id+'" data-name="'+device.name+'"><b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id + '</a><br>';

        $('#deviceList').append(html);

        $('#deviceList a').on('click',function(e){
            e.preventDefault();
            app.connect($(this));
        });

    },
    connect: function(tis) {
        var id          = tis.data('id'),
            name        = tis.data('name'),
            onConnect   = function() {

                // TODO check if we have the battery service
                // TODO check if the battery service can notify us
                //ble.startNotification(deviceId, battery.service, battery.level, app.onBatteryLevelChange, app.onError);
                //batteryStateButton.dataset.deviceId = deviceId;
                //disconnectButton.dataset.deviceId = deviceId;
               // app.showDetailPage();

                $('#detailPage h1').text(name);
                $('#batteryStateButton').on('click',function(e){
                    e.preventDefault();
                    app.writeData(id);
                });

                $('#detailPage').show();
                $('#mainPage').hide();
            };

        ble.connect(id, onConnect, app.onError);
    },
    writeData: function(id){
        var success = function(){
            alert('wrote');
        },
        failure = function(){
            alert('failed writting');
        },
        data = new Uint8Array(1),
        data[0] = '0x0A';

        ble.write(id, "FF10", "FF11", data.buffer, success, failure);
    },
    ascii_to_hexa: function(str){
        var arr1 = [];
        for (var n = 0, l = str.length; n < l; n ++) 
         {
            var hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
         }
        return arr1.join('');
    },
    onBatteryLevelChange: function(data) {
        console.log(data);
        var message;
        var a = new Uint8Array(data);
        batteryState.innerHTML = a[0];
    },
    readBatteryState: function(event) {
        console.log("readBatteryState");
        var deviceId = event.target.dataset.deviceId;
        ble.read(deviceId, battery.service, battery.level, app.onReadBatteryLevel, app.onError);
    },
    onReadBatteryLevel: function(data) {
        console.log(data);
        var message;
        var a = new Uint8Array(data);
        batteryState.innerHTML = a[0];
    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};