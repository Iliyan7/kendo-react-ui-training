import { decorate, observable, action, runInAction } from 'mobx'
import { API_KEY, CLIENT_ID, DISCOVERY_URLS, scopes, } from '../constants/googleAPI'

class Store {
    GoogleAuth
    user
    isAuthorized = false
    mailbox = []
    calendar = []
    contacts = []
    mailboxPageToken = ''
    contactsPageToken = ''
    calendarPageToken = ''

    constructor() {
        this.initClient();
        this.updateSigninStatus = this.updateSigninStatus.bind(this)
    }

    initClient() {
        window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
                'apiKey': API_KEY,
                'clientId': CLIENT_ID,
                'discoveryDocs': DISCOVERY_URLS,
                'scope': `${scopes.GMAIL_READONLY} ${scopes.CALENDAR_READONLY} ${scopes.CONTACTS_READONLY}`
            }).then(() => {
                this.GoogleAuth = window.gapi.auth2.getAuthInstance();

                this.GoogleAuth.isSignedIn.listen(this.updateSigninStatus);

                this.user = this.GoogleAuth.currentUser.get();
                this.setSigninStatus();
            });
        });
    }

    handleAuthClick() {
        if (this.GoogleAuth.isSignedIn.get()) {
            this.GoogleAuth.signOut();
            this.resetData()
        } else {
            this.GoogleAuth.signIn();
        }
    }

    revokeAccess() {
        this.GoogleAuth.disconnect();
    }

    setSigninStatus(isSignedIn) {
        console.log('isAuthorized prop: ', this.isAuthorized, 'isSignedIn: ', this.GoogleAuth.isSignedIn.get());

        runInAction(() => {
            this.isAuthorized = this.GoogleAuth.isSignedIn.get() //this.user.hasGrantedScopes('https://www.googleapis.com/auth/gmail.readonly');
        })

        if(this.isAuthorized) {
            console.log('[authorized] fetch data!')
            this.fetchMailbox()
            this.fetchCalendar()
            this.fetchContacts()
        }
    }

    updateSigninStatus(isSignedIn) {
        this.setSigninStatus();
    }

    resetData() {
        this.mailbox = []
        this.calendar = []
        this.contacts = []
    }

    fetchMailbox() {
        const userId = this.user.Ca

        let request = window.gapi.client.gmail.users.messages.list({
            'userId': userId,
            'labelIds': ['INBOX'],
        })

        request.execute((response) => {
            const messages = response.messages;

            messages.forEach(m => {
                let messageRequest = window.gapi.client.gmail.users.messages.get({
                    'userId': userId,
                    'id': m.id,
                })

                messageRequest.execute((message) => {
                    const headers = message.payload.headers;

                    const sender = headers.find(h => h.name === 'From').value;
                    const subject = headers.find(h => h.name === 'Subject').value;
                    const date = headers.find(h => h.name === 'Date').value;
                    const content = message.snippet;

                    const mail = { sender, subject, date, content }
                    this.mailbox.push(mail)
                })
            })
        })
    }

    fetchCalendar() {
        const parseAdjust = (eventDate) => {
            const date = new Date(eventDate);
            return date;
        };

        let request = window.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'orderBy': 'startTime',
            'singleEvents': true,
        })

        request.execute((response) => {
            const events = response.result.items;
            this.calendarPageToken = response.nextPageToken;

            events.forEach((e) => {
                let eventRequest = window.gapi.client.calendar.events.get({
                    'calendarId': 'primary',
                    'eventId': e.id
                })
                
                eventRequest.execute((event) => {
                    // console.log(event)

                    let isAllDay = false
                    let startDate, endDate;

                    if(event.start.hasOwnProperty('date')) {
                        startDate = parseAdjust(event.start.date)
                        isAllDay = true;
                    } else {
                        startDate = parseAdjust(event.start.dateTime)
                    }

                    if(event.end.hasOwnProperty('date')) {
                        endDate = parseAdjust(event.end.date)
                    } else {
                        endDate = parseAdjust(event.end.dateTime)
                    }

                    const eventData = { 
                        id: event.id,
                        start: startDate,
                        startTimezone: null,
                        end: endDate,
                        endTimezone: null,
                        isAllDay: isAllDay,
                        title: event.summary,
                        description: event.description,
                     }
                    this.calendar.push(eventData)

                })
            })
        })
    }

    fetchContacts() {
        let request = window.gapi.client.people.people.connections.list({
            resourceName: 'people/me',
            pageSize: 20,
            sortOrder: 'LAST_MODIFIED_DESCENDING',
            personFields: 'names'
        })

        request.execute((response) => {
            const people = response.connections;
            this.contactsPageToken = response.nextPageToken;
            console.log('Token page: ', this.contactsPageToken) // store this token to fetch next pages!

            people.forEach((p) => {
                let peopleRequest = window.gapi.client.people.people.get({
                    resourceName: p.resourceName,
                    personFields: 'names,emailAddresses,phoneNumbers,photos'
                })

                peopleRequest.execute((person) => {
                    // console.log(person.names[0].displayName, person)
                    
                    let name = ''
                    let email = 'n/a'
                    let phoneNumber = '';
                    let image = 'https://cdn.icon-icons.com/icons2/1736/PNG/512/4043260-avatar-male-man-portrait_113269.png'

                    if (person.hasOwnProperty('names') && person.names.length > 0) {
                        name = person.names[0].displayName;
                    }

                    if (person.hasOwnProperty('emailAddresses') && person.emailAddresses.length > 0) {
                        email = person.emailAddresses[0].value;
                    }

                    if (person.hasOwnProperty('phoneNumbers') && person.phoneNumbers.length > 0) {
                        phoneNumber = person.phoneNumbers[0].value;
                    }

                    if (person.hasOwnProperty('photos') && person.photos.length > 0) {
                        image = person.photos[0].url;
                    }

                    const personData = { name, email, phoneNumber, image }

                    runInAction(() => {
                        this.contacts.push(personData)
                    })
                })
            })
        })
    }
}

decorate(Store, {
    user: observable,
    isAuthorized: observable,
    mailbox: observable,
    calendar: observable,
    contacts: observable,
    setSigninStatus: action,
})

const storeInstance = new Store()
export default storeInstance;