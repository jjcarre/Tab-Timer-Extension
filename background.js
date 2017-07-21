chrome.alarms.onAlarm.addListener( function(alarm) {
    var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    var url = re.exec(alarm.name);
    var active = parseActive(alarm.name);
    chrome.tabs.create({'url': url[0], 'active' : active}, function(){});
});

function parseActive(id) {
    var re = /(true|false)/;
    var active = re.exec(id);
    if (active[0] == "true") {
        return true;
    } else {
        return false;
    }
}