//Initialize the map**********************************************************************************************
var map = L.map('mapid').setView([52.2347792, 20.9563998], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Onur Caglayan and Erol Gungor',
}).addTo(map);


//Array for saving waypoints**************************************************************************************
waypoints = [];
waypointArrivals = [];
waypointNo = 0;


//Waypoint Table**************************************************************************************************
var table = document.getElementById("routetable");


//Get User's Location*********************************************************************************************
var current_position;
var current_position_flag = 0;
var geocodeService = L.esri.Geocoding.geocodeService();
var tmpAddress;

function locate() {
    map.locate().on('locationfound', function (e) {
        if (current_position) {
            map.removeLayer(current_position);
        }
        const { lat, lng } = e.latlng;
        current_position = L.marker([lat, lng]).addTo(map);
        waypoints.push([lat, lng]);
        geocodeService.reverse().latlng([lat, lng]).run(function (error, result) {
            if (error) {
                return;
            }
            tmpAddress = result.address.Match_addr;
        });
    })
}

function saveIt() {
    var row = table.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    waypointNo = waypointNo + 1;
    cell1.innerHTML = waypointNo;
    cell2.innerHTML = tmpAddress;
    cell3.innerHTML = document.getElementById("arrivaltime").value;
    if (waypointNo > 1) {
        waypointArrivals.push(document.getElementById("arrivaltime").value);
    }
    if (document.getElementById("waypointnote").value != "") {
        var button = document.createElement("button");
        button.innerHTML = "Waypoint Note";
        var wypnote = document.getElementById("waypointnote").value;
        button.addEventListener("click", () => {
            alert(wypnote);
        });
        cell4.appendChild(button);
    }
    document.getElementById("address").value = "";
    document.getElementById("arrivaltime").value = "";
    document.getElementById("waypointnote").value = "";
}

