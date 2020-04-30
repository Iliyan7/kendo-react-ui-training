import { decorate, observable, action, runInAction } from 'mobx'
import { API_KEY, CLIENT_ID, DISCOVERY_URLS, scopes, } from '../constants/googleAPI'

class Store {
    GoogleAuth
    user
    isAuthorized = false
    mailbox = []
    calendar = []
    contacts = []
    contactsPageToken = ''

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

                if(this.isAuthorized) {
                    this.fetchMailbox()
                    // this.fetchCalendar()
                    this.fetchContacts()
                }
            });
        });
    }

    handleAuthClick() {
        console.log('handleAuthClick', this.isAuthorized)

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
        runInAction(() => {
            this.isAuthorized = this.GoogleAuth.isSignedIn.get() //this.user.hasGrantedScopes('https://www.googleapis.com/auth/gmail.readonly');
        })
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
        let request = window.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'orderBy': 'startTime',
            // 'timeMin': (new Date()).toISOString(),
            // 'showDeleted': false,
            // 'singleEvents': true,
            // 'maxResults': 10,
        })

        request.execute((response) => {
            console.log(response)

            const events = response.result.items;

            events.forEach((e) => {
                const event = { date: e.start.date }
                this.calendar.push(event)
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
                    console.log(person.names[0].displayName, person)
                    
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