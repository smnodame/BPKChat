import realm from './realm/realm'
import populate from './dataGenerator'

class DataProvider {

  getUser(id = 1) {
    return realm.objects('User').filtered(`id=${id}`)[0];
  }

  getUsers() {
    return realm.objects('User');
  }

  getConversation(userId = 1) {
    return realm.objects('Conversation').filtered(`withUser.id=${userId}`)[0];
  }

  getChatList() {
    return realm.objects('Conversation');
  }

  populateRealm() {
    populate();
  }
}

export let data = new DataProvider();
