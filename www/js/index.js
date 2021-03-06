var battery = {
    service: "180F",
    level: "2A19"
};

window.onerror = function(messageOrEvent, source, lineno, colno, error) {
    var error = messageOrEvent+ ' | ' + source + ' | ' + lineno + ' | ' + colno + ' | ' + error;
    $('#error').prepend(error);
}

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        //batteryStateButton.addEventListener('touchstart', this.readBatteryState, false);
        //disconnectButton.addEventListener('touchstart', this.disconnect, false);
        //deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {

        //var enc = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode('Probando encoding');
        //app.thalog('Probando encoding: '+enc);

        ble.isEnabled(function(){
            //bluetooth is on
            app.refreshDeviceList();
            $('#refreshButton').on('click',function(e){
                e.preventDefault();
                app.refreshDeviceList();
            });
        }, function(){
            //its oof
            alert('Debe activar el bluetooth de su dispositivo');
        });
    },
    refreshDeviceList: function() {
        $('#deviceList').html('');
        // scan for all devices
        //ble.startScanWithOptions([],{ reportDuplicates: false }, app.onDiscoverDevice, app.onError);
        ble.scan([], 5, app.onDiscoverDevice, app.onError);
        setTimeout(function(){
            ble.stopScan(null, null);
        },3000);
    },
    listedArray: [],
    onDiscoverDevice: function(device) {
        if(!app.listedArray[device.id]){
            var html = '<a href="#'+device.id+'" data-id="'+device.id+'" data-name="'+device.name+'"><b>' + device.name + '</b><br/>' +
                    'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                    device.id + '</a><br>';

            $('#deviceList').append(html);

            $('#deviceList a').on('click',function(e){
                e.preventDefault();
                app.connect($(this));
            });

            app.listedArray[device.id] = true;
        }
    },
    connect: function(tis) {
        var id          = tis.data('id'),
            name        = tis.data('name'),
            onConnect   = function() {

                //  check if we have the battery service
                //  check if the battery service can notify us
                //ble.startNotification(deviceId, battery.service, battery.level, app.onBatteryLevelChange, app.onError);
                //batteryStateButton.dataset.deviceId = deviceId;
                //disconnectButton.dataset.deviceId = deviceId;
               // app.showDetailPage();

               ble.stopScan(null, null);

                $('#detailPage h1').text(name);

                app.thalog('conected: '+id);

                $('#detailPage').show();
                $('#mainPage').hide();

                $('#batteryStateButton').on('click',function(e){
                    e.preventDefault();
                    app.thalog('sending order to write data: '+id);
                    app.writeData(id);
                });
            };

        ble.connect(id, onConnect, app.onError);
    },
    writeData: function(id,text){
        var success     = function(){
            alert('wrote');
        },
        failure         = function(){
            alert('failed writting');
        },
        text            = $('#text').val();
        //uint8array      = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(text);
        //data = app.stringToBytes(text);
        var bited =  app.stringToBytes(app.convertToHex(text));
        var uint8array = new Uint8Array(5);
            uint8array[0] = 0x0A; 
            uint8array[1] = 0x6f702f6e; 
            uint8array[2] = 0x69; 
            uint8array[3] = 0x0A; 
            uint8array[4] = 0x0A; 

        app.thalog('converting to byte: '+text);

        app.thalog('writing to: '+id+' data: '+uint8array.buffer);

        var serviceUUID         = "18F0";// IOS ONLY
        var writeCharacteristic = "2AF1"; //IOS ONLY
        var readCharacteristic  = "2AF0"; //IOS ONLY

        ble.write(id, serviceUUID, writeCharacteristic, app.stringToBytes(text), success, failure);
        //ble.write(id, "FF10", "FF11", data, success, failure);
    },
    ascii_to_hexa: function(str){
        var arr1 = [];
        for (var n = 0, l = str.length; n < l; n ++) {
            var hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
         }
        return arr1.join('');
    },
    convertToHex: function(str) {
        var hex = '';
        for(var i=0;i<str.length;i++) {
            hex += ''+str.charCodeAt(i).toString(16);
        }
        return hex;
    },
    stringToBytes: function(string) {
       var array = new Uint8Array(string.length);
       for (var i = 0, l = string.length; i < l; i++) {
           array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    },
    bytesToString: function(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
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
    },
    thalog: function(text){
        $('#log').prepend('- '+text+'<br>');
    }
};