function positiontopath() {
    if (current_position_flag < 1 && document.getElementById("arrivaltime").value == "" && waypointNo == 0) {
        locate();
        setTimeout(saveIt, 2000);
        current_position_flag = current_position_flag + 1;
    }
    else {
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
}


//Address input to path*******************************************************************************************
function addresstopath() {
    if ((document.getElementById("address").value != "" && document.getElementById("arrivaltime").value == "") || ((waypointNo > 0) && document.getElementById("address").value != "")) {
        findCoordinates(document.getElementById("address").value);
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        waypointNo = waypointNo + 1;
        cell1.innerHTML = waypointNo;
        cell2.innerHTML = document.getElementById("address").value;
        cell3.innerHTML = document.getElementById("arrivaltime").value;
        if (waypointNo > 1) {
            waypointArrivals.push(document.getElementById("arrivaltime").value);
        }
        if (document.getElementById("waypointnote").value != "") {
            var button = document.createElement("button");
            button.innerHTML = "Waypoint Note";
            var wypnote = document.getElementById("waypointnote").value;
            button.addEventListener("click", () => {
                alert(wypnote);
            });
            cell4.appendChild(button);
        }
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
    else {
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
}


//Geocoding*******************************************************************************************************
addresstopathMarkers = [];
var search = L.esri.Geocoding.geocode();

function findCoordinates(address) {
    search.text(address).run((err, results, response) => {
        const { lat, lng } = results.results[0].latlng;
        addresstopathMarkers.push(L.marker([lat, lng]).addTo(map).bindPopup(document.getElementById("waypointnote").value));
        waypoints.push([lat, lng]);
    });
}


//Calculate Route with GraphHopper and start realtime location****************************************************
var fakeCounter = 0;
var fakeMove = [[52.24219, 20.94087],
[52.24203, 20.94095],
[52.24201, 20.94102],
[52.24203, 20.94119],
[52.24654, 20.93887],
[52.24677, 20.93889],
[52.24677, 20.9384],
[52.24684, 20.93658],
[52.24682, 20.9362],
[52.24674, 20.93567],
[52.24672, 20.93533],
[52.24684, 20.93252],
[52.24687, 20.93118],
[52.24707, 20.92723],
[52.2471, 20.92713],
[52.24721, 20.92644],
[52.24731, 20.92567],
[52.24736, 20.92477],
[52.24741, 20.92443],
[52.24615, 20.92442],
[52.24585, 20.92452],
[52.24471, 20.92509],
[52.24585, 20.92452],
[52.24615, 20.92442],
[52.24741, 20.92443],
[52.24745, 20.92421],
[52.24756, 20.92381],
[52.2477, 20.92346],
[52.24823, 20.9223],
[52.24832, 20.92207],
[52.24891, 20.92079],
[52.24878, 20.92059],
[52.24852, 20.92025],
[52.24843, 20.92009],
[52.24835, 20.91992],
[52.2482, 20.91938],
[52.24797, 20.9146],
[52.24785, 20.91275],
[52.24774, 20.91138],
[52.24773, 20.91095],
[52.24753, 20.91103],
[52.24677, 20.91142],
[52.24662, 20.91147],
[52.24209, 20.91239],
[52.24211, 20.91274],
[52.24219, 20.91357],
[52.24203, 20.91361],
[52.24189, 20.91361],
[52.24176, 20.91354],
[52.2416, 20.91332],
[52.24149, 20.91324],
[52.2409, 20.91332],
[52.24076, 20.91343],
[52.24062, 20.9137],
[52.2401, 20.91457],
[52.24002, 20.91484],
[52.23996, 20.91521],
[52.24007, 20.91528],
[52.24033, 20.91574],
[52.24007, 20.91528],
[52.23996, 20.91521],
[52.23998, 20.91567],
[52.24029, 20.91799],
[52.23959, 20.91824],
[52.2398, 20.91985],
[52.23984, 20.92001],
[52.23998, 20.92039],
[52.24004, 20.92088],
[52.24005, 20.92115],
[52.23999, 20.92151],
[52.24006, 20.92201],
[52.24037, 20.92322],
[52.24066, 20.92548],
[52.24073, 20.92628],
[52.24075, 20.92703],
[52.24071, 20.92791],
[52.24058, 20.92925],
[52.24046, 20.92961],
[52.24044, 20.92969],
[52.24029, 20.93142],
[52.24032, 20.93196],
[52.23997, 20.93544],
[52.23985, 20.93554],
[52.2398, 20.93565],
[52.23978, 20.93572],
[52.23971, 20.93624],
[52.23957, 20.93809],
[52.23916, 20.94265],
[52.2382, 20.95238],
[52.23795, 20.95449],
[52.23775, 20.95565],
[52.23771, 20.95599],
[52.2377, 20.95615],
[52.23772, 20.95633],
[52.23773, 20.95787],
[52.23767, 20.95949],
[52.23743, 20.96196],
[52.23728, 20.96331],
[52.23711, 20.96524],
[52.23681, 20.96832],
[52.23676, 20.96919],
[52.23675, 20.97023],
[52.23679, 20.97085],
[52.23694, 20.97196],
[52.23525, 20.9726],
[52.23478, 20.97274],
[52.23511, 20.97409],
[52.23532, 20.97483],
[52.23568, 20.97629],
[52.23567, 20.97657],
[52.23565, 20.97661],
[52.23557, 20.97667],
[52.23534, 20.97672],
[52.23528, 20.97581]];
var control;
var segmentTimes = [];
var realtime_position;
var realtime_accuracy;
var watchPositionID;

function realtime_location() {
    setInterval(onLocationFound, 1000);
}

function onLocationFound() {
    if (realtime_position) {
        map.removeLayer(realtime_position);
    }
    realtime_position = L.marker(fakeMove[fakeCounter]);
    fakeCounter = fakeCounter + 1;
    realtime_position.addTo(map).bindPopup("Fake roaming").openPopup();
    nextWaypoint([realtime_position.getLatLng().lat, realtime_position.getLatLng().lng]);
    isAbleToCatch();
}

function calculateRoute() {
    if (waypoints.length >= 2) {
        control = L.Routing.control({
            waypoints,
            routeWhileDragging: true,
            router: L.Routing.graphHopper('d9af332d-2991-4fa4-ae96-8867d72b2f95')
        });
        control.addTo(map);
        control.on('routesfound', function (e) {
            var i = 0;
            e.routes[0].instructions.forEach(element => {
                if (element.type == "WaypointReached" || element.type == "DestinationReached") {
                    segmentTimes.push(0);
                }
            });
            e.routes[0].instructions.forEach(element => {
                if (element.type != "WaypointReached" && element.type != "DestinationReached") {
                    segmentTimes[i] = segmentTimes[i] + element.time;
                }
                else {
                    i++;
                }
            });
        });
        realtime_location();
    }
}


//Function which detects we are at next waypoint******************************************************************
var currentTargetWaypoint = 1;
var currentTargetWaypoint_cmp = 0;
function nextWaypoint(real_pos) {
    var distance = getDistance(real_pos, waypoints[currentTargetWaypoint]);
    if (distance < 30) {
        currentTargetWaypoint = currentTargetWaypoint + 1;
    }
}


//Notification function******************************************************************************************
var notificationtable = document.getElementById("notificationtable");

function isAbleToCatch() {
    if (currentTargetWaypoint != currentTargetWaypoint_cmp) {
        var currentTime = new Date();
        var arrivalTime = new Date();

        arrivalTime.setHours(waypointArrivals[currentTargetWaypoint - 1].substring(0, 2));
        arrivalTime.setMinutes(waypointArrivals[currentTargetWaypoint - 1].substring(3, 5));

        currentTime.setMinutes(currentTime.getMinutes() + Math.round(segmentTimes[currentTargetWaypoint - 1] / 60));

        if (currentTime.getHours() < arrivalTime.getHours() || ((currentTime.getHours() == arrivalTime.getHours()) && (currentTime.getMinutes() <= arrivalTime.getMinutes()))) {
            var today = new Date();
            var output_hours, output_minutes;
            if (today.getHours() < 10) { output_hours = "0" + today.getHours(); }
            else { output_hours = today.getHours(); }
            if (today.getMinutes() < 10) { output_minutes = "0" + today.getMinutes(); }
            else { output_minutes = today.getMinutes(); }

            arrivalTime.setMinutes(arrivalTime.getMinutes() - Math.round(segmentTimes[currentTargetWaypoint - 1] / 60));
            var output_hours2, output_minutes2;
            if (arrivalTime.getHours() < 10) { output_hours2 = "0" + arrivalTime.getHours(); }
            else { output_hours2 = arrivalTime.getHours(); }
            if (arrivalTime.getMinutes() < 10) { output_minutes2 = "0" + arrivalTime.getMinutes(); }
            else { output_minutes2 = arrivalTime.getMinutes(); }

            var row = notificationtable.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = output_hours + ":" + output_minutes;
            cell2.innerHTML = "You should start your journey at least at " + output_hours2 + ":" + output_minutes2;
        }
        else {
            var today = new Date();
            var output_hours, output_minutes;
            if (today.getHours() < 10) { output_hours = "0" + today.getHours(); }
            else { output_hours = today.getHours(); }
            if (today.getMinutes() < 10) { output_minutes = "0" + today.getMinutes(); }
            else { output_minutes = today.getMinutes(); }

            var row = notificationtable.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = output_hours + ":" + output_minutes;
            cell2.innerHTML = "You cannot be there at desired time";
        }
        currentTargetWaypoint_cmp = currentTargetWaypoint_cmp + 1;
    }
}


//Distance calculation by coordinates*****************************************************************************
function getDistance(origin, destination) {
    // return distance in meters
    var lon1 = toRadian(origin[1]),
        lat1 = toRadian(origin[0]),
        lon2 = toRadian(destination[1]),
        lat2 = toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}


//Some utility functions******************************************************************************************
function deleteLastRow(tableID) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    table.deleteRow(rowCount - 1);
}


//Reset***********************************************************************************************************
function reset() {
    //Remove realtime position marker
    if (realtime_position) {
        map.removeLayer(realtime_position);
        realtime_position = undefined;
    }

    //Remove Control from maps
    map.removeControl(control);

    //Reset values
    currentTargetWaypoint = 1;
    currentTargetWaypoint_cmp = 0;

    //Reset our Main Control
    control = undefined;

    //Empty our segment times array
    segmentTimes = [];

    //Remove "Address to Path" markers
    addresstopathMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    addresstopathMarkers = [];

    //Reset our temprorary address
    tmpAddress = undefined;

    //Reset our current position flag
    current_position_flag = 0;

    //Remove current position marker
    if (current_position) {
        map.removeLayer(current_position);
        current_position = undefined;
    }

    //Clear the input areas
    document.getElementById("address").value = "";
    document.getElementById("arrivaltime").value = "";
    document.getElementById("waypointnote").value = "";

    //Reset routing table
    var tableHeaderRowCount = 1;
    var table = document.getElementById('routetable');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }

    //Reset notification table
    tableHeaderRowCount = 1;
    table = document.getElementById('notificationtable');
    rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }

    //Reset our waypoint no
    waypointNo = 0;

    //Empty our waypoint arrivals
    waypointArrivals = [];

    //Empty our waypoints array
    waypoints = [];
}