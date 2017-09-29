var battery = {
    service: "180F",
    level: "2A19"
};

var app = {
    initialize: function() {
         alert('initialize');
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

                //  check if we have the battery service
                //  check if the battery service can notify us
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
        data = stringToBytes('0x0A');

        ble.writeWithoutResponse(id, "0002", "0003", data, success, failure);
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
    }
};