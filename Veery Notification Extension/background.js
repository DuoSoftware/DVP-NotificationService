/**
 * Created by Pawan on 5/17/2016.
 */
// Returns a new notification ID used in the notification.



function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}

function messageReceived(message) {
    // A message is an object with a data property that
    // consists of key-value pairs.

    // Concatenate all key-value pairs to form a display string.
    var myNotificationID = null;
    var listArr=[];
    var topicString="";
    var messageString = "";
    for (var key in message.data) {

        var fixedKey= key.split(".")[2];
        var listItem={ title: fixedKey, message: message.data[key]};
        listArr.push(listItem);

        if(fixedKey=="eventName")
        {
            topicString=message.data[key];
        }

        /* if (messageString != "")
         messageString += '\n'
         messageString += key + " : " + message.data[key];*/


    }
    console.log("Message received: " + messageString);

    // Pop up a notification to show the GCM message.
    chrome.notifications.create(getNotificationId(), {
        title: topicString,
        iconUrl: 'veery.png',
        type: 'list',
        message: messageString,
        buttons: [{
            title: "Add to Calender"
        }, {
            title: "Cancel"

        }],
        items:listArr
    }, function(id) {myNotificationID = id;});
}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === myNotificationID) {
        if (btnIdx === 0) {
            sayOK();
        } else if (btnIdx === 1) {
            saySorry();
        }
    }
});



/* Add this to also handle the user's clicking
 * the small 'x' on the top right corner */
chrome.notifications.onClosed.addListener(function() {
    saySorry();
});

function saySorry() {
    alert("Sorry to bother you !");
}
function sayOK() {
    alert("OKKKKK !");
}

var registerWindowCreated = false;

function firstTimeRegistration() {
    chrome.storage.local.get("registered", function(result) {
        // If already registered, bail out.
        if (result["registered"])
            return;

        registerWindowCreated = true;
        chrome.app.window.create(
            "index.html",
            {  width: 500,
                height: 400,
                frame: 'chrome'
            },
            function(appWin) {}
        );
    });
}

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(messageReceived);


// Set up listeners to trigger the first time registration.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);