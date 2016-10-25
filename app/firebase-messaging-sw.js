/**
 * Created by Luis Macias on 25/10/2016.
 */
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-messaging.js');

var config = {
	apiKey           : "AIzaSyAW9HLtzFbMjIcVC9kZaoXFp4AbH0m2bHM",
	authDomain       : "api-crm-f87c8.firebaseapp.com",
	databaseURL      : "https://api-crm-f87c8.firebaseio.com",
	storageBucket    : "api-crm-f87c8.appspot.com",
	messagingSenderId: "738619244670"
};
firebase.initializeApp(config);

var messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function (payload) {
	// Customize notification here
	const notificationTitle   = payload.notification.title;
	const notificationOptions = {
		body: payload.notification.body,
		icon: '/firebase-logo.png'
	};
	
	return self.registration.showNotification(notificationTitle,
		notificationOptions);
});
// [END background_handler]