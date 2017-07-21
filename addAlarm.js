//Fill table when options page is loaded
$(document).ready(function() {
    fillTable();
});

// Hide the alarm modal when clicked away from
$(window).click(function(e) {
    if (e.target.id == "alarmModal") {
        $("#alarmModal").css("display", "none");
    }
});

// Hide the edit modal when clicked away from
$(window).click(function(e) {
    if (e.target.id == "editModal") {
        $("#editModal").css("display", "none");
    }
});

// Delete selected alarm when clicked
$(document).on('click', "a.delete", function(e) {
    var alarmId = $(e.currentTarget).attr('value');
    chrome.alarms.clear(alarmId);
    fillTable();
    e.preventDefault();
});

// Display and set values for alarm modal
$(document).on('click', "#newAlarm", function(e) {
     var d = formatDate(new Date());
    $('#addTime').prop('min', d);
    $('#addTime').prop('value', d);
    $("#alarmModal").css("display", "block");
    e.preventDefault();
});

// Display and set values for edit modal
$(document).on('click', "a.edit", function(e) {
    var alarmId = $(e.currentTarget).attr('value');
    chrome.alarms.get(alarmId, function(alarm) {
        var url = getUrlFromId(alarm.name);
        var active = parseActive(alarm.name);
        var repeat = minutesToRepeat(alarm.periodInMinutes);
        var d = formatDate(new Date(alarm.scheduledTime));
        $('#editTime').prop('min', formatDate(new Date()));
        $('#editTime').prop('value', d);
        $('#editURL').prop('value', url);
        $('#editActive').prop('value', active);
        $('#editRepeat').prop('value', repeat);
        $('#hiddenEdit').prop('value', alarmId);
    });
    $("#editModal").css("display", "block");
    e.preventDefault();
});

// Create new alarm and hide alarm modal
$(document).on('submit', '#alarmForm', function(event) {
    var d = new Date($("#addTime").val());
    var alarmUrl = $("#addURL").val();
    var repeat = $("#addRepeat").val();
    var active = $('#addActive').val()
    chrome.alarms.create( new Date().getTime() + '-' + active + '-' + alarmUrl, {'when': d.getTime(), 'periodInMinutes': repeatToMinutes(repeat)});
    fillTable();
    $("#alarmModal").css("display", "none");
    event.preventDefault();  
});

// Modify current alarm and hide edit modal
$("#editForm").submit(function(event) {
    var d = new Date($("#editTime").val());
    var alarmUrl = $("#editURL").val();
    var repeat = $("#editRepeat").val();
    var alarmId = $("#hiddenEdit").val();
    var active = $('#editActive').val();
    chrome.alarms.clear(alarmId);
    chrome.alarms.create( new Date().getTime() + '-' + active + '-' + alarmUrl, {'when': d.getTime(), 'periodInMinutes': repeatToMinutes(repeat)});
    fillTable();
    $("#editModal").css("display", "none");
    event.preventDefault();  
});

// Fills the alarm table
function fillTable() {
    $('#alarms tr').not(':first').remove();
    chrome.alarms.getAll(function(result){
        for (a in result) {
            var alarm = result[a];
            var url = getUrlFromId(alarm.name);
            var active = parseActive(alarm.name);
            var d = new Date(alarm.scheduledTime);
            var hour = d.getHours();
            var minute = d.getMinutes();
            if (hour < 10) {
                hour = '0' + hour;    
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            $("#alarms tr:last").after("<tr><td>" + url + "</td><td>" + d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + hour + ":" + minute + "</td><td>" + minutesToRepeat(alarm.periodInMinutes) + "</td><td>" + active + "</td><td><a class=\"delete\" href=\"#\" value=\"" + alarm.name + "\"><i class=\"fa fa-trash\"></i></a><a class=\"edit\" href=\"#\" value=\"" + alarm.name + "\"><i class=\"fa fa-pencil-square-o\"></i></a></td></tr>");
        }
    });
}

// Formats a date object for use in chrome.alarms
function formatDate(d) {
    var month = (d.getMonth() + 1);
    var date = d.getDate();
    var hour = d.getHours()
    var minute = d.getMinutes()
    if (date < 10) {
        date = '0' + date;   
    }
    if (month < 10) {
        month = '0' + month;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    return d.getFullYear() + '-' + month + '-' + date + 'T' + hour + ':' + minute + ':00';
}

// Formats a repeat string to a value in minutes
function repeatToMinutes(r) {
    switch(r) {
        case 'once':
            return null;
        case 'daily':
            return 1440;
        case 'weekly':
            return 10080;
        case 'year' :
            return 525600;
    }
}

// Formats an integer to a string.
function minutesToRepeat(m) {
    switch(m) {
        
        case 1440:
            return 'daily';
        case 10080:
            return 'weekly';
        case 525600:
            return 'yearly'
        default:
            return 'once';
    }
}

function getUrlFromId(id) {
    var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    var url = re.exec(id);
    return url[0];
}

function parseActive(id) {
    var re = /(true|false)/;
    var active = re.exec(id);
    return active[0];
}