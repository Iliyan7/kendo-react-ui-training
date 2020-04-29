import { decorate, observable, action, runInAction } from 'mobx'
import { DISCOVERY_URL, scopes, API_KEY, CLIENT_ID } from '../constants/googleAPI'

class Store {
    GoogleAuth
    user
    isAuthorized = false
    mailbox = []
    calendar = []
    contacts = []

    constructor() {
        this.initClient();
        this.updateSigninStatus = this.updateSigninStatus.bind(this)
    }

    initClient() {
        window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
                'apiKey': API_KEY,
                'clientId': CLIENT_ID,
                'discoveryDocs': [DISCOVERY_URL],
                'scope': scopes.GMAIL_READONLY
            }).then(() => {
                this.GoogleAuth = window.gapi.auth2.getAuthInstance();

                this.GoogleAuth.isSignedIn.listen(this.updateSigninStatus);

                this.user = this.GoogleAuth.currentUser.get();
                this.setSigninStatus();

                if(this.isAuthorized) {
                    this.fetchMailbox()
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
            this.isAuthorized = this.user.hasGrantedScopes('https://www.googleapis.com/auth/gmail.readonly');
        })
    }

    updateSigninStatus(isSignedIn) {
        this.setSigninStatus();
    }

    resetData() {
        this.mailbox = []
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

                    const meil = { sender, subject, date, content }
                    this.mailbox.push(meil)
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