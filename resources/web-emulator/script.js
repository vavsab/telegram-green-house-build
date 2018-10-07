var socket = io('/');

$(function () {
    var config;
    var currentData;
    var windowsChangePromise = Promise.resolve();

    function onWaterChanged(isOn) {
        $('#water-state').text(isOn ? 'Включено' : 'Выключено');
    }

    function onLightsChanged(isOn) {
        $('#lights-state').text(isOn ? 'Включено' : 'Выключено');
    }

    function onWindowsChanged(windows) {
        windowsChangePromise = windowsChangePromise.then(function (resolve) {
            if (currentData != null && JSON.stringify(currentData.windows) == JSON.stringify(windows)) {
                resolve();
                return;
            }
            
            let table = $('<table></table>');
            for (var i = 0; i < windows.length; i++) {
                let window = windows[i];
                let optionsHtml = '';

                for (var j = 0; j < config.windowStates.length; j++) {
                    var state = config.windowStates[j];
                    optionsHtml += '<option' + (state == window.state ? ' selected' : '') + '>' + state + '</option>\n';
                }
                
                let row = $.parseHTML('\
                    <tr>\
                        <td><b>Окно ' + window.address + '</b></td>\
                        <td>\
                            <select class="window_select">' + optionsHtml + '</select>\
                        </td>\
                    </tr>');

                let select = $(row).find('.window_select').first();
                select.change(function() {
                    socket.emit('windows', window.address, select.val());
                });

                table.append(row);
            }
                
            $('#windows-state').empty().append(table);
            resolve();
        });
    }

    socket.on('water-changed', onWaterChanged);
    socket.on('lights-changed', onLightsChanged);
    socket.on('windows-changed', onWindowsChanged);

    $.get('/api/config', function (data) {
        if (data.linkToRepository) {
            $('#forkMeLink').attr('href', data.linkToRepository).css('display', 'block');
        }

        if (data.linkToPanel) {
            $('#panelLink').attr('href', data.linkToPanel).css('display', 'block');
        }

        if (data.linkToBot) {
            $('#botLink').attr('href', data.linkToBot).css('display', 'block');
        }

        config = data;
    });

    $.get('/api/data', function (data) {
        onWaterChanged(data.isWaterOn);
        onLightsChanged(data.isLightsOn);
        onWindowsChanged(data.windows);
        currentData = data;

        var temperatureHandle = $('#handle-temperature');
        var humidityHandle = $('#handle-humidity');

        $('#slider-temperature').slider({
            value: data.temperature,
            create: function () {
                temperatureHandle.text($(this).slider('value') + '°C');
            },
            slide: function (event, ui) {
                var value = ui.value;
                temperatureHandle.text(value + '°C');
                socket.emit('temperature', value);
            }
        });

        $('#slider-humidity').slider({
            value: data.humidity,
            create: function () {
                humidityHandle.text($(this).slider('value') + '%');
            },
            slide: function (event, ui) {
                var value = ui.value;
                humidityHandle.text(value + '%');
                socket.emit('humidity', value);
            }
        });
    });
} );